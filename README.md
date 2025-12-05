# 🎨 Trending T-Shirt Generator

An AI-powered web application that generates T-shirt designs based on trending topics from social media platforms. The app fetches trending topics, creates unique designs using AI, and integrates with print-on-demand services.

## ✨ Features

- **Trending Topics Aggregation**: Fetches trending topics from Reddit (easily extensible to Facebook, Instagram, TikTok)
- **AI Design Generation**: Uses Stability AI (Stable Diffusion) or OpenAI's DALL-E 3 to create unique T-shirt designs
- **Print-on-Demand Integration**: Ready to integrate with Printful for automated printing and shipping
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **Real-time Updates**: Refresh trending topics and generate new designs on demand

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Stability AI API key (recommended - much cheaper!) or OpenAI API key (for AI design generation)
- Printful API key (optional, for print-on-demand integration)

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd trending-tshirt-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your API keys:
   ```
   # Recommended: Stability AI (5-10x cheaper!)
   STABILITY_API_KEY=your_stability_api_key_here
   AI_PROVIDER=stability-ai
   
   # Or use OpenAI (more expensive)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional: Printful for print-on-demand
   PRINTFUL_API_KEY=your_printful_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 API Setup Instructions

### Stability AI (RECOMMENDED - Much Cheaper!)

1. Go to [Stability AI Platform](https://platform.stability.ai/)
2. Sign up for a free account (includes free credits!)
3. Navigate to Account → API Keys
4. Create a new API key
5. Add it to your `.env` file as `STABILITY_API_KEY`
6. Set `AI_PROVIDER=stability-ai` in your `.env`

**Cost**: ~$0.004-0.02 per image (5-10x cheaper than DALL-E!)

See `STABILITY_AI_SETUP.md` for detailed instructions.

### OpenAI API (Alternative - More Expensive)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env` file as `OPENAI_API_KEY`
6. Set `AI_PROVIDER=openai` in your `.env`

**Cost**: ~$0.04-0.08 per image (DALL-E 3)

### Printful API (Optional - for Print-on-Demand)

1. Go to [Printful](https://www.printful.com/)
2. Create an account
3. Navigate to Dashboard → API
4. Generate an API key
5. Add it to your `.env` file as `PRINTFUL_API_KEY`

**Cost**: Free integration, you pay per product when sold

### Reddit API (Already Configured)

The app uses Reddit's public API which doesn't require authentication for basic trending topics. No setup needed!

## 🏗️ Project Structure

```
trending-tshirt-app/
├── app/
│   ├── api/
│   │   ├── trending/          # Fetches trending topics from Reddit
│   │   ├── generate-design/    # Generates AI designs (Stability AI or DALL-E)
│   │   └── add-to-store/       # Adds designs to Printful store
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page component
│   └── globals.css             # Global styles
├── components/
│   ├── TrendingTopics.tsx      # Displays trending topics
│   ├── DesignGenerator.tsx     # Design generation UI
│   └── TShirtPreview.tsx       # T-shirt preview and store integration
├── package.json
└── README.md
```

## 💰 Cost Breakdown

### Development Costs
- **One-time**: $0 (if you build it yourself)
- **Hosting**: $0-20/month (Vercel free tier, or similar)

### Monthly Operating Costs
- **Stability AI** (recommended): ~$0.004-0.02 per design generated
- **OpenAI API** (alternative): ~$0.04-0.08 per design generated
- **Printful**: Free (you pay per product when sold)
- **Reddit API**: Free
- **Hosting**: $0-20/month

### Revenue Model
- Print-on-demand services typically offer 10-30% margins
- Example: $25 T-shirt → $2.50-7.50 profit per sale

## 🔧 Configuration

### Adding More Social Media Sources

To add Facebook, Instagram, or TikTok:

1. **Facebook/Instagram**: Use the Graph API
   - Requires app approval from Meta
   - Free tier available

2. **TikTok**: Use TikTok API
   - Requires developer account
   - Free tier available

3. **Twitter/X**: Requires paid API access ($100+/month)

Edit `app/api/trending/route.ts` to add new sources.

### Customizing Design Prompts

Edit the prompt in `app/api/generate-design/route.ts` to change the style, colors, or design approach.

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 📝 Next Steps

1. **Add Content Moderation**: Filter inappropriate content before generating designs
2. **Quality Control**: Add manual review step before publishing
3. **Analytics**: Track which designs are most popular
4. **A/B Testing**: Test different design styles
5. **Legal Compliance**: Add terms of service and copyright notices
6. **Payment Integration**: Add Stripe/PayPal for direct sales
7. **User Accounts**: Allow users to save favorite designs

## ⚠️ Important Notes

- **Copyright**: Ensure designs don't infringe on trademarks or copyrights
- **Content Moderation**: Implement filtering for inappropriate content
- **API Rate Limits**: Be mindful of rate limits for all APIs
- **Legal Compliance**: Review terms of service for all integrated platforms

## 🐛 Troubleshooting

### Images not loading
- Check that your OpenAI API key is correct
- Verify image URLs are accessible
- Check browser console for CORS errors

### Trending topics not loading
- Reddit API may be rate-limited
- Check network tab in browser dev tools
- App includes fallback data if API fails

### Printful integration not working
- Verify API key is correct
- Check Printful API documentation for latest changes
- Ensure you have a Printful store set up

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

---

**Built with ❤️ using Next.js, OpenAI, and Printful**

