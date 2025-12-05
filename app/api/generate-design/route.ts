import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import axios from 'axios'
import { getCachedDesign, saveDesignToCache } from '@/lib/cache'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// Determine which AI provider to use (default: stability-ai)
const AI_PROVIDER = process.env.AI_PROVIDER || 'stability-ai'

export async function POST(request: NextRequest) {
  // Parse request body once and store it
  let topic = 'Trending Topic'
  let requestBody: any = {}
  
  try {
    requestBody = await request.json()
    topic = requestBody.topic || topic
  } catch {
    // If parsing fails, use default topic
  }

  if (!topic || topic === 'Trending Topic') {
    return NextResponse.json(
      { error: 'Topic is required' },
      { status: 400 }
    )
  }

  // Check cache first
  const cachedDesign = await getCachedDesign(topic)
  if (cachedDesign) {
    return NextResponse.json({
      success: true,
      design: cachedDesign,
      provider: cachedDesign.provider || 'cached',
      fromCache: true,
    })
  }

  // Generate a prompt for the T-shirt design
  const designPrompt = `A trendy, eye-catching T-shirt design for "${topic}". Bold and modern design suitable for printing on a T-shirt. Include text and graphics. Visually appealing with vibrant colors. Style: modern, minimalist, trendy. Square design suitable for T-shirt printing.`

  // Try Stability AI first (cheaper), then fallback to OpenAI
  let imageUrl = ''
  let errorMessage = ''
  let providerUsed = ''

  // Debug: Check which provider and keys are configured
  console.log('AI Provider:', AI_PROVIDER)
  console.log('Stability API Key configured:', !!process.env.STABILITY_API_KEY)
  console.log('OpenAI API Key configured:', !!process.env.OPENAI_API_KEY)

  // Try Stability AI (Stable Diffusion) - Much cheaper!
  if (AI_PROVIDER === 'stability-ai' && process.env.STABILITY_API_KEY) {
    try {
      providerUsed = 'stability-ai'
      
      // Use Stability AI v1 generation endpoint
      const stabilityResponse = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
          text_prompts: [
            {
              text: designPrompt,
              weight: 1,
            },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
          },
        }
      )

      // Stability AI returns base64 image in the response
      if (stabilityResponse.data?.artifacts && stabilityResponse.data.artifacts.length > 0) {
        const base64Image = stabilityResponse.data.artifacts[0].base64
        imageUrl = `data:image/png;base64,${base64Image}`
      }
    } catch (error: any) {
      // Better error logging
      const errorData = error.response?.data
      if (errorData) {
        try {
          const errorText = Buffer.isBuffer(errorData) 
            ? errorData.toString() 
            : typeof errorData === 'string' 
            ? errorData 
            : JSON.stringify(errorData)
          console.warn('Stability AI error:', errorText)
          errorMessage = errorText
        } catch {
          console.warn('Stability AI error:', error.message)
          errorMessage = error.message
        }
      } else {
        console.warn('Stability AI error:', error.message)
        errorMessage = error.message
      }
      // Will fallback to OpenAI or placeholder
    }
  }

  // Fallback to OpenAI DALL-E if Stability AI failed or not configured
  if (!imageUrl && process.env.OPENAI_API_KEY) {
    try {
      providerUsed = 'openai'
      const openaiResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: designPrompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      })
      imageUrl = openaiResponse.data[0]?.url || ''
    } catch (error: any) {
      console.warn('OpenAI error:', error.message)
      errorMessage = error.message
    }
  }

  // If we got an image, return it and cache it
  if (imageUrl) {
    const design = {
      id: `design-${Date.now()}`,
      topic,
      imageUrl,
      prompt: designPrompt,
      createdAt: new Date().toISOString(),
      provider: providerUsed,
    }

    // Save to cache for future use
    await saveDesignToCache(design)

    return NextResponse.json({
      success: true,
      design,
      provider: providerUsed,
    })
  }

  // No API keys configured or both failed - return placeholder
  const hasAnyKey = process.env.STABILITY_API_KEY || process.env.OPENAI_API_KEY
  const message = !hasAnyKey
    ? 'No AI API keys configured. Using placeholder design. Add STABILITY_API_KEY or OPENAI_API_KEY to generate real designs.'
    : `AI generation failed: ${errorMessage}. Using placeholder design.`

  return NextResponse.json({
    success: true,
    design: {
      id: `design-${Date.now()}`,
      topic,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
      prompt: `A trendy T-shirt design featuring "${topic}" with modern graphics and bold typography`,
      createdAt: new Date().toISOString(),
    },
    message,
    isFallback: true,
  })
}

