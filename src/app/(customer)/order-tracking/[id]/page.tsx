'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, PackageSearch, Truck, CheckCheck } from 'lucide-react'

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('orders')
          .select('*, stores(name, address), delivery_partners(name, phone)')
          .eq('id', orderId)
          .single()

        setOrder(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
    
    // In a real app, we would setup a realtime subscription here to watch for status changes
  }, [orderId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Order Not Found</h1>
        <p className="text-muted-foreground mt-2">We couldn't find the tracking details for this order.</p>
      </div>
    )
  }

  const steps = [
    { status: 'PENDING', title: 'Order Placed', icon: CheckCircle2, description: 'Waiting for store to accept.' },
    { status: 'ACCEPTED', title: 'Preparing', icon: PackageSearch, description: 'Store is packing your items.' },
    { status: 'OUT_FOR_DELIVERY', title: 'On the Way', icon: Truck, description: 'Rider has picked up your order.' },
    { status: 'DELIVERED', title: 'Delivered', icon: CheckCheck, description: 'Order completed.' }
  ]

  const currentStepIndex = steps.findIndex(s => s.status === order.status)
  // Fallback for CANCELLED etc
  const isActive = (index: number) => currentStepIndex >= index
  
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in-up pb-24">
      <div>
        <h1 className="text-2xl font-bold">Track Order</h1>
        <p className="text-sm text-muted-foreground">Order #{order.order_number}</p>
      </div>

      <Card>
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg flex justify-between">
            <span>{Array.isArray(order.stores) ? order.stores[0]?.name : order.stores?.name}</span>
            <span className="text-primary font-bold">{order.status.replace(/_/g, ' ')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {order.status === 'CANCELLED' ? (
            <div className="text-center p-6 text-destructive">
              <h2 className="text-xl font-bold">Order Cancelled</h2>
              <p className="mt-2">This order has been cancelled and cannot be fulfilled.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-[21px] top-4 bottom-4 w-[2px] bg-muted"></div>
              
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={step.status} className="relative flex gap-4 items-start">
                    <div className={`z-10 rounded-full p-2 ${isActive(index) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div className="pt-1">
                      <h3 className={`font-bold ${isActive(index) ? 'text-foreground' : 'text-muted-foreground'}`}>{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {order.delivery_partners && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Partner Details</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-delivery/10 flex items-center justify-center text-delivery">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold">{order.delivery_partners.name}</p>
              <p className="text-sm text-muted-foreground font-medium">📞 {order.delivery_partners.phone}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
