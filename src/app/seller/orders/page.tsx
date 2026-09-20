'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/constants'
import { Loader2, Package, Check, X, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import Link from 'next/link'

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!store) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles!orders_user_id_fkey(full_name, phone),
          items:order_items(product_name, size, quantity, price)
        `)
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      setOrders(data || [])
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (orderId: string, status: string) => {
    setProcessing(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!res.ok) throw new Error('Failed to update')
      
      toast.success('Order updated')
      fetchOrders()
    } catch {
      toast.error('Could not update order')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const pendingOrders = orders.filter(o => o.status === 'CONFIRMED')
  const activeOrders = orders.filter(o => ['SELLER_ACCEPTED', 'PREPARING'].includes(o.status))
  const otherOrders = orders.filter(o => !['CONFIRMED', 'SELLER_ACCEPTED', 'PREPARING'].includes(o.status))

  const renderOrderList = (orderList: any[], emptyMsg: string) => {
    if (orderList.length === 0) {
      return <div className="p-8 text-center text-sm text-muted-foreground bg-card rounded-xl border border-dashed border-border">{emptyMsg}</div>
    }

    return (
      <div className="space-y-4">
        {orderList.map(order => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{order.order_number}</span>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium">{order.user?.full_name || 'Customer'}</p>
                  <p className="text-xs text-muted-foreground">{order.user?.phone || 'No phone'}</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 mb-4 space-y-2">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="truncate pr-4">
                      <span className="font-medium">{item.quantity}x</span> {item.product_name} ({item.size})
                    </span>
                    <span className="font-medium whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Order Total (excl. delivery)</p>
                  <p className="font-bold text-lg">{formatPrice(order.subtotal)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {order.status === 'CONFIRMED' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => updateStatus(order.id, 'CANCELLED')}
                        disabled={processing === order.id}
                      >
                        {processing === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updateStatus(order.id, 'SELLER_ACCEPTED')}
                        disabled={processing === order.id}
                      >
                        {processing === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                        Accept Order
                      </Button>
                    </>
                  )}
                  {order.status === 'SELLER_ACCEPTED' && (
                    <Button 
                      size="sm"
                      onClick={() => updateStatus(order.id, 'PREPARING')}
                      disabled={processing === order.id}
                    >
                      {processing === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Start Preparing
                    </Button>
                  )}
                  {order.status === 'PREPARING' && (
                    <Button 
                      size="sm"
                      className="bg-primary text-white"
                      onClick={() => updateStatus(order.id, 'READY_FOR_PICKUP')}
                      disabled={processing === order.id}
                    >
                      {processing === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4 mr-1" />}
                      Mark Ready for Pickup
                    </Button>
                  )}
                  
                  {/* View Details button is always available */}
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
        
        {pendingOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-orange-600">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              New Orders ({pendingOrders.length})
            </h2>
            {renderOrderList(pendingOrders, "No new orders")}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Active Preparation ({activeOrders.length})</h2>
          {renderOrderList(activeOrders, "No orders currently being prepared")}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Past & Other Orders</h2>
          {renderOrderList(otherOrders, "No other orders")}
        </div>
      </div>
    </div>
  )
}
