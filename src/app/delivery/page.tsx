'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Loader2, MapPin, Package, Navigation, Phone, CheckCircle, Clock, Store } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function DeliveryDashboard() {
  const [partner, setPartner] = useState<any>(null)
  const [activeOrder, setActiveOrder] = useState<any>(null)
  const [availableOrders, setAvailableOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get partner profile
      const { data: partnerData } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      setPartner(partnerData)

      if (partnerData) {
        // If has active order
        if (partnerData.current_order_id) {
          const { data: order } = await supabase
            .from('orders')
            .select(`
              *,
              store:stores(name, address, phone, latitude, longitude),
              user:profiles!orders_user_id_fkey(full_name, phone)
            `)
            .eq('id', partnerData.current_order_id)
            .single()
          setActiveOrder(order)
        } else {
          setActiveOrder(null)
          // Find available orders (READY_FOR_PICKUP and not assigned)
          const { data: orders } = await supabase
            .from('orders')
            .select(`
              *,
              store:stores(name, address, latitude, longitude)
            `)
            .eq('status', 'READY_FOR_PICKUP')
            .is('delivery_partner_id', null)
            .order('created_at', { ascending: true })
            .limit(10)
          
          setAvailableOrders(orders || [])
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const toggleAvailability = async () => {
    if (!partner || partner.current_order_id) return
    setProcessing(true)
    try {
      const supabase = createClient()
      const newStatus = partner.availability === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE'
      
      await supabase
        .from('delivery_partners')
        .update({ availability: newStatus })
        .eq('id', partner.id)
      
      setPartner({ ...partner, availability: newStatus })
      toast.success(`You are now ${newStatus.toLowerCase()}`)
    } catch {
      toast.error('Could not update status')
    } finally {
      setProcessing(false)
    }
  }

  const acceptOrder = async (orderId: string) => {
    setProcessing(true)
    try {
      const supabase = createClient()
      
      // Update order
      await supabase
        .from('orders')
        .update({ 
          status: 'DELIVERY_ASSIGNED',
          delivery_partner_id: partner.id
        })
        .eq('id', orderId)
        .is('delivery_partner_id', null) // Optimistic concurrency check

      // Record history
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('order_status_history').insert({
          order_id: orderId,
          status: 'DELIVERY_ASSIGNED',
          changed_by: user.id,
          notes: 'Partner accepted order'
        })
      }

      // Update partner
      await supabase
        .from('delivery_partners')
        .update({ 
          availability: 'BUSY',
          current_order_id: orderId
        })
        .eq('id', partner.id)

      // Create assignment
      await supabase.from('delivery_assignments').insert({
        order_id: orderId,
        delivery_partner_id: partner.id,
        status: 'ASSIGNED'
      })

      toast.success('Order accepted!')
      fetchData()
    } catch {
      toast.error('Failed to accept order. It may have been taken by another partner.')
    } finally {
      setProcessing(false)
    }
  }

  const updateOrderStatus = async (status: string, nextActionMsg: string) => {
    if (!activeOrder) return
    setProcessing(true)
    try {
      const res = await fetch(`/api/orders/${activeOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!res.ok) throw new Error('Failed to update')
      
      toast.success(nextActionMsg)
      fetchData()
    } catch {
      toast.error('Could not update order status')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-delivery" />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Delivery Profile Not Found</h2>
        <p className="text-muted-foreground">Please contact administrator to set up your delivery account.</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 animate-fade-in-up">
      {/* Status Header */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-delivery/10 to-transparent">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{partner.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2.5 w-2.5">
                {partner.availability === 'AVAILABLE' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  partner.availability === 'AVAILABLE' ? 'bg-green-500' : 
                  partner.availability === 'BUSY' ? 'bg-orange-500' : 'bg-gray-400'
                }`}></span>
              </span>
              <span className="text-sm font-medium">
                {partner.availability === 'AVAILABLE' ? 'Online & Searching' : 
                 partner.availability === 'BUSY' ? 'On Delivery' : 'Offline'}
              </span>
            </div>
          </div>
          <Button 
            variant={partner.availability === 'AVAILABLE' ? 'outline' : 'default'}
            className={partner.availability === 'AVAILABLE' ? 'border-destructive text-destructive hover:bg-destructive/10' : 'bg-delivery hover:bg-delivery/90'}
            onClick={toggleAvailability}
            disabled={processing || partner.current_order_id}
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 
             partner.availability === 'AVAILABLE' ? 'Go Offline' : 'Go Online'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Order View */}
      {activeOrder && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Current Delivery</h3>
          <Card className="border-delivery/50 shadow-lg ring-1 ring-delivery/20">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-delivery/20 text-delivery-foreground mb-2 border-0">
                    {activeOrder.status.replace(/_/g, ' ')}
                  </Badge>
                  <h4 className="font-bold">{activeOrder.order_number}</h4>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{activeOrder.total}</p>
                  <p className="text-xs text-muted-foreground">Pre-paid</p>
                </div>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {/* Pickup Location */}
                <div className="relative">
                  <div className="absolute left-[-24px] bg-card p-1">
                    <Store className="h-4 w-4 text-orange-500" />
                  </div>
                  <h5 className="font-semibold text-sm">Pickup</h5>
                  <p className="text-sm text-muted-foreground">{activeOrder.store?.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{activeOrder.store?.address}</p>
                  <Button variant="link" className="h-auto p-0 text-delivery text-xs flex gap-1 mt-1">
                    <Navigation className="h-3 w-3" /> Navigate
                  </Button>
                </div>

                {/* Drop Location */}
                <div className="relative">
                  <div className="absolute left-[-24px] bg-card p-1">
                    <MapPin className="h-4 w-4 text-green-500" />
                  </div>
                  <h5 className="font-semibold text-sm">Dropoff</h5>
                  <p className="text-sm text-muted-foreground">{activeOrder.user?.full_name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {activeOrder.delivery_address_snapshot?.address_line}, 
                    {activeOrder.delivery_address_snapshot?.city}
                  </p>
                  <div className="flex gap-4 mt-2">
                    <Button variant="link" className="h-auto p-0 text-delivery text-xs flex gap-1">
                      <Navigation className="h-3 w-3" /> Navigate
                    </Button>
                    <Button variant="link" className="h-auto p-0 text-primary text-xs flex gap-1">
                      <Phone className="h-3 w-3" /> Call Customer
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                {activeOrder.status === 'DELIVERY_ASSIGNED' && (
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg rounded-xl"
                    onClick={() => updateOrderStatus('PICKED_UP', 'Navigating to customer')}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Pickup'}
                  </Button>
                )}
                {activeOrder.status === 'PICKED_UP' && (
                  <Button 
                    className="w-full bg-delivery hover:bg-delivery/90 text-white py-6 text-lg rounded-xl"
                    onClick={() => updateOrderStatus('OUT_FOR_DELIVERY', 'Marked Out for Delivery')}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Start Delivery Journey'}
                  </Button>
                )}
                {activeOrder.status === 'OUT_FOR_DELIVERY' && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-xl"
                    onClick={() => updateOrderStatus('DELIVERED', 'Delivery Completed! Great job.')}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" /> Mark as Delivered
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Orders View */}
      {!activeOrder && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            Available Orders <Badge variant="secondary">{availableOrders.length}</Badge>
          </h3>
          
          {partner.availability === 'OFFLINE' ? (
            <div className="text-center p-8 bg-muted/50 rounded-xl border border-border">
              <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="font-medium">You are currently offline</p>
              <p className="text-sm text-muted-foreground mt-1">Go online to receive delivery requests.</p>
            </div>
          ) : availableOrders.length === 0 ? (
            <div className="text-center p-8 bg-muted/50 rounded-xl border border-border border-dashed">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="font-medium">Searching for nearby orders...</p>
              <Loader2 className="h-5 w-5 animate-spin text-delivery mx-auto mt-4" />
            </div>
          ) : (
            <div className="space-y-3">
              {availableOrders.map((order) => {
                const store = Array.isArray(order.store) ? order.store[0] : order.store
                return (
                  <Card key={order.id} className="hover:border-delivery/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold">{store?.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{store?.address}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">
                          Ready Now
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm font-medium">
                          <span className="text-muted-foreground font-normal text-xs block">Earning</span>
                          ₹{order.delivery_fee}
                        </div>
                        <Button 
                          className="bg-delivery hover:bg-delivery/90 text-white"
                          onClick={() => acceptOrder(order.id)}
                          disabled={processing}
                        >
                          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accept Delivery'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
