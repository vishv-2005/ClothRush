'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { PriceDisplay } from '@/components/price-display'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, DELIVERY_FEE, PLATFORM_FEE } from '@/lib/constants'
import { toast } from 'sonner'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?redirect=/cart')
          return
        }
        throw new Error('Failed to fetch cart')
      }
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      toast.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCart() }, [])

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return removeItem(itemId)
    
    setUpdating(itemId)
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, quantity: newQuantity }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to update')
        return
      }
      fetchCart()
    } catch {
      toast.error('Update failed')
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdating(itemId)
    try {
      await fetch(`/api/cart?id=${itemId}`, { method: 'DELETE' })
      setItems(items.filter(i => i.id !== itemId))
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    } finally {
      setUpdating(null)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE + PLATFORM_FEE : 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="cart"
        title="Your cart is empty"
        description="Discover amazing fashion from stores near you"
        action={
          <Link href="/search">
            <Button className="brand-gradient text-white">Browse Products</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl animate-fade-in-up">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBag className="h-6 w-6" />
        Cart ({items.length} items)
      </h1>

      <div className="space-y-4">
        {items.map((item) => {
          const product = item.product
          const imageUrl = product?.images?.[0]?.image_url || '/placeholder-product.svg'
          const store = Array.isArray(product?.store) ? product?.store[0] : product?.store

          return (
            <div key={item.id} className="bg-card rounded-xl border border-border p-4 flex gap-4">
              {/* Image */}
              <Link href={`/product/${product?.id}`} className="flex-shrink-0">
                <div
                  className="w-20 h-24 rounded-lg bg-muted bg-cover bg-center"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{store?.name}</p>
                <Link href={`/product/${product?.id}`}>
                  <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                    {product?.name}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>
                <div className="mt-1">
                  <span className="font-bold">{formatPrice(product?.price || 0)}</span>
                </div>

                {/* Quantity & Remove */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 border border-border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-muted rounded-l-lg transition-colors"
                      disabled={updating === item.id}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-muted rounded-r-lg transition-colors"
                      disabled={updating === item.id}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    disabled={updating === item.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order Summary */}
      <div className="mt-6 bg-card rounded-xl border border-border p-4 space-y-3">
        <h3 className="font-semibold">Order Summary</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span>{formatPrice(DELIVERY_FEE)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Platform Fee</span>
          <span>{formatPrice(PLATFORM_FEE)}</span>
        </div>
        <hr />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="mt-4">
        <Link href="/checkout">
          <Button size="lg" className="w-full brand-gradient text-white rounded-xl text-base">
            Proceed to Checkout
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
