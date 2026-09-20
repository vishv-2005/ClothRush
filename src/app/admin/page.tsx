'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/constants'
import { Users, Store, ShoppingBag, DollarSign, Loader2, Truck } from 'lucide-react'
import { DashboardStatSkeleton } from '@/components/loading-skeleton'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [usersRes, storesRes, ordersRes, recentOrdersRes, deliveryRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'CUSTOMER'),
          supabase.from('stores').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('subtotal, platform_fee, status'),
          supabase
            .from('orders')
            .select('id, order_number, status, total, created_at, store:stores(name)')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.from('delivery_partners').select('id', { count: 'exact', head: true })
        ])

        const orders = ordersRes.data || []
        const totalVolume = orders
          .filter(o => o.status === 'DELIVERED')
          .reduce((sum, o) => sum + o.subtotal, 0)
        
        const platformRevenue = orders
          .filter(o => o.status === 'DELIVERED')
          .reduce((sum, o) => sum + o.platform_fee, 0)

        setStats({
          users: usersRes.count || 0,
          stores: storesRes.count || 0,
          deliveryPartners: deliveryRes.count || 0,
          totalOrders: orders.length,
          volume: totalVolume,
          revenue: platformRevenue,
        })
        
        setRecentOrders(recentOrdersRes.data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardStatSkeleton />
          <DashboardStatSkeleton />
          <DashboardStatSkeleton />
          <DashboardStatSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-bold">Platform Overview</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatPrice(stats.revenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">From platform fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">GMV (Volume)</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.volume)}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalOrders} total orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stores}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Partners</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveryPartners}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => {
                  const storeName = Array.isArray(order.store) ? order.store[0]?.name : order.store?.name
                  return (
                    <div key={order.id} className="flex justify-between items-center pb-4 border-b border-border last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{storeName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatPrice(order.total)}</p>
                        <p className="text-xs text-muted-foreground">{order.status}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-sm text-green-800">Database Connection</span>
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-bold">Online</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-sm text-green-800">Payment Gateway (Demo)</span>
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-bold">Online</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-sm text-blue-800">AI Gemini API</span>
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-bold">Ready</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
