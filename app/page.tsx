'use client'

import { useState, useEffect } from 'react'
import TrendingTopics from '@/components/TrendingTopics'
import DesignGenerator from '@/components/DesignGenerator'
import TShirtPreview from '@/components/TShirtPreview'
import Checkout from '@/components/Checkout'

export interface TrendingTopic {
  id: string
  title: string
  source: string
  upvotes?: number
  url?: string
}

export interface GeneratedDesign {
  id: string
  topic: string
  imageUrl: string
  prompt: string
  createdAt: string
  message?: string
  isFallback?: boolean
}

export default function Home() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null)
  const [generatedDesign, setGeneratedDesign] = useState<GeneratedDesign | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTrendingTopics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/trending')
      const data = await response.json()
      setTrendingTopics(data.topics || [])
    } catch (error) {
      console.error('Error fetching trending topics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrendingTopics()
  }, [])

  const handleGenerateDesign = async (topic: TrendingTopic) => {
    setSelectedTopic(topic)
    setLoading(true)
    try {
      const response = await fetch('/api/generate-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic.title }),
      })
      const data = await response.json()
      setGeneratedDesign({
        ...data.design,
        message: data.message,
        isFallback: data.isFallback,
      })
    } catch (error) {
      console.error('Error generating design:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            🎨 Trending T-Shirt Generator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            AI-powered designs from what&apos;s trending right now
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <TrendingTopics
              topics={trendingTopics}
              loading={loading}
              onRefresh={fetchTrendingTopics}
              onSelectTopic={handleGenerateDesign}
            />
            
            {selectedTopic && (
              <DesignGenerator
                topic={selectedTopic}
                onGenerate={handleGenerateDesign}
                loading={loading}
              />
            )}
          </div>

          <div className="space-y-6">
            {generatedDesign && (
              <TShirtPreview
                design={generatedDesign}
                topic={selectedTopic}
              />
            )}
          </div>

          <div className="space-y-6">
            {generatedDesign && (
              <Checkout
                design={generatedDesign}
                designTitle={selectedTopic?.title || generatedDesign.topic}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

