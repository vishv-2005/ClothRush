import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const q = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const gender = searchParams.get('gender')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const size = searchParams.get('size')
    const sort = searchParams.get('sort') || 'relevance'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('products')
      .select(`
        *,
        store:stores!inner(id, name, latitude, longitude, rating, preparation_time),
        images:product_images(*),
        category:categories(id, name, slug)
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('is_published', true)

    // Text search
    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,color.ilike.%${q}%,tags.cs.{${q}}`)
    }

    // Category filter
    if (category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()
      if (cat) {
        query = query.eq('category_id', cat.id)
      }
    }

    // Gender filter
    if (gender) {
      query = query.eq('gender', gender)
    }

    // Price range
    if (minPrice) query = query.gte('price', parseFloat(minPrice))
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice))

    // Sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      default:
        query = query.order('rating', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      console.error('[API] Products fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    return NextResponse.json({
      products: products || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('[API] Products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
