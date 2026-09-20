import Link from 'next/link'
import { LayoutDashboard, Users, Store, Settings, LogOut, FileText, Truck } from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/stores', icon: Store, label: 'Stores' },
  { href: '/admin/orders', icon: FileText, label: 'All Orders' },
  { href: '/admin/delivery', icon: Truck, label: 'Delivery Partners' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent">
              ClothRush
            </span>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent">
            ClothRush
          </span>
          <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around p-2">
        {navItems.slice(0, 4).map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors">
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  )
}
