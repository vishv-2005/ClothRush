import { Badge } from '@/components/ui/badge'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/lib/constants'

interface StatusBadgeProps {
  status: OrderStatus | string
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const label = ORDER_STATUS_LABELS[status as OrderStatus] || status
  const colorClass = ORDER_STATUS_COLORS[status as OrderStatus] || 'bg-gray-100 text-gray-800'

  const sizeClass = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size]

  return (
    <Badge variant="secondary" className={`${colorClass} ${sizeClass} font-medium border-0`}>
      {label}
    </Badge>
  )
}
