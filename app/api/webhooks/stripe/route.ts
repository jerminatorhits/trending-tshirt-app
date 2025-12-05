import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import axios from 'axios'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

const VARIANT_MAP: Record<string, Record<string, number>> = {
  white: { XS: 4011, S: 4012, M: 4013, L: 4014, XL: 4015, '2XL': 4016, '3XL': 4017 },
  black: { XS: 4018, S: 4019, M: 4020, L: 4021, XL: 4022, '2XL': 4023, '3XL': 4024 },
  navy: { XS: 4025, S: 4026, M: 4027, L: 4028, XL: 4029, '2XL': 4030, '3XL': 4031 },
  gray: { XS: 4032, S: 4033, M: 4034, L: 4035, XL: 4036, '2XL': 4037, '3XL': 4038 },
  red: { XS: 4039, S: 4040, M: 4041, L: 4042, XL: 4043, '2XL': 4044, '3XL': 4045 },
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Fulfill the order
    try {
      const { designId, imageUrl, title, size, color, quantity, shipping: shippingStr } = session.metadata || {}
      
      if (!imageUrl || !title || !size || !color || !quantity || !shippingStr) {
        console.error('Missing order details in session metadata')
        return NextResponse.json({ received: true })
      }

      const shipping = JSON.parse(shippingStr)
      const printfulApiKey = process.env.PRINTFUL_API_KEY

      if (!printfulApiKey) {
        console.error('Printful API key not configured')
        return NextResponse.json({ received: true })
      }

      // Handle base64 images
      let finalImageUrl = imageUrl
      if (imageUrl.startsWith('data:')) {
        try {
          const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/upload-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl }),
          })
          const uploadData = await uploadResponse.json()
          if (uploadData.success && uploadData.imageUrl) {
            finalImageUrl = uploadData.imageUrl
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError)
        }
      }

      // Get variant ID
      const variantId = VARIANT_MAP[color]?.[size]
      if (!variantId) {
        console.error(`Variant not found for ${size} ${color}`)
        return NextResponse.json({ received: true })
      }

      // Create Printful order
      await axios.post(
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
              quantity: parseInt(quantity),
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

      console.log('Order fulfilled successfully via webhook')
    } catch (error: any) {
      console.error('Error fulfilling order from webhook:', error)
    }
  }

  return NextResponse.json({ received: true })
}

