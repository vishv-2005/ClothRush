import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addressSchema } from '@/lib/validations'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: addresses } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })

    return NextResponse.json({ addresses: addresses || [] })
  } catch (error) {
    console.error('[API] Addresses error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = addressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 })
    }

    // If setting as default, unset others
    if (parsed.data.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    const { data: address, error } = await supabase
      .from('addresses')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to save address' }, { status: 500 })
    }

    return NextResponse.json({ address })
  } catch (error) {
    console.error('[API] Address create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
