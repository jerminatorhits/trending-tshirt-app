# 🔑 Step-by-Step: Getting Your Stripe API Keys

## Quick Steps

1. **Go to Stripe**: https://stripe.com/
2. **Sign up** for a free account (or log in)
3. **Go to API Keys**: https://dashboard.stripe.com/apikeys
4. **Copy your keys**: Secret Key and Publishable Key
5. **Add to .env**: Paste them into your `.env` file

## Detailed Instructions

### Step 1: Create/Login to Stripe Account

1. Visit **https://stripe.com/**
2. Click **"Sign in"** or **"Start now"** (top right)
3. Sign up with:
   - Email and password
   - Google account
   - Apple account

### Step 2: Complete Account Setup

1. Fill in your business information:
   - Business name
   - Country
   - Business type
2. Add your business details (you can use test mode for now)
3. Verify your email if needed

### Step 3: Get Your API Keys

1. Once logged in, go to: **https://dashboard.stripe.com/apikeys**
   - Or click: **Developers** → **API keys** in the left sidebar

2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` for testing)
   - **Secret key** (starts with `sk_test_` for testing)
     - Click **"Reveal test key"** to see it

3. **Copy both keys**:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

### Step 4: Add to Your .env File

Open your `.env` file and add:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

Replace `your_secret_key_here` and `your_publishable_key_here` with your actual keys.

### Step 5: Restart Your Server

```bash
# Stop your server (Ctrl+C)
npm run dev
```

## Test Mode vs Live Mode

- **Test Mode** (default):
  - Keys start with `pk_test_` and `sk_test_`
  - Use test cards (won't charge real money)
  - Perfect for development

- **Live Mode**:
  - Keys start with `pk_live_` and `sk_live_`
  - Charges real money
  - Switch to this when ready for production

## Test Cards

For testing, use these cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

## Important Notes

- **Never share your Secret Key** publicly
- **Test keys** are safe to use in development
- **Live keys** should only be used in production
- Keys are already in `.gitignore` so they won't be committed

---

**Once you have your keys, share them here and I'll add them to your .env file!** 🚀

