import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), 'cache')

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
  } catch (error) {
    // Directory might already exist, that's fine
  }
}

// Generate a cache key from topic
function getCacheKey(topic: string): string {
  const hash = createHash('md5').update(topic.toLowerCase().trim()).digest('hex')
  return `design-${hash}.json`
}

// Get cache file path
function getCacheFilePath(topic: string): string {
  return path.join(CACHE_DIR, getCacheKey(topic))
}

// Check if design exists in cache
export async function getCachedDesign(topic: string): Promise<any | null> {
  try {
    await ensureCacheDir()
    const filePath = getCacheFilePath(topic)
    
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      const cached = JSON.parse(data)
      
      // Verify the cached design matches the topic (in case of hash collision)
      if (cached.topic && cached.topic.toLowerCase().trim() === topic.toLowerCase().trim()) {
        console.log(`Cache hit for topic: "${topic}"`)
        return cached
      }
    } catch (error) {
      // File doesn't exist or is invalid, that's fine
      return null
    }
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
  
  return null
}

// Save design to cache
export async function saveDesignToCache(design: any): Promise<void> {
  try {
    await ensureCacheDir()
    const filePath = getCacheFilePath(design.topic)
    
    const cacheData = {
      ...design,
      cachedAt: new Date().toISOString(),
    }
    
    await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2), 'utf-8')
    console.log(`Cached design for topic: "${design.topic}"`)
  } catch (error) {
    console.error('Error saving to cache:', error)
    // Don't throw - caching is optional
  }
}

// Clear cache (optional utility)
export async function clearCache(): Promise<void> {
  try {
    const files = await fs.readdir(CACHE_DIR)
    await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(file => fs.unlink(path.join(CACHE_DIR, file)))
    )
    console.log('Cache cleared')
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

