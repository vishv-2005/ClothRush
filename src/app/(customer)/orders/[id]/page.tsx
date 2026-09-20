'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { StatusBadge } from '@/components/status-badge'
import { formatPrice, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/constants'
import { Loader2, MapPin, Store, Package, Clock, Truck, CheckCircle, User, Phone } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_STEPS: OrderStatus[] = [
  'CONFIRMED', 'SELLER_ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP',
  'DELIVERY_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'
]

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch {
      // Silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrder() }, [id])

  // Auto-refresh for tracking
  useEffect(() => {
    if (!order || order.status === 'DELIVERED' || order.status === 'CANCELLED') return
    const interval = setInterval(fetchOrder, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [order?.status])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) return <div className="p-8 text-center">Order not found</div>

  const store = Array.isArray(order.store) ? order.store[0] : order.store
  const address = order.delivery_address_snapshot || order.address
  const currentStepIndex = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
          </p>
        </div>
        <StatusBadge status={order.status} size="md" />
      </div>

      {/* Order Timeline */}
      {!['PENDING_PAYMENT', 'PAYMENT_FAILED', 'CANCELLED'].includes(order.status) && (
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <h3 className="font-semibold text-sm mb-4">Order Tracking</h3>
          <div className="space-y-0">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx
              const isCurrent = order.status === step
              const historyEntry = order.status_history?.find((h: any) => h.status === step)

              return (
                <div key={step} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-primary status-dot-animate' : 'bg-muted-foreground/30'}`} />
                      )}
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                    )}
                  </div>
                  <div className={`pb-3 ${!isCompleted ? 'opacity-40' : ''}`}>
                    <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : ''}`}>
                      {ORDER_STATUS_LABELS[step]}
                    </p>
                    {historyEntry && (
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(historyEntry.created_at), 'hh:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Delivery Partner */}
      {order.delivery_partner && (
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Truck className="h-4 w-4" /> Delivery Partner
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{order.delivery_partner.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> {order.delivery_partner.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Store Info */}
      <div className="bg-card rounded-xl border border-border p-4 mb-4">
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Store className="h-4 w-4" /> Store
        </h3>
        <p className="text-sm">{store?.name}</p>
        <p className="text-xs text-muted-foreground">{store?.address}</p>
      </div>

      {/* Delivery Address */}
      {address && (
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Delivery Address
          </h3>
          <p className="text-sm">{address.name}</p>
          <p className="text-xs text-muted-foreground">{address.address_line}, {address.city} - {address.pincode}</p>
          <p className="text-xs text-muted-foreground">{address.phone}</p>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-card rounded-xl border border-border p-4 mb-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Package className="h-4 w-4" /> Items
        </h3>
        <div className="space-y-2">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <span>{item.product_name}</span>
                <span className="text-muted-foreground"> × {item.quantity} ({item.size})</span>
              </div>
              <span className="font-medium">{formatPrice(item.total)}</span>
            </div>
          ))}
        </div>
        <hr className="my-3" />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Fee</span>
            <span>{formatPrice(order.delivery_fee)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Platform Fee</span>
            <span>{formatPrice(order.platform_fee)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* ETA */}
      {order.estimated_delivery_time && !['DELIVERED', 'CANCELLED'].includes(order.status) && (
        <div className="flex items-center gap-2 bg-green-50 rounded-xl p-4">
          <Clock className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-700 font-medium">
            Estimated delivery in {order.estimated_delivery_time} minutes
          </span>
        </div>
      )}
    </div>
  )
}
