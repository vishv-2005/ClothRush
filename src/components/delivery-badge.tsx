import { Zap } from 'lucide-react'

interface DeliveryBadgeProps {
  eta: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function DeliveryBadge({ eta, className = '', size = 'md' }: DeliveryBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-0.5',
    md: 'text-sm px-2.5 py-1 gap-1',
    lg: 'text-base px-3 py-1.5 gap-1.5',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-green-50 text-green-700 font-semibold ${className}`}
    >
      <Zap className={`${iconSizes[size]} fill-green-600 text-green-600`} />
      <span>{eta} min</span>
      <span className="h-1.5 w-1.5 rounded-full bg-green-500 status-dot-animate" />
    </div>
  )
}
