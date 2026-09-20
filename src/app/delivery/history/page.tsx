'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, PackageCheck } from 'lucide-react'
import { formatPrice } from '@/lib/constants'

export default function DeliveryHistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('orders')
          .select('*, stores(name, address), profiles(full_name, phone)')
          .eq('delivery_partner_id', user.id)
          .eq('status', 'DELIVERED')
          .order('updated_at', { ascending: false })
          .limit(20)

        setHistory(data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-delivery" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <PackageCheck className="h-6 w-6 text-delivery" />
        <h1 className="text-xl font-bold">Delivery History</h1>
      </div>

      {history.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <PackageCheck className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h2 className="text-lg font-semibold text-muted-foreground">No deliveries yet</h2>
            <p className="text-sm text-muted-foreground mt-1">Your completed deliveries will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((order) => {
            const storeName = Array.isArray(order.stores) ? order.stores[0]?.name : order.stores?.name
            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Order #{order.order_number}</p>
                      <p className="font-semibold text-sm">{storeName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Delivered
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Earning: <span className="font-semibold text-delivery">{formatPrice(order.delivery_fee)}</span></p>
                    <p className="text-xs text-muted-foreground">Cash Collected: {order.payment_method === 'COD' ? formatPrice(order.total) : 'Prepaid'}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
