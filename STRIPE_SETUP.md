# 💳 Stripe Payment Integration Setup

## Why Stripe?

Stripe allows you to:
- ✅ Collect payment from customers **before** creating Printful orders
- ✅ Keep your profit margin automatically
- ✅ No manual work - orders are fulfilled automatically after payment
- ✅ Professional checkout experience

## Setup Steps

### 1. Create Stripe Account

1. Go to https://stripe.com/
2. Sign up for a free account
3. Complete account setup

### 2. Get Your API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Secret Key** (starts with `sk_test_` for testing)
3. Copy your **Publishable Key** (starts with `pk_test_` for testing)

### 3. Add Keys to .env File

Open your `.env` file and add:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### 4. Set Up Webhook (For Automatic Order Fulfillment)

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
   - For local testing: Use ngrok or similar to expose localhost
4. Select event: `checkout.session.completed`
5. Copy the **Webhook Signing Secret**
6. Add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

## How It Works

1. **Customer clicks "Complete Order"**
   - Creates Stripe Checkout session
   - Customer enters payment info

2. **Customer pays**
   - Stripe processes payment
   - Customer redirected to success page

3. **Order automatically fulfilled**
   - Webhook receives payment confirmation
   - Creates Printful order automatically
   - You keep the profit margin!

## Pricing Configuration

Current settings in `app/api/create-payment/route.ts`:
- **Base Cost**: $12.00 (your cost from Printful)
- **Markup**: 50% (1.5x multiplier)
- **Selling Price**: $18.00 per shirt
- **Shipping**: $4.99
- **Your Profit**: ~$6.00 per shirt (50% margin)

You can adjust these in the code:
```typescript
const BASE_COST = 12.00 // Your actual Printful cost
const MARKUP_PERCENTAGE = 1.5 // 50% markup
const SHIPPING_COST = 4.99
```

## Testing

Use Stripe's test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date and any CVC

## Production

When ready for production:
1. Switch to **Live API keys** in Stripe dashboard
2. Update `.env` with live keys
3. Set up production webhook endpoint
4. Test thoroughly before going live!

## Cost

- **Stripe fees**: 2.9% + $0.30 per transaction
- **Your margin**: Set in code (currently 50%)
- **Net profit**: Selling price - Printful cost - Stripe fees

---

**You're all set! Customers will pay you directly, and orders will be fulfilled automatically! 🎉**

