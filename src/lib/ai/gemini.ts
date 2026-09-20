// ==========================================
// Google Gemini AI Provider Implementation
// ==========================================

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, ProductAnalysis, ImageGenerationResult } from './service'

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI
  private modelName: string = 'gemini-3.6-flash'

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async analyzeProductImage(imageBase64: string, mimeType: string): Promise<ProductAnalysis> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName })

      const prompt = `You are a fashion product analyst for an Indian fashion e-commerce platform called VastraNow.

Analyze this clothing/fashion product image and provide structured information.

IMPORTANT RULES:
- Only describe what you can confidently see in the image
- If you're uncertain about a detail, set it to null
- Add it to the "requires_seller_confirmation" list
- Never fabricate brand names, exact materials you can't identify, or specific product specs
- Focus on visual attributes: color, style, fit, pattern
- Write descriptions targeting Indian fashion consumers
- Use INR pricing context
- Be descriptive but honest

Respond in this exact JSON format:
{
  "title": "A concise, attractive product title (e.g., 'Black Oversized Cotton Shirt')",
  "description": "A detailed 2-3 sentence product description highlighting features, style, and appeal",
  "short_description": "A single line summary under 80 characters",
  "category": "One of: Shirts, T-Shirts, Jeans, Kurtis, Dresses, Sarees, Jackets, Footwear, Trousers, Others, or null if unclear",
  "tags": ["array", "of", "relevant", "searchable", "tags"],
  "color": "Primary color or color combination, or null",
  "material": "Fabric/material if identifiable (e.g., Cotton, Polyester, Silk), or null",
  "fit": "One of: SLIM, REGULAR, LOOSE, OVERSIZED, or null if unclear",
  "gender": "One of: MEN, WOMEN, KIDS, UNISEX, or null",
  "confidence_score": 0.85,
  "requires_seller_confirmation": ["List of fields where seller should verify", "e.g., material, exact size chart"]
}

Return ONLY valid JSON, no markdown formatting.`

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
          },
        },
      ])

      const responseText = result.response.text()
      
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = responseText.trim()
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }

      const analysis: ProductAnalysis = JSON.parse(cleanedResponse)

      // Ensure required fields have defaults
      return {
        title: analysis.title || 'Untitled Product',
        description: analysis.description || '',
        short_description: analysis.short_description || '',
        category: analysis.category || null,
        tags: Array.isArray(analysis.tags) ? analysis.tags : [],
        color: analysis.color || null,
        material: analysis.material || null,
        fit: analysis.fit || null,
        gender: analysis.gender || null,
        confidence_score: typeof analysis.confidence_score === 'number' ? analysis.confidence_score : 0.5,
        requires_seller_confirmation: Array.isArray(analysis.requires_seller_confirmation) 
          ? analysis.requires_seller_confirmation 
          : ['material', 'exact sizing'],
      }
    } catch (error) {
      console.error('[AI] Gemini analysis failed:', error)
      throw new Error(
        `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async generatePresentationImage(
    imageBase64: string,
    mimeType: string,
    productInfo: Partial<ProductAnalysis>
  ): Promise<ImageGenerationResult> {
    try {
      // Attempt to use Gemini's image generation capabilities
      // This uses the multimodal model to generate an enhanced product image
      const model = this.genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

      const prompt = `You are a professional fashion photographer. 
Analyze this product image and describe how it would look in a professional e-commerce product photo.
The product is: ${productInfo.title || 'a clothing item'}.
Color: ${productInfo.color || 'unknown'}.

Provide a brief professional product photo description that could be used as alt text.
Keep it under 100 words.`

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
          },
        },
      ])

      const description = result.response.text()

      // For MVP: We return the original image with enhanced alt text
      // Image generation via Gemini requires specific model access that may not be
      // available on all API keys. The architecture supports swapping in a dedicated
      // image generation provider later.
      return {
        success: false,
        fallback_reason: 'AI image generation is available as a premium feature. Using original product image with AI-generated description.',
        error: description, // Store the generated description for alt text
      }
    } catch (error) {
      console.error('[AI] Image generation failed:', error)
      return {
        success: false,
        fallback_reason: 'AI image generation unavailable. Original product image will be used.',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

/**
 * Create an AI provider instance.
 * Returns null if API key is not configured.
 */
export function createAIProvider(): GeminiProvider | null {
  try {
    return new GeminiProvider()
  } catch {
    console.warn('[AI] Could not initialize Gemini provider. AI features will be unavailable.')
    return null
  }
}
