import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyPaymentSignature } from '@/lib/payment/razorpay'
import { verifyPaymentSchema } from '@/lib/validations'
import { IS_DEMO_MODE } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Demo mode: allow simulated payment
    if (IS_DEMO_MODE && body.demo_mode) {
      return handleDemoPayment(body, user.id)
    }

    const parsed = verifyPaymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 })
    }

    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data

    // Verify signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)

    const serviceClient = await createServiceClient()

    if (!isValid) {
      console.error('[Payment] Signature verification failed for order:', order_id)
      
      // Update payment as failed
      await serviceClient
        .from('payments')
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: 'FAILED',
          failure_reason: 'Signature verification failed',
        })
        .eq('order_id', order_id)

      // Update order status
      await serviceClient
        .from('orders')
        .update({ status: 'PAYMENT_FAILED' })
        .eq('id', order_id)

      await serviceClient.from('order_status_history').insert({
        order_id,
        status: 'PAYMENT_FAILED',
        changed_by: user.id,
        notes: 'Payment signature verification failed',
      })

      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Payment verified — update records
    await serviceClient
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'SUCCESS',
      })
      .eq('order_id', order_id)

    // Update order to CONFIRMED
    await serviceClient
      .from('orders')
      .update({ status: 'CONFIRMED' })
      .eq('id', order_id)

    await serviceClient.from('order_status_history').insert({
      order_id,
      status: 'CONFIRMED',
      changed_by: user.id,
      notes: 'Payment verified successfully',
    })

    // Reserve stock
    const { data: orderItems } = await serviceClient
      .from('order_items')
      .select('product_id, size, quantity')
      .eq('order_id', order_id)

    if (orderItems) {
      for (const item of orderItems) {
        await serviceClient.rpc('reserve_stock', {
          p_product_id: item.product_id,
          p_size: item.size,
          p_quantity: item.quantity,
        })
      }
    }

    // Clear cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    return NextResponse.json({ success: true, order_id })
  } catch (error) {
    console.error('[Payment] Verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleDemoPayment(body: { order_id: string; demo_success: boolean }, userId: string) {
  const serviceClient = await createServiceClient()
  const supabase = await createClient()

  if (body.demo_success) {
    // Simulate successful payment
    await serviceClient
      .from('payments')
      .update({
        razorpay_payment_id: `demo_pay_${Date.now()}`,
        razorpay_signature: 'demo_signature',
        status: 'SUCCESS',
      })
      .eq('order_id', body.order_id)

    await serviceClient
      .from('orders')
      .update({ status: 'CONFIRMED' })
      .eq('id', body.order_id)

    await serviceClient.from('order_status_history').insert({
      order_id: body.order_id,
      status: 'CONFIRMED',
      changed_by: userId,
      notes: 'Demo payment - success',
    })

    // Reserve stock
    const { data: orderItems } = await serviceClient
      .from('order_items')
      .select('product_id, size, quantity')
      .eq('order_id', body.order_id)

    if (orderItems) {
      for (const item of orderItems) {
        await serviceClient.rpc('reserve_stock', {
          p_product_id: item.product_id,
          p_size: item.size,
          p_quantity: item.quantity,
        })
      }
    }

    // Clear cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    return NextResponse.json({ success: true, order_id: body.order_id })
  } else {
    // Simulate failed payment
    await serviceClient
      .from('payments')
      .update({
        status: 'FAILED',
        failure_reason: 'Demo payment - simulated failure',
      })
      .eq('order_id', body.order_id)

    await serviceClient
      .from('orders')
      .update({ status: 'PAYMENT_FAILED' })
      .eq('id', body.order_id)

    await serviceClient.from('order_status_history').insert({
      order_id: body.order_id,
      status: 'PAYMENT_FAILED',
      changed_by: userId,
      notes: 'Demo payment - simulated failure',
    })

    return NextResponse.json({ error: 'Payment failed (demo)' }, { status: 400 })
  }
}
