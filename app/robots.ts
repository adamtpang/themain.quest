import type { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/board'],
      disallow: ['/life', '/signin', '/money-os', '/api/'],
    },
    sitemap: 'https://themain.quest/sitemap.xml',
  }
}
