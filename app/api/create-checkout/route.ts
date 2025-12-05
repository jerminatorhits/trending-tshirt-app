import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import FormData from 'form-data'

// Printful product variant IDs for Gildan 64000 Unisex Softstyle T-Shirt
const VARIANT_MAP: Record<string, Record<string, number>> = {
  white: {
    XS: 4011,
    S: 4012,
    M: 4013,
    L: 4014,
    XL: 4015,
    '2XL': 4016,
    '3XL': 4017,
  },
  black: {
    XS: 4018,
    S: 4019,
    M: 4020,
    L: 4021,
    XL: 4022,
    '2XL': 4023,
    '3XL': 4024,
  },
  navy: {
    XS: 4025,
    S: 4026,
    M: 4027,
    L: 4028,
    XL: 4029,
    '2XL': 4030,
    '3XL': 4031,
  },
  gray: {
    XS: 4032,
    S: 4033,
    M: 4034,
    L: 4035,
    XL: 4036,
    '2XL': 4037,
    '3XL': 4038,
  },
  red: {
    XS: 4039,
    S: 4040,
    M: 4041,
    L: 4042,
    XL: 4043,
    '2XL': 4044,
    '3XL': 4045,
  },
}

export async function POST(request: NextRequest) {
  try {
    const { designId, imageUrl, title, size, color, quantity } = await request.json()

    if (!designId || !imageUrl || !title || !size || !color || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const printfulApiKey = process.env.PRINTFUL_API_KEY

    if (!printfulApiKey) {
      // Return a demo checkout URL for testing
      return NextResponse.json({
        success: true,
        checkoutUrl: '#',
        message: 'Printful API key not configured. In production, this would create a real checkout.',
        productId: `product-${Date.now()}`,
      })
    }

    // Get variant ID based on size and color
    const variantId = VARIANT_MAP[color]?.[size]
    
    if (!variantId) {
      return NextResponse.json(
        { error: `Variant not found for size ${size} and color ${color}` },
        { status: 400 }
      )
    }

    // For checkout, we don't need to create a product first
    // We'll create the order directly when the user completes checkout
    // This avoids the base64 image issue with product creation
    
    // Check if image is base64 and warn user
    const isDataUrl = imageUrl.startsWith('data:')
    if (isDataUrl) {
      // Base64 images will be handled in create-order endpoint
      // For now, just return success so user can proceed to shipping form
    }
    
    // Return product info for checkout (order will be created in create-order endpoint)
    return NextResponse.json({
      success: true,
      checkoutUrl: null, // We'll handle checkout on the frontend
      productId: null, // Not needed for direct orders
      variantId,
      productData: {
        name: title,
        imageUrl, // Keep original URL - will handle in create-order
        variantId,
        size,
        color,
        quantity,
        price: 24.99,
      },
      message: 'Product ready for checkout',
      isBase64: isDataUrl,
    })
  } catch (error: any) {
    console.error('Error creating checkout:', error)
    
    // If Printful API fails, return a demo URL
    if (!process.env.PRINTFUL_API_KEY) {
      return NextResponse.json({
        success: true,
        checkoutUrl: '#',
        message: 'Printful API key not configured. Configure it to enable real checkout.',
        productId: `demo-${Date.now()}`,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create checkout',
      },
      { status: 500 }
    )
  }
}

