'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Store } from 'lucide-react'

export default function SellerSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: 'Vadodara',
    state: 'Gujarat',
    pincode: ''
  })

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: store } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', user.id)
          .single()

        if (store) {
          setStoreId(store.id)
          setForm({
            name: store.name || '',
            description: store.description || '',
            phone: store.phone || '',
            email: store.email || '',
            address: store.address || '',
            city: store.city || 'Vadodara',
            state: store.state || 'Gujarat',
            pincode: store.pincode || ''
          })
        }
      } catch (error) {
        console.error(error)
      } finally {
        setFetching(false)
      }
    }
    fetchStore()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      if (storeId) {
        // Update existing store
        const { error } = await supabase
          .from('stores')
          .update(form)
          .eq('id', storeId)
        
        if (error) throw error
        toast.success('Store updated successfully!')
      } else {
        // Create new store
        const { error } = await supabase
          .from('stores')
          .insert([{ ...form, owner_id: user.id, status: 'ACTIVE' }])
        
        if (error) throw error
        toast.success('Store created successfully!')
        router.push('/seller')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save store details')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Store Settings</h1>
          <p className="text-muted-foreground">Manage your store profile and details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>These details will be visible to customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Store Name *</label>
              <Input 
                required 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="e.g. Fashion Hub" 
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                placeholder="Tell customers about your store..." 
                rows={4} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Contact Phone</label>
                <Input 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})} 
                  placeholder="+91..." 
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Contact Email</label>
                <Input 
                  type="email"
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  placeholder="store@example.com" 
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Street Address</label>
              <Input 
                value={form.address} 
                onChange={e => setForm({...form, address: e.target.value})} 
                placeholder="123 Market Street" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">City</label>
                <Input 
                  required
                  value={form.city} 
                  onChange={e => setForm({...form, city: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">State</label>
                <Input 
                  required
                  value={form.state} 
                  onChange={e => setForm({...form, state: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">PIN Code</label>
                <Input 
                  value={form.pincode} 
                  onChange={e => setForm({...form, pincode: e.target.value})} 
                  placeholder="390001" 
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {storeId ? 'Update Store' : 'Create Store'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
