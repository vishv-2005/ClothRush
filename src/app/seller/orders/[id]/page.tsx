'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Store, Truck, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/constants'

export default function SellerOrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('orders')
          .select('*, profiles(full_name, phone), addresses(*), delivery_partners(name, phone)')
          .eq('id', orderId)
          .single()

        if (error) throw error
        setOrder(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) return <div className="p-8 text-center text-destructive">Order not found</div>

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-sm text-muted-foreground">Order #{order.order_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between">
              Status
              <span className="text-primary">{order.status.replace(/_/g, ' ')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-bold">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">{order.payment_method}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date Placed</span>
              <span className="font-medium">{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-bold">{order.profiles?.full_name || 'Guest'}</p>
            <p>📞 {order.profiles?.phone || order.addresses?.phone}</p>
            {order.addresses && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">{order.addresses.address_line}</p>
                <p className="text-muted-foreground">{order.addresses.city}, {order.addresses.pincode}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {order.delivery_partners && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Partner
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold">{order.delivery_partners.name}</p>
                <p className="text-sm text-muted-foreground">📞 {order.delivery_partners.phone}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
