'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Truck, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createDeliveryPartner } from './actions'

export default function AdminDeliveryPage() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const formRef = useRef<HTMLFormElement>(null)

  const fetchPartners = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('delivery_partners')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
      
      setPartners(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    const result = await createDeliveryPartner(formData)
    
    if (result.success) {
      toast.success('Delivery Partner registered successfully!')
      setShowForm(false)
      formRef.current?.reset()
      await fetchPartners() // Refresh the list
    } else {
      toast.error(result.error || 'Failed to register delivery partner')
    }

    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Delivery Partners</h1>
            <p className="text-muted-foreground">Manage your delivery fleet</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? 'Cancel' : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Register New
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Register Delivery Partner</CardTitle>
            <CardDescription>Create a new account with Delivery privileges.</CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input name="fullName" required placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input name="email" type="email" required placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone *</label>
                  <Input name="phone" required placeholder="+91..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Temporary Password *</label>
                  <Input name="password" required type="password" placeholder="Min 6 characters" minLength={6} />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Partners</CardTitle>
        </CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No delivery partners registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Contact</th>
                    <th className="px-6 py-3 font-medium">Rating</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{partner.profiles?.full_name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{partner.phone}</span>
                          <span className="text-xs text-muted-foreground">{partner.profiles?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{partner.rating} / 5.0</span>
                          <span className="text-xs text-muted-foreground">{partner.total_deliveries} deliveries</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] uppercase font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {partner.availability || 'OFFLINE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
