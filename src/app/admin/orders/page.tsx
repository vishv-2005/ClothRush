'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, FileText } from 'lucide-react'
import { formatPrice } from '@/lib/constants'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('orders')
          .select('*, stores(name), profiles(full_name)')
          .order('created_at', { ascending: false })
        
        setOrders(data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">All Orders</h1>
          <p className="text-muted-foreground">Monitor all platform transactions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium">Order #</th>
                    <th className="px-6 py-3 font-medium">Store</th>
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Total</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const storeName = Array.isArray(order.stores) ? order.stores[0]?.name : order.stores?.name
                    const customerName = Array.isArray(order.profiles) ? order.profiles[0]?.full_name : order.profiles?.full_name
                    
                    return (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{order.order_number}</td>
                        <td className="px-6 py-4">{storeName || 'N/A'}</td>
                        <td className="px-6 py-4">{customerName || 'N/A'}</td>
                        <td className="px-6 py-4 font-semibold">{formatPrice(order.total)}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] uppercase font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
