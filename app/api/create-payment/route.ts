import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

// Pricing configuration
const BASE_COST = 12.00 // Your cost from Printful (approximate)
const MARKUP_PERCENTAGE = 1.5 // 50% markup = 1.5x
const SHIPPING_COST = 4.99

export async function POST(request: NextRequest) {
  try {
    const { designId, imageUrl, title, size, color, quantity, shipping } = await request.json()

    if (!designId || !imageUrl || !title || !size || !color || !quantity || !shipping) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe not configured. Add STRIPE_SECRET_KEY to .env file.',
        },
        { status: 400 }
      )
    }

    // Calculate pricing with margin
    const itemCost = BASE_COST * MARKUP_PERCENTAGE // Your selling price per item
    const subtotal = itemCost * quantity
    const shippingTotal = SHIPPING_COST
    const total = subtotal + shippingTotal

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
              description: `Custom T-shirt - ${size}, ${color}`,
              images: imageUrl.startsWith('http') ? [imageUrl] : [],
            },
            unit_amount: Math.round(itemCost * 100), // Convert to cents
          },
          quantity: quantity,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Shipping',
            },
            unit_amount: Math.round(shippingTotal * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?canceled=true`,
      metadata: {
        designId,
        imageUrl,
        title,
        size,
        color,
        quantity: quantity.toString(),
        shipping: JSON.stringify(shipping),
        // Store order details for fulfillment after payment
      },
      customer_email: shipping.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    })
  } catch (error: any) {
    console.error('Error creating payment session:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payment session',
      },
      { status: 500 }
    )
  }
}

