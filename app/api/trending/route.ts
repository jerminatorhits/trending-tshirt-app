import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
  try {
    // Fetch trending topics from Reddit
    const redditResponse = await axios.get(
      'https://www.reddit.com/r/popular/hot.json?limit=10',
      {
        headers: {
          'User-Agent': 'TrendingTShirtApp/1.0',
        },
      }
    )

    const topics = redditResponse.data.data.children.map((post: any, index: number) => ({
      id: `reddit-${post.data.id}`,
      title: post.data.title,
      source: 'Reddit',
      upvotes: post.data.ups,
      url: `https://reddit.com${post.data.permalink}`,
    }))

    // You can add more sources here (Facebook, Instagram, TikTok)
    // For now, we'll use Reddit as the primary source

    return NextResponse.json({
      success: true,
      topics,
    })
  } catch (error: any) {
    console.error('Error fetching trending topics:', error)
    
    // Fallback data if API fails
    const fallbackTopics = [
      {
        id: 'fallback-1',
        title: 'AI and Machine Learning',
        source: 'Reddit',
        upvotes: 15000,
      },
      {
        id: 'fallback-2',
        title: 'Climate Change Awareness',
        source: 'Reddit',
        upvotes: 12000,
      },
      {
        id: 'fallback-3',
        title: 'Space Exploration',
        source: 'Reddit',
        upvotes: 10000,
      },
    ]

    return NextResponse.json({
      success: true,
      topics: fallbackTopics,
    })
  }
}

