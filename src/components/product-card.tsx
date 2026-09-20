import Link from 'next/link'
import { MapPin, Zap, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, calculateDiscount } from '@/lib/constants'
import type { Product, Store, ProductImage } from '@/lib/types'

interface ProductCardProps {
  product: Product & {
    store?: Pick<Store, 'id' | 'name' | 'latitude' | 'longitude' | 'preparation_time'>
    images?: ProductImage[]
  }
  distance?: number
  eta?: number
}

export function ProductCard({ product, distance, eta }: ProductCardProps) {
  const discount = product.original_price
    ? calculateDiscount(product.price, product.original_price)
    : 0

  const imageUrl = product.images?.[0]?.image_url || '/placeholder-product.svg'
  const isAiImage = product.images?.[0]?.image_type === 'ai_generated'

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="bg-card rounded-2xl overflow-hidden border border-border hover-lift">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <div
            className="w-full h-full bg-cover bg-center product-image-zoom"
            style={{ backgroundImage: `url(${imageUrl})` }}
            role="img"
            aria-label={product.name}
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive text-white border-0 text-xs font-bold">
              -{discount}%
            </Badge>
          )}

          {/* AI Badge */}
          {isAiImage && (
            <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] bg-primary/10 text-primary border-primary/20">
              ✨ AI Preview
            </Badge>
          )}
        </div>

        {/* Details */}
        <div className="p-3">
          {/* Store & Distance */}
          {product.store && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[11px] text-muted-foreground truncate">
                {product.store.name}
              </span>
              {distance !== undefined && (
                <>
                  <span className="text-muted-foreground text-[10px]">·</span>
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{distance} km</span>
                </>
              )}
            </div>
          )}

          {/* Name */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-bold text-base">{formatPrice(product.price)}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Rating & ETA */}
          <div className="flex items-center justify-between mt-2">
            {product.rating > 0 && (
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-brand-accent text-brand-accent" />
                <span className="text-xs font-medium">{product.rating}</span>
                {product.total_ratings > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    ({product.total_ratings})
                  </span>
                )}
              </div>
            )}
            {eta !== undefined && (
              <div className="flex items-center gap-0.5 text-delivery">
                <Zap className="h-3 w-3" />
                <span className="text-xs font-semibold">{eta} min</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
