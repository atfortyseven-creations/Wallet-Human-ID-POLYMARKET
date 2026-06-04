import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://whalecosystem.io'

  const routes = [
    // Core Platform
    { path: '', priority: 1.0, frequency: 'daily' },
    { path: '/dashboard', priority: 1.0, frequency: 'always' },
    { path: '/chat', priority: 0.9, frequency: 'always' },
    { path: '/portfolio', priority: 0.9, frequency: 'always' },
    { path: '/forum', priority: 0.9, frequency: 'always' },
    { path: '/news', priority: 0.9, frequency: 'hourly' },
    { path: '/academy', priority: 0.8, frequency: 'weekly' },

    { path: '/status', priority: 0.9, frequency: 'always' },
    { path: '/developers/api-docs', priority: 0.9, frequency: 'weekly' },
    { path: '/roadmap', priority: 0.9, frequency: 'weekly' },
  ] as const;

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date().toISOString(),
    // @ts-ignore - TS might complain about 'always' if not explicitly set in types, but it's valid for sitemaps
    changeFrequency: route.frequency,
    priority: route.priority,
  }))
}
