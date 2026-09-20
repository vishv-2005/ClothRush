'use client'

import Link from 'next/link'
import { MapPin, Zap, ShoppingBag, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { DEFAULT_CITY } from '@/lib/constants'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function Header() {
  const [user, setUser] = useState<{ email?: string; role?: string } | null>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single()
        setUser({ email: authUser.email, role: profile?.role })

        // Get cart count
        const { count } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authUser.id)
        setCartCount(count || 0)
      }
    }

    getUser()
  }, [])

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Location */}
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger className="md:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors">Home</Link>
                  <Link href="/search" className="text-lg font-semibold hover:text-primary transition-colors">Search</Link>
                  <Link href="/orders" className="text-lg font-semibold hover:text-primary transition-colors">My Orders</Link>
                  <Link href="/wishlist" className="text-lg font-semibold hover:text-primary transition-colors">Wishlist</Link>
                  <Link href="/profile" className="text-lg font-semibold hover:text-primary transition-colors">Profile</Link>
                  <hr className="my-2" />
                  {user?.role === 'SELLER' && (
                    <Link href="/seller" className="text-lg font-semibold text-primary hover:text-primary/80 transition-colors">
                      Seller Dashboard
                    </Link>
                  )}
                  {user?.role === 'ADMIN' && (
                    <Link href="/admin" className="text-lg font-semibold text-primary hover:text-primary/80 transition-colors">
                      Admin Dashboard
                    </Link>
                  )}
                  {user?.role === 'DELIVERY_PARTNER' && (
                    <Link href="/delivery" className="text-lg font-semibold text-primary hover:text-primary/80 transition-colors">
                      Delivery Dashboard
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent">
                Vastra
              </span>
              <span className="text-xl font-bold text-brand-accent-dark">Now</span>
            </Link>

            <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground ml-3">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-foreground">{DEFAULT_CITY}</span>
              <span className="mx-1">·</span>
              <Zap className="h-3.5 w-3.5 text-delivery" />
              <span className="text-delivery font-medium">15-20 min</span>
            </div>
          </div>

          {/* Desktop Nav & Actions */}
          <div className="flex items-center gap-2">
            <Link href="/search" className="hidden md:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Search className="h-4 w-4 mr-1" />
                Search
              </Button>
            </Link>

            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="brand-gradient text-white border-0">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function Search({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
