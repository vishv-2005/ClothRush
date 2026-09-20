'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Store } from 'lucide-react'

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('stores')
          .select('*, profiles(full_name, email)')
          .order('created_at', { ascending: false })
        
        setStores(data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Stores</h1>
          <p className="text-muted-foreground">Manage registered stores and sellers</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store List</CardTitle>
        </CardHeader>
        <CardContent>
          {stores.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No stores found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium">Store Name</th>
                    <th className="px-6 py-3 font-medium">Owner</th>
                    <th className="px-6 py-3 font-medium">City</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{store.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{store.profiles?.full_name || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{store.profiles?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{store.city}, {store.state}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] uppercase font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          {store.status || 'ACTIVE'}
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
