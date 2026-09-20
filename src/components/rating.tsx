import { Star } from 'lucide-react'

interface RatingProps {
  rating: number
  totalRatings?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

export function Rating({
  rating,
  totalRatings,
  size = 'md',
  showCount = true,
}: RatingProps) {
  const sizes = {
    sm: { star: 'h-3 w-3', text: 'text-xs', count: 'text-[10px]' },
    md: { star: 'h-4 w-4', text: 'text-sm', count: 'text-xs' },
    lg: { star: 'h-5 w-5', text: 'text-base', count: 'text-sm' },
  }

  const s = sizes[size]

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5 bg-green-600 text-white px-1.5 py-0.5 rounded-md">
        <span className={`${s.text} font-semibold`}>{rating}</span>
        <Star className={`${s.star} fill-white`} />
      </div>
      {showCount && totalRatings !== undefined && totalRatings > 0 && (
        <span className={`${s.count} text-muted-foreground`}>
          ({totalRatings} ratings)
        </span>
      )}
    </div>
  )
}
