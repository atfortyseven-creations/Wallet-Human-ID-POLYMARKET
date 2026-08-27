import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://humanidfi.com'

  const routes = [
    // Core Platform
    { path: '', priority: 1.0, frequency: 'daily' },
    { path: '/status', priority: 0.9, frequency: 'always' },
    { path: '/developers/api-docs', priority: 0.9, frequency: 'weekly' },
    // Legal
    { path: '/legal/privacy', priority: 0.7, frequency: 'monthly' },
    { path: '/legal/terms', priority: 0.7, frequency: 'monthly' },
    { path: '/legal/security', priority: 0.6, frequency: 'monthly' },
  ] as const;

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date().toISOString(),
    // @ts-ignore
    changeFrequency: route.frequency,
    priority: route.priority,
  }))
}
