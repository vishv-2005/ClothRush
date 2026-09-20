import { formatPrice, calculateDiscount } from '@/lib/constants'

interface PriceDisplayProps {
  price: number
  originalPrice?: number | null
  size?: 'sm' | 'md' | 'lg'
  showDiscount?: boolean
}

export function PriceDisplay({
  price,
  originalPrice,
  size = 'md',
  showDiscount = true,
}: PriceDisplayProps) {
  const discount = originalPrice ? calculateDiscount(price, originalPrice) : 0

  const sizeClasses = {
    sm: { price: 'text-sm font-semibold', original: 'text-xs', badge: 'text-[10px] px-1 py-0.5' },
    md: { price: 'text-lg font-bold', original: 'text-sm', badge: 'text-xs px-1.5 py-0.5' },
    lg: { price: 'text-2xl font-bold', original: 'text-base', badge: 'text-sm px-2 py-1' },
  }

  const classes = sizeClasses[size]

  return (
    <div className="flex items-baseline gap-2">
      <span className={classes.price}>{formatPrice(price)}</span>
      {originalPrice && originalPrice > price && (
        <span className={`${classes.original} text-muted-foreground line-through`}>
          {formatPrice(originalPrice)}
        </span>
      )}
      {showDiscount && discount > 0 && (
        <span className={`${classes.badge} rounded-md bg-green-100 text-green-700 font-semibold`}>
          {discount}% off
        </span>
      )}
    </div>
  )
}
