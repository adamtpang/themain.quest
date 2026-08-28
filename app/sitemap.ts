import type { MetadataRoute } from 'next'
const BASE = 'https://themain.quest'
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: BASE, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/board`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/about`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
  ]
}
