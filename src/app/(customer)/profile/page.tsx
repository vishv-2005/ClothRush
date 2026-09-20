'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/constants'
import { User, MapPin, Package, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CustomerProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [address, setAddress] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(profileData)

        const { data: addressData } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single()
        
        setAddress(addressData)

        const { data: ordersData } = await supabase
          .from('orders')
          .select('*, stores(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setOrders(ordersData || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center mt-20">
        <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
        <Link href="/login">
          <Button>Go to Login</Button>
        </Link>
      </div>
    )
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-24">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8 text-primary" />
            My Profile
          </h1>
          <p className="text-muted-foreground mt-2">Manage your account, addresses, and view recent orders.</p>
        </div>
        <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Details */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <Input value={profile.full_name || ''} readOnly className="mt-1 bg-zinc-50 dark:bg-zinc-900" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <Input value={profile.email} readOnly className="mt-1 bg-zinc-50 dark:bg-zinc-900" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <Input value={profile.role} readOnly className="mt-1 bg-zinc-50 dark:bg-zinc-900" />
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={() => toast.success('Profile edit coming soon!')}>
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Saved Addresses */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Default Address
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {address ? (
              <div className="space-y-2 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border">
                <p className="font-semibold">{address.name}</p>
                <p className="text-sm">{address.address_line}</p>
                <p className="text-sm">{address.city}, {address.state} {address.pincode}</p>
                <p className="text-sm font-medium mt-2">📞 {address.phone}</p>
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No default address saved</p>
                <Button variant="outline" onClick={() => toast.success('Address management coming soon!')}>Add Address</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Orders
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="p-3 border rounded-lg hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium">{order.stores?.name}</p>
                      <span className="text-[10px] uppercase font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Order #{order.order_number}</p>
                    <div className="flex justify-between items-center mt-3">
                      <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                      <Link href={`/order-tracking/${order.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">Track</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                <Link href="/search">
                  <Button variant="outline">Start Shopping</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
