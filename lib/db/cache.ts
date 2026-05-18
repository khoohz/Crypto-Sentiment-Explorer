// Cache read/write/expiry
import { prisma } from "@/lib/db/prisma"
import { CacheEntry } from "@/types"

export const getCacheEntry = async (key: string): Promise<CacheEntry | null> => {
  const cacheEntry = await prisma.cache.findUnique({ where: { key }})
  if (!cacheEntry) return null
  if (cacheEntry.expires_at < new Date()) return null
  return cacheEntry as CacheEntry
}

export const setCacheEntry = async (key: string, value: string, ttlMinutes: number): Promise<CacheEntry> =>{
  const expires_at = new Date(Date.now() + ttlMinutes * 60 * 1000)
  const cacheEntry = await prisma.cache.upsert({ 
    where: { key},
    update: { value, expires_at },
    create: { key, value, expires_at}
  })

  return cacheEntry as CacheEntry
}