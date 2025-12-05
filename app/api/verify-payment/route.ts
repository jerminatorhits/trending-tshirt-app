import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    // Verify payment intent status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: `Payment status: ${paymentIntent.status}`,
      })
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to verify payment',
      },
      { status: 500 }
    )
  }
}

