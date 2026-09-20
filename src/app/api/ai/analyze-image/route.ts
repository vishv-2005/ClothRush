import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAIProvider } from '@/lib/ai/service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Role check - must be SELLER or ADMIN
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'SELLER' && profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { imageBase64, mimeType } = await request.json()

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Image data missing' }, { status: 400 })
    }

    const aiProvider = createAIProvider()
    if (!aiProvider) {
      return NextResponse.json(
        { error: 'AI services are currently unavailable (Missing API Key)' },
        { status: 503 }
      )
    }

    // 1. Analyze the image to extract product details
    const analysis = await aiProvider.analyzeProductImage(imageBase64, mimeType)

    // Log generation for history
    await supabase.from('ai_generations').insert({
      user_id: user.id,
      generated_title: analysis.title,
      generated_description: analysis.description,
      generated_tags: analysis.tags,
      generated_category: analysis.category,
      generated_color: analysis.color,
      generated_material: analysis.material,
      generated_fit: analysis.fit,
      confidence_score: analysis.confidence_score,
      model_used: 'gemini-2.0-flash',
      status: 'SUCCESS',
    })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('[API] AI Analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
