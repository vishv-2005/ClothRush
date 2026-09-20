import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { updateOrderStatusSchema } from '@/lib/validations'
import { canTransition, type OrderStatus } from '@/lib/constants'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = await createServiceClient()
    const { data: order, error } = await serviceClient
      .from('orders')
      .select(`
        *,
        store:stores(id, name, address, phone, latitude, longitude),
        items:order_items(*),
        payment:payments(*),
        status_history:order_status_history(*),
        address:addresses(*)
      `)
      .eq('id', id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Authorization check
    const role = profile?.role
    const isOwner = order.user_id === user.id
    const isStoreOwner = role === 'SELLER' // Simplified check
    const isAdmin = role === 'ADMIN'
    const isDelivery = role === 'DELIVERY_PARTNER'

    if (!isOwner && !isStoreOwner && !isAdmin && !isDelivery) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get delivery partner info if assigned
    let deliveryPartner = null
    if (order.delivery_partner_id) {
      const { data: dp } = await serviceClient
        .from('delivery_partners')
        .select('*')
        .eq('id', order.delivery_partner_id)
        .single()
      deliveryPartner = dp
    }

    // Get delivery assignment
    let assignment = null
    const { data: da } = await serviceClient
      .from('delivery_assignments')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    assignment = da

    return NextResponse.json({
      ...order,
      delivery_partner: deliveryPartner,
      delivery_assignment: assignment,
    })
  } catch (error) {
    console.error('[API] Order detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status: newStatus, reason } = body

    if (!newStatus) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const serviceClient = await createServiceClient()

    // Get current order
    const { data: order } = await serviceClient
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validate transition
    if (!canTransition(order.status as OrderStatus, newStatus as OrderStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${newStatus}` },
        { status: 400 }
      )
    }

    // Update order
    const updateData: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'CANCELLED') {
      updateData.cancellation_reason = reason || 'Cancelled'
    }

    const { error: updateError } = await serviceClient
      .from('orders')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // Record history
    await serviceClient.from('order_status_history').insert({
      order_id: id,
      status: newStatus,
      changed_by: user.id,
      notes: reason || `Status updated to ${newStatus}`,
    })

    // Handle cancellation — release stock
    if (newStatus === 'CANCELLED') {
      const { data: items } = await serviceClient
        .from('order_items')
        .select('product_id, size, quantity')
        .eq('order_id', id)

      if (items) {
        for (const item of items) {
          await serviceClient.rpc('release_stock', {
            p_product_id: item.product_id,
            p_size: item.size,
            p_quantity: item.quantity,
          })
        }
      }
    }

    // Handle delivery completion
    if (newStatus === 'DELIVERED') {
      // Confirm stock (convert reserved to sold)
      const { data: items } = await serviceClient
        .from('order_items')
        .select('product_id, size, quantity')
        .eq('order_id', id)

      if (items) {
        for (const item of items) {
          await serviceClient.rpc('confirm_stock', {
            p_product_id: item.product_id,
            p_size: item.size,
            p_quantity: item.quantity,
          })
        }
      }

      // Free up delivery partner
      if (order.delivery_partner_id) {
        await serviceClient
          .from('delivery_partners')
          .update({ availability: 'AVAILABLE', current_order_id: null })
          .eq('id', order.delivery_partner_id)

        // Update delivery assignment
        await serviceClient
          .from('delivery_assignments')
          .update({ status: 'DELIVERED', delivery_time: new Date().toISOString() })
          .eq('order_id', id)
          .eq('delivery_partner_id', order.delivery_partner_id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Order update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
