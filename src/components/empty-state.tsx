import { PackageOpen, SearchX, ShoppingBag, AlertCircle } from 'lucide-react'

interface EmptyStateProps {
  icon?: 'package' | 'search' | 'cart' | 'error'
  title: string
  description?: string
  action?: React.ReactNode
}

const icons = {
  package: PackageOpen,
  search: SearchX,
  cart: ShoppingBag,
  error: AlertCircle,
}

export function EmptyState({ icon = 'package', title, description, action }: EmptyStateProps) {
  const Icon = icons[icon]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in-up">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
