# 🎨 Stability AI Setup Guide (Cheaper Alternative!)

## Why Stability AI?

**Cost Comparison:**
- **OpenAI DALL-E 3**: ~$0.04-0.08 per image
- **Stability AI (Stable Diffusion)**: ~$0.004-0.02 per image
- **Savings**: 5-10x cheaper! 💰

## Getting Your Stability AI API Key

### Step 1: Create Account
1. Go to https://platform.stability.ai/
2. Click **"Sign Up"** or **"Get Started"**
3. Create a free account (they offer free credits to start!)

### Step 2: Get API Key
1. Once logged in, go to **Account** → **API Keys**
2. Click **"Create API Key"**
3. Give it a name (e.g., "T-Shirt Generator")
4. **Copy the key** (starts with `sk-`)

### Step 3: Add to .env File
Open your `.env` file and add:
```
STABILITY_API_KEY=sk-your-key-here
```

Also make sure:
```
AI_PROVIDER=stability-ai
```

### Step 4: Restart Your Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Pricing Details

Stability AI offers:
- **Free credits** for new accounts
- **Pay-as-you-go** pricing
- **Much cheaper** than OpenAI for image generation

Check current pricing at: https://platform.stability.ai/pricing

## Alternative: Replicate (Even Cheaper Option)

If you want an even cheaper option, you can also use **Replicate** which hosts Stable Diffusion models:

1. Go to https://replicate.com/
2. Sign up for free
3. Get API token
4. Cost: ~$0.002-0.01 per image (even cheaper!)

Would you like me to add Replicate support as well?

## Testing

Once you've added your Stability AI key:
1. Restart your dev server
2. Try generating a design
3. You should see real AI-generated images at a fraction of the cost!

## Troubleshooting

### "Invalid API key" error
- Make sure you copied the entire key
- Check for extra spaces in the `.env` file
- Verify the key is active in your Stability AI dashboard

### API rate limits
- Stability AI has generous rate limits
- Free tier includes credits to get started
- Upgrade for higher limits if needed

---

**You're all set! Enjoy much cheaper AI image generation! 🎉**

