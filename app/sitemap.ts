import type { MetadataRoute } from 'next'
const BASE = 'https://themain.quest'
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 }]
}
