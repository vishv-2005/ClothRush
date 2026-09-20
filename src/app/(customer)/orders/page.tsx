'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { formatPrice } from '@/lib/constants'
import { Loader2, Package } from 'lucide-react'
import { format } from 'date-fns'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders || [])
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="package"
        title="No orders yet"
        description="Start shopping to see your orders here"
        action={
          <Link href="/search">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
              Browse Products
            </button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Package className="h-6 w-6" />
        My Orders
      </h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const store = Array.isArray(order.store) ? order.store[0] : order.store
          return (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="bg-card rounded-xl border border-border p-4 hover-lift cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{order.order_number}</span>
                  <StatusBadge status={order.status} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">{store?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold">{formatPrice(order.total)}</span>
                  <span className="text-xs text-muted-foreground">
                    {order.items?.length || 0} item(s)
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
