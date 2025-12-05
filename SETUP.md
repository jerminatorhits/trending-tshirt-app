# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API keys:
   - **OPENAI_API_KEY**: Get from https://platform.openai.com/api-keys
   - **PRINTFUL_API_KEY**: Get from https://www.printful.com/dashboard/api (optional)

## Step 3: Run the Development Server

```bash
npm run dev
```

## Step 4: Open in Browser

Navigate to http://localhost:3000

## Testing Without API Keys

The app will work in demo mode without API keys:
- Trending topics will show fallback data if Reddit API fails
- Design generation will show placeholder images if OpenAI API key is missing
- Store integration will simulate success if Printful API key is missing

## Getting API Keys

### OpenAI (Required for AI Design Generation)

1. Visit https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy and paste into `.env` file

**Cost**: ~$0.04-0.08 per image

### Printful (Optional - for Print-on-Demand)

1. Visit https://www.printful.com/
2. Create a free account
3. Go to Dashboard → API
4. Generate an API key
5. Copy and paste into `.env` file

**Cost**: Free integration, pay per product when sold

## Troubleshooting

### "Module not found" errors
Run `npm install` again to ensure all dependencies are installed.

### Images not loading
- Check that your OpenAI API key is correct
- Verify the image URL is accessible
- Check browser console for errors

### API rate limits
- Reddit API has rate limits (60 requests per minute)
- OpenAI API has usage limits based on your plan
- The app includes fallback data if APIs fail

## Next Steps

1. Test the app with real API keys
2. Customize the design prompts in `app/api/generate-design/route.ts`
3. Add more social media sources in `app/api/trending/route.ts`
4. Deploy to Vercel or your preferred hosting platform

