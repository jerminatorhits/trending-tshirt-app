# 🔑 API Keys Setup Guide

This guide will help you get and add your API keys to make the app fully functional.

## Step 1: OpenAI API Key (Required for AI Design Generation)

### Getting Your OpenAI API Key:

1. **Visit**: https://platform.openai.com/
2. **Sign up** or **Log in** to your account
3. Click on your **profile icon** (top right) → **View API keys**
4. Click **"Create new secret key"**
5. **Copy the key immediately** (you won't be able to see it again!)
6. Give it a name like "T-Shirt Generator App"

### Adding to .env file:

Open the `.env` file in the project root and replace:
```
OPENAI_API_KEY=your_openai_api_key_here
```

With:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Cost**: ~$0.04-0.08 per design generated
**Free Tier**: OpenAI usually provides $5-15 in free credits for new accounts

---

## Step 2: Printful API Key (Optional - for Print-on-Demand)

### Getting Your Printful API Key:

1. **Visit**: https://www.printful.com/
2. **Create a free account** or **Log in**
3. Go to **Dashboard** → **Stores** → **API**
4. Click **"Generate API key"** or **"Create new key"**
5. **Copy the API key**

### Adding to .env file:

Open the `.env` file and replace:
```
PRINTFUL_API_KEY=your_printful_api_key_here
```

With:
```
PRINTFUL_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Cost**: Free integration! You only pay when a product is sold.

---

## Step 3: Verify Your Setup

After adding your keys:

1. **Restart your development server** (if running):
   - Stop it with `Ctrl+C`
   - Start again with `npm run dev`

2. **Test the app**:
   - Go to http://localhost:3000
   - Click "Refresh" to load trending topics
   - Select a topic and click "Generate T-Shirt Design"
   - You should see a real AI-generated design!

---

## 🔒 Security Notes

- **Never commit your `.env` file to Git** (it's already in `.gitignore`)
- **Don't share your API keys** publicly
- **Rotate keys** if you suspect they've been compromised
- **Use environment variables** in production (Vercel, Netlify, etc.)

---

## 🆘 Troubleshooting

### "Invalid API key" error
- Double-check you copied the entire key (no extra spaces)
- Make sure there are no quotes around the key in `.env`
- Verify the key is active in your OpenAI/Printful dashboard

### API key not working
- Restart your dev server after adding keys
- Check for typos in the `.env` file
- Ensure you're using the correct key type (API key, not webhook secret, etc.)

### Rate limit errors
- OpenAI has usage limits based on your plan
- Reddit API has 60 requests per minute limit
- Wait a few minutes and try again

---

## 💡 Testing Without API Keys

The app works in **demo mode** without API keys:
- Shows fallback trending topics
- Displays placeholder images for designs
- Simulates store integration

But you'll need real API keys for:
- ✅ Actual AI-generated designs
- ✅ Real print-on-demand integration
- ✅ Production use

---

## Next Steps

Once your API keys are set up:
1. Test generating a few designs
2. Try adding a design to the store
3. Customize design prompts if needed
4. Deploy to production (add keys in hosting platform's environment variables)

