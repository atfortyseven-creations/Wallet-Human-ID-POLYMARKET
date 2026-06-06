import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://humanidfi.com'

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
    { path: '/whitepaper', priority: 0.9, frequency: 'monthly' },
    { path: '/tokenomics', priority: 0.8, frequency: 'monthly' },

    // Legal & Regulatory — indexed for CNMV / Aztec evaluation
    { path: '/legal/compliance', priority: 0.9, frequency: 'weekly' },
    { path: '/legal/aztec-architecture', priority: 0.9, frequency: 'weekly' },
    { path: '/legal/aztec-grant-transparency', priority: 0.9, frequency: 'weekly' },
    { path: '/legal/legal-notice', priority: 0.7, frequency: 'monthly' },
    { path: '/legal/privacy', priority: 0.7, frequency: 'monthly' },
    { path: '/legal/terms', priority: 0.7, frequency: 'monthly' },
    { path: '/legal/cookies', priority: 0.6, frequency: 'monthly' },
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
