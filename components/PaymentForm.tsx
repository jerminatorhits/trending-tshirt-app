'use client'

import { useState, FormEvent, useEffect } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'

// Get the publishable key from environment
const getStripePublishableKey = () => {
  if (typeof window !== 'undefined') {
    // Client-side: try to get from window or process.env
    return (window as any).__STRIPE_PUBLISHABLE_KEY__ || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
}

const stripePublishableKey = getStripePublishableKey()
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

interface PaymentFormProps {
  amount: number
  onSuccess: (paymentIntentId: string, shippingInfo?: any) => void
  onError: (error: string) => void
  shippingInfo: {
    name: string
    email: string
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
  orderDetails?: {
    designId: string
    imageUrl: string
    title: string
    size: string
    color: string
    quantity: number
  }
}

function CheckoutForm({ amount, onSuccess, onError, shippingInfo, orderDetails, clientSecret }: PaymentFormProps & { clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Reset loading when onError is called (for fulfillment failures)
  // This ensures the button becomes clickable again
  const originalOnError = onError
  const wrappedOnError = (error: string) => {
    setLoading(false) // Reset loading state
    originalOnError(error)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      // First, submit the elements to validate the form
      // This must be called before confirmPayment()
      const { error: submitError } = await elements.submit()
      
      if (submitError) {
        setErrorMessage(submitError.message || 'Form validation failed')
        onError(submitError.message || 'Form validation failed')
        setLoading(false)
        return
      }

      // Confirm payment using the existing clientSecret
      // For express payment methods (Apple Pay, Google Pay), shipping info will come from the payment method
      // For regular card payments, use the provided shipping info if available
      const confirmParams: any = {
        return_url: `${window.location.origin}/order-success`,
        payment_method_data: {
          billing_details: {
            // Provide empty values for fields set to 'never' to avoid errors
            phone: null,
            email: shippingInfo.email || null,
            // Only include address if we have shipping info
            ...(shippingInfo.name && shippingInfo.address ? {
              name: shippingInfo.name,
              address: {
                line1: shippingInfo.address,
                city: shippingInfo.city,
                state: shippingInfo.state,
                postal_code: shippingInfo.zip,
                country: shippingInfo.country,
              },
            } : {}),
          },
        },
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams,
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || 'Payment failed')
        wrappedOnError(error.message || 'Payment failed')
        setLoading(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Extract shipping info from payment intent if available (from Apple Pay/Google Pay)
        // Express payment methods like Apple Pay/Google Pay will populate paymentIntent.shipping
        let finalShippingInfo = shippingInfo
        
        if (paymentIntent.shipping) {
          finalShippingInfo = {
            name: paymentIntent.shipping.name || shippingInfo.name || '',
            email: shippingInfo.email, // Email typically comes from billing details
            address: paymentIntent.shipping.address?.line1 || shippingInfo.address || '',
            city: paymentIntent.shipping.address?.city || shippingInfo.city || '',
            state: paymentIntent.shipping.address?.state || shippingInfo.state || '',
            zip: paymentIntent.shipping.address?.postal_code || shippingInfo.zip || '',
            country: paymentIntent.shipping.address?.country || shippingInfo.country || 'US',
          }
        }

        // Get email from payment intent if available
        // Note: charges property may not be available in all PaymentIntent objects
        // We'll get email from billing_details if available
        if ((paymentIntent as any).charges?.data?.[0]?.billing_details?.email) {
          finalShippingInfo.email = (paymentIntent as any).charges.data[0].billing_details.email
        }

        // Payment succeeded - call onSuccess
        // Reset loading state here since payment is complete
        // Fulfillment happens separately in the parent component
        setLoading(false)
        onSuccess(paymentIntent.id, finalShippingInfo)
      } else {
        setLoading(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred')
      wrappedOnError(err.message || 'An error occurred')
      setLoading(false)
    }
  }
  
  // Also reset loading when fulfillment fails (called from parent via onError)
  // We need to listen for when the parent's error state changes
  // For now, we'll handle it by ensuring onError always resets loading

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <PaymentElement
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
            // Hide optional fields (email, phone) to reduce noise
            // Note: We must provide these in confirmParams even when set to 'never'
            fields: {
              billingDetails: {
                email: 'never',
                phone: 'never',
                address: 'auto',
              },
            },
            // Payment methods are automatically enabled via automatic_payment_methods in the PaymentIntent
            // Apple Pay, Google Pay will appear automatically when available
            // Shipping address will be automatically requested from Apple Pay/Google Pay
            // when the PaymentIntent has shipping configured (which we do in create-payment-intent)
            // Make sure these payment methods are enabled in your Stripe Dashboard:
            // Settings > Payment methods > Express checkouts
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Payment...
          </span>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Secure payment powered by Stripe</span>
      </div>
    </form>
  )
}

export default function PaymentForm(props: PaymentFormProps) {
  const [stripeKey, setStripeKey] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Mark as client-side
    // Get the key on client side
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
    console.log('Stripe publishable key:', key ? 'Found' : 'Missing')
    setStripeKey(key)

    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(props.amount * 100), // Convert to cents
            shipping: props.shippingInfo,
            orderDetails: props.orderDetails,
          }),
        })

        const data = await response.json()

        if (data.error || !data.clientSecret) {
          setError(data.error || 'Failed to initialize payment')
          setLoading(false)
        } else {
          setClientSecret(data.clientSecret)
          setLoading(false)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to create payment intent')
        setLoading(false)
      }
    }

    if (key) {
      createPaymentIntent()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Create payment intent once when component mounts

  // Build options with clientSecret when available
  const getOptions = (): StripeElementsOptions => ({
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#059669',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
    // Don't specify paymentMethodTypes here - let automatic_payment_methods handle it
    // Apple Pay, Google Pay, and Link will be shown automatically if available
  })

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Initializing payment...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
      </div>
    )
  }

  if (!stripeKey) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Stripe publishable key not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env file and restart the server.
        </p>
      </div>
    )
  }

  if (!stripePromise) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-800 dark:text-red-200">
          Failed to initialize Stripe. Please check your publishable key.
        </p>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-800 dark:text-red-200">
          Failed to create payment intent. Please try again.
        </p>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={getOptions()}>
      <CheckoutForm {...props} orderDetails={props.orderDetails} clientSecret={clientSecret!} />
    </Elements>
  )
}

