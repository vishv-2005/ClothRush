'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { IS_DEMO_MODE } from '@/lib/constants'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { label: 'Customer', email: 'demo.customer@clothrush.com', role: 'CUSTOMER' },
  { label: 'Seller', email: 'demo.seller@clothrush.com', role: 'SELLER' },
  { label: 'Admin', email: 'demo.admin@clothrush.com', role: 'ADMIN' },
  { label: 'Delivery', email: 'demo.delivery@clothrush.com', role: 'DELIVERY_PARTNER' },
]

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast.error(error.message)
        return
      }

      // Get user role to redirect appropriately
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = profile?.role
        let destination = redirectTo
        if (role === 'ADMIN') destination = '/admin'
        else if (role === 'SELLER') destination = '/seller'
        else if (role === 'DELIVERY_PARTNER') destination = '/delivery'
        
        toast.success('Welcome back!')
        router.push(destination)
        router.refresh()
      }
    } catch {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('demo123456')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: 'demo123456',
      })

      if (error) {
        toast.error(`Demo login failed: ${error.message}. Have you run the seed script?`)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = profile?.role
        let destination = '/'
        if (role === 'ADMIN') destination = '/admin'
        else if (role === 'SELLER') destination = '/seller'
        else if (role === 'DELIVERY_PARTNER') destination = '/delivery'
        
        toast.success(`Logged in as ${role}`)
        router.push(destination)
        router.refresh()
      }
    } catch {
      toast.error('Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-1 group">
            <span className="text-3xl font-black bg-gradient-to-br from-primary via-primary to-brand-light bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              Cloth
            </span>
            <span className="text-3xl font-black text-brand-accent-dark">Rush</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mt-6">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your credentials to access your ClothRush account
          </p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full brand-gradient text-white" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Sign In
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo Mode Quick Login */}
            {IS_DEMO_MODE && (
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  🔧 Demo Mode — Quick Login
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((demo) => (
                    <Button
                      key={demo.role}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleDemoLogin(demo.email)}
                      disabled={loading}
                    >
                      {demo.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
