import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Zap, ShoppingBag } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, redirect them to their specific dashboard
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'SELLER') redirect('/seller')
    if (profile?.role === 'ADMIN') redirect('/admin')
    if (profile?.role === 'DELIVERY_PARTNER') redirect('/delivery')
    redirect('/search') // Customers default to search
  }

  // If not logged in, show the Landing/Onboarding screen
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
        
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black flex items-center justify-center gap-1 group">
            <span className="bg-gradient-to-br from-primary via-primary to-brand-light bg-clip-text text-transparent transition-transform duration-300">
              Cloth
            </span>
            <span className="text-brand-accent-dark">Rush</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-4 font-medium">
            Local Fashion. Delivered Fast.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-sm border border-border">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Local Stores</h3>
            <p className="text-sm text-muted-foreground">Shop directly from the best fashion boutiques in your neighborhood.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-sm border border-border">
            <div className="w-12 h-12 bg-delivery/10 text-delivery rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Hyperlocal Delivery</h3>
            <p className="text-sm text-muted-foreground">Get your clothes delivered to your doorstep in 15-20 minutes.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-sm border border-border">
            <div className="w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Instant Try-On</h3>
            <p className="text-sm text-muted-foreground">No more waiting days for delivery. Order, try it on instantly.</p>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <Link href="/login" className="block w-full">
            <Button size="lg" className="w-full h-14 text-lg font-bold brand-gradient text-white border-0 shadow-lg hover:shadow-xl transition-all">
              Sign In
            </Button>
          </Link>
          <Link href="/signup" className="block w-full">
            <Button size="lg" variant="outline" className="w-full h-14 text-lg font-bold bg-card shadow-sm hover:bg-muted/50 transition-all">
              Create an Account
            </Button>
          </Link>
          
          <div className="pt-6">
            <Link href="/search" className="text-sm font-medium text-primary hover:underline">
              Continue as Guest
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}
