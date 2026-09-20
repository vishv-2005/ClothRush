'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure global application variables</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Advanced platform settings will be available in the next release.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold mb-2">Platform Fee Configuration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Currently, the platform fee is hardcoded to 5% for all store transactions. 
              Future updates will allow you to modify this percentage globally or per-store.
            </p>
            <Button variant="outline" onClick={() => toast.info('Feature in development')}>
              Configure Fees
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
