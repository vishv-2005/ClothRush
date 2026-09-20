import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        store:stores!inner(id, name, address, city, latitude, longitude, rating, total_ratings, preparation_time, is_open, phone),
        images:product_images(*),
        category:categories(id, name, slug),
        inventory(*)
      `)
      .eq('id', id)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('[API] Product detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
