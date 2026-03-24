import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://coriva-core.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: BASE,                                  lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/registro`,                    lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/demo`,                        lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/precios`,                     lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/comparacion`,                 lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/bodega`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/botica`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/casos-de-uso/bodega`,         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/casos-de-uso/tienda-ropa`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/casos-de-uso/salon-belleza`,  lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/casos-de-uso/restaurante`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
