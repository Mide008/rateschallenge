import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow:  [
          '/api/',
          '/dashboard/',
          '/analysis/',
          '/auth/callback',
        ],
      },
    ],
    sitemap: 'https://rateschallenge.co.uk/sitemap.xml',
  }
}