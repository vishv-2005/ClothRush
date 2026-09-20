'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PriceDisplay } from '@/components/price-display'
import { Rating } from '@/components/rating'
import { DeliveryBadge } from '@/components/delivery-badge'
import { ProductDetailSkeleton } from '@/components/loading-skeleton'
import { createClient } from '@/lib/supabase/client'
import { calculateETA, formatPrice } from '@/lib/constants'
import { toast } from 'sonner'
import {
  MapPin, Heart, ShoppingBag, ArrowLeft, Eye, Sparkles,
  ChevronDown, ChevronUp, Store, Package, Ruler
} from 'lucide-react'
import Link from 'next/link'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedImageType, setSelectedImageType] = useState<'original' | 'ai'>('original')
  const [addingToCart, setAddingToCart] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) throw new Error('Product not found')
        const data = await res.json()
        setProduct(data)
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0])
        
        // Check if AI image exists
        const hasAiImage = data.images?.some((img: any) => img.image_type === 'ai_generated')
        if (hasAiImage) setSelectedImageType('ai')
      } catch {
        toast.error('Product not found')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }

    setAddingToCart(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          size: selectedSize,
          quantity: 1,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to add to cart')
        return
      }

      toast.success('Added to cart!', {
        action: {
          label: 'View Cart',
          onClick: () => router.push('/cart'),
        },
      })
    } catch {
      toast.error('Failed to add to cart. Please log in first.')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) return <ProductDetailSkeleton />
  if (!product) return <div className="p-8 text-center">Product not found</div>

  const store = Array.isArray(product.store) ? product.store[0] : product.store
  const { eta, distance } = store
    ? calculateETA(store.latitude, store.longitude, undefined, undefined, store.preparation_time)
    : { eta: 17, distance: 1.5 }

  const originalImage = product.images?.find((img: any) => img.image_type === 'original')
  const aiImage = product.images?.find((img: any) => img.image_type === 'ai_generated')
  const currentImage = selectedImageType === 'ai' && aiImage ? aiImage : originalImage || product.images?.[0]

  // Get stock for selected size
  const sizeInventory = product.inventory?.find((inv: any) => inv.size === selectedSize)
  const available = sizeInventory ? sizeInventory.quantity - sizeInventory.reserved : 0
  const isOutOfStock = available <= 0

  return (
    <div className="animate-fade-in-up">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {/* Image Section */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${currentImage?.image_url || '/placeholder-product.svg'})` }}
                role="img"
                aria-label={`${product.name} - ${selectedImageType === 'ai' ? 'AI generated preview' : 'original photo'}`}
              />
              
              {/* AI Label */}
              {selectedImageType === 'ai' && aiImage && (
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">AI-generated product preview</span>
                    </div>
                    <button
                      onClick={() => setSelectedImageType('original')}
                      className="text-primary font-medium flex items-center gap-0.5 hover:underline"
                    >
                      <Eye className="h-3 w-3" />
                      View original
                    </button>
                  </div>
                </div>
              )}

              {selectedImageType === 'original' && aiImage && (
                <button
                  onClick={() => setSelectedImageType('ai')}
                  className="absolute top-3 right-3 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  View AI Preview
                </button>
              )}
            </div>

            {/* Image thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageType(img.image_type === 'ai_generated' ? 'ai' : 'original')}
                    className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      (img.image_type === 'ai_generated' ? 'ai' : 'original') === selectedImageType
                        ? 'border-primary'
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${img.image_url})` }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Store info */}
            {store && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store className="h-4 w-4" />
                <span className="font-medium text-foreground">{store.name}</span>
                <span>·</span>
                <MapPin className="h-3.5 w-3.5" />
                <span>{distance} km away</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

            {/* Rating */}
            {product.rating > 0 && (
              <Rating rating={product.rating} totalRatings={product.total_ratings} />
            )}

            {/* Price */}
            <PriceDisplay
              price={product.price}
              originalPrice={product.original_price}
              size="lg"
            />

            {/* Delivery */}
            <div className="flex items-center gap-3">
              <DeliveryBadge eta={eta} />
              <span className="text-sm text-muted-foreground">Available now</span>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Select Size</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((size: string) => {
                  const inv = product.inventory?.find((i: any) => i.size === size)
                  const stock = inv ? inv.quantity - inv.reserved : 0
                  const outOfStock = stock <= 0

                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      disabled={outOfStock}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                        ${selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : outOfStock
                            ? 'border-border text-muted-foreground/50 cursor-not-allowed line-through'
                            : 'border-border hover:border-primary/50 hover:bg-primary/5'
                        }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              {selectedSize && sizeInventory && (
                <p className={`text-xs mt-1.5 ${available <= 5 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  {isOutOfStock
                    ? 'Out of stock'
                    : available <= 5
                      ? `Only ${available} left!`
                      : `${available} in stock`}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                size="lg"
                className="flex-1 brand-gradient text-white border-0 rounded-xl"
                onClick={handleAddToCart}
                disabled={!selectedSize || isOutOfStock || addingToCart}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {addingToCart ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Product Details */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-between w-full text-sm font-medium"
              >
                <span>Product Details</span>
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showDetails && (
                <div className="mt-3 space-y-3 text-sm text-muted-foreground animate-fade-in-up">
                  {product.description && (
                    <p className="leading-relaxed">{product.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {product.color && (
                      <div><span className="font-medium text-foreground">Color:</span> {product.color}</div>
                    )}
                    {product.material && (
                      <div><span className="font-medium text-foreground">Material:</span> {product.material}</div>
                    )}
                    {product.fit && (
                      <div><span className="font-medium text-foreground">Fit:</span> {product.fit}</div>
                    )}
                    {product.gender && (
                      <div><span className="font-medium text-foreground">Gender:</span> {product.gender}</div>
                    )}
                  </div>
                  {product.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
