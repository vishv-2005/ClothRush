'use client'

import Link from 'next/link'
import { Store, Package, ShoppingBag, Settings, LogOut } from 'lucide-react'

const navItems = [
  { href: '/seller', icon: Store, label: 'Dashboard' },
  { href: '/seller/products', icon: Package, label: 'Products' },
  { href: '/seller/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/seller/settings', icon: Settings, label: 'Settings' },
]

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <Link href="/seller" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent">
              ClothRush
            </span>
            <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">Seller</span>
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
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <Link href="/seller" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent">
            ClothRush
          </span>
          <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">Seller</span>
        </Link>
        <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around p-2">
        {navItems.map((item) => (
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
