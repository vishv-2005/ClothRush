import Link from 'next/link'
import { Bike, Package, Settings, LogOut } from 'lucide-react'

const navItems = [
  { href: '/delivery', icon: Bike, label: 'Deliveries' },
  { href: '/delivery/history', icon: Package, label: 'History' },
  { href: '/delivery/settings', icon: Settings, label: 'Settings' },
]

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/delivery" className="flex items-center gap-2">
            <span className="text-xl font-bold text-delivery">VastraNow</span>
            <span className="text-xs font-bold bg-delivery/10 text-delivery px-1.5 py-0.5 rounded uppercase">Rider</span>
          </Link>
          <Link href="/login">
            <button className="text-sm text-muted-foreground hover:text-foreground">
              Logout
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around p-2 pb-safe shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex-1">
            <div className="flex flex-col items-center justify-center gap-1 py-1 text-muted-foreground hover:text-delivery transition-colors">
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  )
}
