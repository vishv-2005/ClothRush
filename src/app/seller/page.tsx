'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/constants'
import { Package, ShoppingBag, DollarSign, TrendingUp, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DashboardStatSkeleton } from '@/components/loading-skeleton'
import Link from 'next/link'

export default function SellerDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
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

        const [ordersRes, productsRes] = await Promise.all([
          supabase
            .from('orders')
            .select('subtotal, status')
            .eq('store_id', store.id),
          supabase
            .from('products')
            .select('id', { count: 'exact' })
            .eq('store_id', store.id)
            .eq('is_active', true)
        ])

        const orders = ordersRes.data || []
        const revenue = orders
          .filter(o => o.status === 'DELIVERED')
          .reduce((sum, o) => sum + o.subtotal, 0)
        
        const pendingOrders = orders.filter(o => 
          ['CONFIRMED', 'SELLER_ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status)
        ).length

        setStats({
          revenue,
          totalOrders: orders.length,
          pendingOrders,
          activeProducts: productsRes.count || 0,
        })
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
        <h1 className="text-2xl font-bold">Dashboard</h1>
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
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {!stats ? (
        <Card className="bg-yellow-50/50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Complete Your Profile</h2>
            <p className="text-sm text-yellow-700 mb-4">You need to set up your store before you can start selling.</p>
            <Link href="/seller/settings">
              <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">
                Setup Store
              </button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(stats.revenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground mt-1 text-orange-600 font-medium">Require action</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProducts}</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/seller/products/new">
                <Card className="hover:border-primary transition-colors cursor-pointer group">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">Add New Product</h3>
                      <p className="text-sm text-muted-foreground">List a new item in your store</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Package className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/seller/orders">
                <Card className="hover:border-primary transition-colors cursor-pointer group">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">Manage Orders</h3>
                      <p className="text-sm text-muted-foreground">View and update pending orders</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
