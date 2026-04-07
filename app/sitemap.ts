import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://rateschallenge.co.uk'

  return [
    {
      url:              base,
      lastModified:     new Date(),
      changeFrequency:  'monthly',
      priority:         1,
    },
    {
      url:              `${base}/check`,
      lastModified:     new Date(),
      changeFrequency:  'monthly',
      priority:         0.9,
    },
    {
      url:              `${base}/methodology`,
      lastModified:     new Date(),
      changeFrequency:  'yearly',
      priority:         0.6,
    },
    {
      url:              `${base}/guide/business-rates-challenge`,
      lastModified:     new Date(),
      changeFrequency:  'monthly',
      priority:         0.8,
    },
    {
      url:              `${base}/privacy`,
      lastModified:     new Date(),
      changeFrequency:  'yearly',
      priority:         0.3,
    },
    {
      url:              `${base}/terms`,
      lastModified:     new Date(),
      changeFrequency:  'yearly',
      priority:         0.3,
    },
  ]
}