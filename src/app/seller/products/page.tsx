'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/constants'
import { Loader2, Plus, Search, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
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
        .from('products')
        .select(`
          *,
          images:product_images(*),
          inventory(*)
        `)
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      setProducts(data || [])
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .update({ is_active: false, is_published: false })
        .eq('id', id)

      if (error) throw error
      
      toast.success('Product removed')
      setProducts(products.filter(p => p.id !== id))
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(q.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/seller/products/new">
          <Button className="w-full sm:w-auto bg-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No products found</h2>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
              {q ? "We couldn't find any products matching your search." : "You haven't added any products yet."}
            </p>
            {!q && (
              <Link href="/seller/products/new">
                <Button variant="outline">Create your first product</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const img = product.images?.[0]
            const totalStock = product.inventory?.reduce((sum: number, i: any) => sum + (i.quantity - i.reserved), 0) || 0
            
            return (
              <Card key={product.id} className="overflow-hidden flex flex-col group">
                <div 
                  className="aspect-square bg-muted bg-cover bg-center"
                  style={{ backgroundImage: `url(${img?.image_url || '/placeholder-product.svg'})` }}
                />
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold line-clamp-2" title={product.name}>{product.name}</h3>
                    {!product.is_published && (
                      <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                    )}
                  </div>
                  <div className="mt-auto pt-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold">{formatPrice(product.price)}</span>
                      <span className={`text-xs ${totalStock <= 5 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                        {totalStock} in stock
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Link href={`/seller/products/${product.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
