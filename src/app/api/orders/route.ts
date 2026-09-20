import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createRazorpayOrder, getRazorpayKeyId } from '@/lib/payment/razorpay'
import { DELIVERY_FEE, PLATFORM_FEE, calculateETA } from '@/lib/constants'
import { createOrderSchema } from '@/lib/validations'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        store:stores(id, name),
        items:order_items(*),
        payment:payments(*),
        status_history:order_status_history(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API] Orders fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('[API] Orders error:', error)
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
    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 })
    }

    const { address_id, notes } = parsed.data

    // Get cart items
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          *,
          store:stores(id, name, latitude, longitude, preparation_time)
        )
      `)
      .eq('user_id', user.id)

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Get address
    const { data: address } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', address_id)
      .eq('user_id', user.id)
      .single()

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 400 })
    }

    // Validate stock for all items
    const serviceClient = await createServiceClient()
    for (const item of cartItems) {
      const { data: inventory } = await serviceClient
        .from('inventory')
        .select('quantity, reserved')
        .eq('product_id', item.product_id)
        .eq('size', item.size)
        .single()

      if (!inventory || (inventory.quantity - inventory.reserved) < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product?.name || 'product'} (size: ${item.size})` },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity
    }, 0)
    const total = subtotal + DELIVERY_FEE + PLATFORM_FEE

    // Get store from first cart item (MVP assumes single store per order)
    const store = Array.isArray(cartItems[0].product?.store) 
      ? cartItems[0].product?.store[0] 
      : cartItems[0].product?.store
    const storeId = store?.id

    if (!storeId) {
      return NextResponse.json({ error: 'Store not found' }, { status: 400 })
    }

    // Calculate ETA
    const { eta } = store 
      ? calculateETA(store.latitude, store.longitude, address.latitude || undefined, address.longitude || undefined, store.preparation_time)
      : { eta: 17 }

    // Generate order number
    const { count: orderCount } = await serviceClient
      .from('orders')
      .select('id', { count: 'exact', head: true })
    const orderNumber = `VN${(orderCount || 0) + 1000}`

    // Create order
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        store_id: storeId,
        address_id,
        status: 'PENDING_PAYMENT',
        subtotal,
        delivery_fee: DELIVERY_FEE,
        platform_fee: PLATFORM_FEE,
        total,
        estimated_delivery_time: eta,
        delivery_address_snapshot: {
          name: address.name,
          phone: address.phone,
          address_line: address.address_line,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        notes,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('[API] Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product?.name || '',
      product_image: item.product?.images?.[0]?.image_url || null,
      size: item.size,
      quantity: item.quantity,
      price: item.product?.price || 0,
      total: (item.product?.price || 0) * item.quantity,
    }))

    await serviceClient.from('order_items').insert(orderItems)

    // Record initial status
    await serviceClient.from('order_status_history').insert({
      order_id: order.id,
      status: 'PENDING_PAYMENT',
      changed_by: user.id,
      notes: 'Order created',
    })

    // Create Razorpay order
    let razorpayOrder = null
    try {
      razorpayOrder = await createRazorpayOrder({
        amount: total,
        receipt: order.order_number,
        notes: {
          order_id: order.id,
          order_number: order.order_number,
        },
      })

      // Create payment record
      await serviceClient.from('payments').insert({
        order_id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount: total,
        currency: 'INR',
        status: 'PENDING',
      })
    } catch (error) {
      console.error('[API] Razorpay order creation failed:', error)
      // Even if Razorpay fails, the order exists — allow demo mode fallback
    }

    return NextResponse.json({
      order,
      razorpay_order_id: razorpayOrder?.id,
      razorpay_key_id: getRazorpayKeyId(),
      amount: total * 100, // paise
    })
  } catch (error) {
    console.error('[API] Order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
