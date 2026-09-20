'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, DELIVERY_FEE, PLATFORM_FEE, IS_DEMO_MODE, DEFAULT_ETA } from '@/lib/constants'
import { toast } from 'sonner'
import { Loader2, MapPin, CreditCard, Package, Zap, CheckCircle, XCircle } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<'success' | 'failed' | null>(null)
  const [createdOrderId, setCreatedOrderId] = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    name: '', phone: '', address_line: '', city: 'Vadodara', state: 'Gujarat', pincode: '',
  })

  useEffect(() => {
    fetchData()
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  const fetchData = async () => {
    try {
      const [cartRes, addressRes] = await Promise.all([
        fetch('/api/cart'),
        fetch('/api/addresses'),
      ])

      if (!cartRes.ok) {
        router.push('/login?redirect=/checkout')
        return
      }

      const cartData = await cartRes.json()
      setCart(cartData.items || [])

      if (addressRes.ok) {
        const addrData = await addressRes.json()
        setAddresses(addrData.addresses || [])
        const defaultAddr = addrData.addresses?.find((a: any) => a.is_default)
        if (defaultAddr) setSelectedAddress(defaultAddr.id)
        else if (addrData.addresses?.length > 0) setSelectedAddress(addrData.addresses[0].id)
        else setShowAddressForm(true)
      }
    } catch {
      toast.error('Failed to load checkout data')
    } finally {
      setLoading(false)
    }
  }

  const saveAddress = async () => {
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addressForm, is_default: true }),
      })
      if (!res.ok) {
        toast.error('Failed to save address')
        return
      }
      const data = await res.json()
      setAddresses([...addresses, data.address])
      setSelectedAddress(data.address.id)
      setShowAddressForm(false)
      toast.success('Address saved')
    } catch {
      toast.error('Failed to save address')
    }
  }

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address')
      return
    }

    setProcessing(true)
    try {
      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address_id: selectedAddress }),
      })

      if (!orderRes.ok) {
        const data = await orderRes.json()
        toast.error(data.error || 'Failed to create order')
        setProcessing(false)
        return
      }

      const orderData = await orderRes.json()
      setCreatedOrderId(orderData.order.id)

      // If Razorpay is configured, open checkout
      if (orderData.razorpay_order_id && window.Razorpay) {
        openRazorpayCheckout(orderData)
      } else if (IS_DEMO_MODE) {
        // Demo mode — show payment simulation buttons
        setPaymentResult(null)
        showDemoPaymentDialog(orderData.order.id)
      } else {
        toast.error('Payment gateway not configured. Please set up Razorpay credentials.')
        setProcessing(false)
      }
    } catch {
      toast.error('Checkout failed')
      setProcessing(false)
    }
  }

  const openRazorpayCheckout = (orderData: any) => {
    const options = {
      key: orderData.razorpay_key_id,
      amount: orderData.amount,
      currency: 'INR',
      name: 'VastraNow',
      description: `Order ${orderData.order.order_number}`,
      order_id: orderData.razorpay_order_id,
      handler: async (response: any) => {
        // Verify payment
        try {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: orderData.order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          if (verifyRes.ok) {
            setPaymentResult('success')
            setTimeout(() => router.push(`/orders/${orderData.order.id}`), 2000)
          } else {
            setPaymentResult('failed')
          }
        } catch {
          setPaymentResult('failed')
        }
      },
      modal: {
        ondismiss: () => {
          setPaymentResult('failed')
          setProcessing(false)
        },
      },
      prefill: {
        email: 'customer@vastranow.local',
      },
      theme: {
        color: '#6d28d9',
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const showDemoPaymentDialog = async (orderId: string) => {
    // For demo mode, show inline success/fail buttons
    setCreatedOrderId(orderId)
    setProcessing(false)
  }

  const handleDemoPayment = async (success: boolean) => {
    setProcessing(true)
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: createdOrderId,
          demo_mode: true,
          demo_success: success,
        }),
      })

      if (success && res.ok) {
        setPaymentResult('success')
        toast.success('Payment successful!')
        setTimeout(() => router.push(`/orders/${createdOrderId}`), 2000)
      } else {
        setPaymentResult('failed')
        toast.error('Payment failed')
      }
    } catch {
      setPaymentResult('failed')
    } finally {
      setProcessing(false)
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
  const total = subtotal + DELIVERY_FEE + PLATFORM_FEE

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Payment result screen
  if (paymentResult) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center animate-fade-in-up">
        {paymentResult === 'success' ? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">Your order has been confirmed. Redirecting to order details...</p>
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-700 mb-2">Payment Failed</h1>
            <p className="text-muted-foreground mb-6">Your payment could not be processed.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setPaymentResult(null); setCreatedOrderId('') }} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => router.push('/orders')} variant="ghost">
                View Orders
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }

  // Demo payment dialog
  if (IS_DEMO_MODE && createdOrderId && !processing) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md animate-fade-in-up">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Test Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                🔧 <strong>Demo Mode</strong> — Choose payment outcome for testing
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatPrice(total)}</p>
              <p className="text-sm text-muted-foreground">Total Amount</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleDemoPayment(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={processing}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                Pay — Success
              </Button>
              <Button
                onClick={() => handleDemoPayment(false)}
                variant="destructive"
                disabled={processing}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                Pay — Failed
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl animate-fade-in-up">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="space-y-6">
        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {addresses.length > 0 && !showAddressForm && (
              <div className="space-y-2">
                {addresses.map((addr: any) => (
                  <label
                    key={addr.id}
                    className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedAddress === addr.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="sr-only"
                    />
                    <p className="font-medium text-sm">{addr.name}</p>
                    <p className="text-xs text-muted-foreground">{addr.address_line}, {addr.city} - {addr.pincode}</p>
                    <p className="text-xs text-muted-foreground">{addr.phone}</p>
                  </label>
                ))}
                <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}>
                  + Add New Address
                </Button>
              </div>
            )}

            {showAddressForm && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="addr-name">Name</Label>
                    <Input id="addr-name" value={addressForm.name} onChange={(e) => setAddressForm({...addressForm, name: e.target.value})} placeholder="Full name" />
                  </div>
                  <div>
                    <Label htmlFor="addr-phone">Phone</Label>
                    <Input id="addr-phone" value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} placeholder="10-digit phone" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="addr-line">Address</Label>
                  <Input id="addr-line" value={addressForm.address_line} onChange={(e) => setAddressForm({...addressForm, address_line: e.target.value})} placeholder="House no, street, area" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="addr-city">City</Label>
                    <Input id="addr-city" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="addr-state">State</Label>
                    <Input id="addr-state" value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="addr-pincode">Pincode</Label>
                    <Input id="addr-pincode" value={addressForm.pincode} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})} placeholder="390001" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveAddress} size="sm">Save Address</Button>
                  {addresses.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.product?.name} × {item.quantity} ({item.size})
                </span>
                <span>{formatPrice((item.product?.price || 0) * item.quantity)}</span>
              </div>
            ))}
            <hr />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{formatPrice(DELIVERY_FEE)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span>{formatPrice(PLATFORM_FEE)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* Delivery ETA */}
            <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                Estimated delivery in {DEFAULT_ETA} minutes
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pay Button */}
        <Button
          size="lg"
          className="w-full brand-gradient text-white rounded-xl text-base"
          onClick={handleCheckout}
          disabled={processing || !selectedAddress}
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay {formatPrice(total)}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
