'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Settings } from 'lucide-react'
import { toast } from 'sonner'

export default function DeliverySettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('delivery_partners')
          .select('*, profiles(full_name, email)')
          .eq('user_id', user.id)
          .single()

        setProfile(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-delivery" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="h-6 w-6 text-delivery" />
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Your personal and contact information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input value={profile.profiles?.full_name || ''} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={profile.profiles?.email || ''} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input value={profile.phone || ''} readOnly className="bg-muted/50" />
          </div>
          <Button variant="outline" className="w-full" onClick={() => toast.success('Profile updates coming soon!')}>
            Request Update
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div>
              <p className="font-medium text-sm">Navigation App</p>
              <p className="text-xs text-muted-foreground">Default app for directions</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-full">Google Maps</span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div>
              <p className="font-medium text-sm">Push Notifications</p>
              <p className="text-xs text-muted-foreground">Alerts for new orders</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">Enabled</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
