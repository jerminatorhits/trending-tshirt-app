'use client'

import { useState } from 'react'
import { TrendingTopic, GeneratedDesign } from '@/app/page'
import Image from 'next/image'

interface TShirtPreviewProps {
  design: GeneratedDesign
  topic: TrendingTopic | null
}

export default function TShirtPreview({ design, topic }: TShirtPreviewProps) {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        👕 T-Shirt Preview
      </h2>
      
      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 aspect-square flex items-center justify-center">
          {design.imageUrl ? (
            <Image
              src={design.imageUrl}
              alt={design.topic}
              width={400}
              height={400}
              className="rounded-lg object-contain"
              unoptimized
            />
          ) : (
            <div className="text-gray-400">Loading design...</div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {topic?.title || design.topic}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {design.prompt}
          </p>
          {design.isFallback && design.message && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ <strong>Note:</strong> {design.message}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.open(design.imageUrl, '_blank')}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            📥 Download Design
          </button>
        </div>
      </div>
    </div>
  )
}

