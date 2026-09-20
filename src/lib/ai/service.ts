// ==========================================
// AI Service Abstraction Layer
// ==========================================
// This module provides a provider-agnostic interface for AI operations.
// Currently implemented with Google Gemini.
// Can be replaced with any other provider by implementing the AIProvider interface.

export interface ProductAnalysis {
  title: string
  description: string
  short_description: string
  category: string | null
  tags: string[]
  color: string | null
  material: string | null
  fit: string | null
  gender: string | null
  confidence_score: number
  requires_seller_confirmation: string[]
}

export interface ImageGenerationResult {
  success: boolean
  image_url?: string
  image_base64?: string
  error?: string
  fallback_reason?: string
}

export interface AIProvider {
  analyzeProductImage(imageBase64: string, mimeType: string): Promise<ProductAnalysis>
  generatePresentationImage(
    imageBase64: string,
    mimeType: string,
    productInfo: Partial<ProductAnalysis>
  ): Promise<ImageGenerationResult>
}

// Re-export the Gemini implementation as the default
export { GeminiProvider, createAIProvider } from './gemini'
export type { ProductAnalysis as AIProductAnalysis }
