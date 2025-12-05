import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import axios from 'axios'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

// Printful product variant IDs
const VARIANT_MAP: Record<string, Record<string, number>> = {
  white: { XS: 4011, S: 4012, M: 4013, L: 4014, XL: 4015, '2XL': 4016, '3XL': 4017 },
  black: { XS: 4018, S: 4019, M: 4020, L: 4021, XL: 4022, '2XL': 4023, '3XL': 4024 },
  navy: { XS: 4025, S: 4026, M: 4027, L: 4028, XL: 4029, '2XL': 4030, '3XL': 4031 },
  gray: { XS: 4032, S: 4033, M: 4034, L: 4035, XL: 4036, '2XL': 4037, '3XL': 4038 },
  red: { XS: 4039, S: 4040, M: 4041, L: 4042, XL: 4043, '2XL': 4044, '3XL': 4045 },
}

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, designId, imageUrl, title, size, color, quantity, shipping } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      )
    }

    if (!designId || !imageUrl || !title || !size || !color || !quantity || !shipping) {
      return NextResponse.json(
        { error: 'Missing order details' },
        { status: 400 }
      )
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const printfulApiKey = process.env.PRINTFUL_API_KEY

    if (!printfulApiKey) {
      return NextResponse.json(
        { error: 'Printful API key not configured' },
        { status: 500 }
      )
    }

    // Get variant ID
    const variantId = VARIANT_MAP[color]?.[size]
    if (!variantId) {
      return NextResponse.json(
        { error: `Variant not found for size ${size} and color ${color}` },
        { status: 400 }
      )
    }

    // Handle base64 images - upload to hosting if needed
    const isDataUrl = imageUrl.startsWith('data:')
    let finalImageUrl = imageUrl

    if (isDataUrl) {
      try {
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/upload-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl }),
        })
        const uploadData = await uploadResponse.json()
        if (uploadData.success && uploadData.imageUrl) {
          finalImageUrl = uploadData.imageUrl
        } else {
          throw new Error(uploadData.error || 'Failed to upload image')
        }
      } catch (uploadError: any) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to upload image: ' + uploadError.message,
          },
          { status: 500 }
        )
      }
    }

    // Create order in Printful
    const orderResponse = await axios.post(
      'https://api.printful.com/orders',
      {
        recipient: {
          name: shipping.name,
          email: shipping.email,
          address1: shipping.address,
          city: shipping.city,
          state_code: shipping.state,
          country_code: shipping.country,
          zip: shipping.zip,
        },
        items: [
          {
            variant_id: variantId,
            quantity: parseInt(quantity.toString()),
            files: [
              {
                type: 'front',
                url: finalImageUrl,
                position: {
                  area_width: 1800,
                  area_height: 2400,
                  width: 1800,
                  height: 1800,
                  top: 300,
                  left: 0,
                },
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${printfulApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const orderId = orderResponse.data.result?.id

    if (!orderId) {
      return NextResponse.json(
        { error: 'Failed to create order in Printful' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId,
      printfulOrderId: orderId,
      message: 'Order fulfilled successfully!',
    })
  } catch (error: any) {
    console.error('Error fulfilling order:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.result?.message || error.message || 'Failed to fulfill order',
      },
      { status: 500 }
    )
  }
}
