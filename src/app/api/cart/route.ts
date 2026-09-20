import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addToCartSchema } from '@/lib/validations'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: items, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          *,
          store:stores(id, name),
          images:product_images(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API] Cart fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
    }

    return NextResponse.json({ items: items || [] })
  } catch (error) {
    console.error('[API] Cart error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = addToCartSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 })
    }

    const { product_id, size, quantity } = parsed.data

    // Check stock availability
    const { data: inventory } = await supabase
      .from('inventory')
      .select('quantity, reserved')
      .eq('product_id', product_id)
      .eq('size', size)
      .single()

    if (!inventory || (inventory.quantity - inventory.reserved) < quantity) {
      return NextResponse.json({ error: 'Insufficient stock for selected size' }, { status: 400 })
    }

    // Check if item already exists in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .eq('size', size)
      .single()

    if (existing) {
      // Update quantity
      const newQuantity = existing.quantity + quantity
      if ((inventory.quantity - inventory.reserved) < newQuantity) {
        return NextResponse.json({ error: 'Not enough stock available' }, { status: 400 })
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existing.id)

      if (error) {
        return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
      }
    } else {
      // Insert new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id,
          size,
          quantity,
        })

      if (error) {
        console.error('[API] Cart insert error:', error)
        return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Cart error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (itemId) {
      // Delete specific item
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
      }
    } else {
      // Clear cart
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Cart delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, quantity } = body

    if (!id || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Verify ownership and check stock
    const { data: item } = await supabase
      .from('cart_items')
      .select('product_id, size')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    const { data: inventory } = await supabase
      .from('inventory')
      .select('quantity, reserved')
      .eq('product_id', item.product_id)
      .eq('size', item.size)
      .single()

    if (!inventory || (inventory.quantity - inventory.reserved) < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to update quantity' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Cart update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
