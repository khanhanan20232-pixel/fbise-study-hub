import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://fbise-study-hub-production.up.railway.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/past-papers', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/model-papers', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/quizzes', priority: 0.9, changeFrequency: 'daily' },
    { path: '/ai-paper-check', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/classes/class-9', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/classes/class-10', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/classes/class-11', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/classes/class-12', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/leaderboard', priority: 0.6, changeFrequency: 'daily' },
    { path: '/announcements', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/login', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/signup', priority: 0.4, changeFrequency: 'monthly' },
  ];

  return routes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
