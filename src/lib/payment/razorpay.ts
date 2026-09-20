// ==========================================
// Razorpay Payment Service
// ==========================================
// Server-side only — never import this file in client components

import Razorpay from 'razorpay'
import crypto from 'crypto'

let razorpayInstance: Razorpay | null = null

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.')
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  }
  return razorpayInstance
}

export interface CreateRazorpayOrderOptions {
  amount: number // in INR (will be converted to paise)
  currency?: string
  receipt: string
  notes?: Record<string, string>
}

export interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: string
  created_at: number
}

/**
 * Create a Razorpay order (server-side only)
 */
export async function createRazorpayOrder(
  options: CreateRazorpayOrderOptions
): Promise<RazorpayOrder> {
  const razorpay = getRazorpay()

  const order = await razorpay.orders.create({
    amount: Math.round(options.amount * 100), // Convert to paise
    currency: options.currency || 'INR',
    receipt: options.receipt,
    notes: options.notes || {},
  })

  return order as unknown as RazorpayOrder
}

/**
 * Verify Razorpay payment signature (server-side only)
 * This is critical for payment security — never skip this verification
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    console.error('[Payment] RAZORPAY_KEY_SECRET not configured')
    return false
  }

  const body = `${orderId}|${paymentId}`
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex')

  return expectedSignature === signature
}

/**
 * Get Razorpay public key for client-side checkout
 */
export function getRazorpayKeyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
}
