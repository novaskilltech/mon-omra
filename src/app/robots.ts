import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/guides', '/legal', '/privacy', '/login'],
      disallow: ['/backoffice', '/dashboard', '/api'],
    },
    sitemap: 'https://omrayanair.vercel.app/sitemap.xml',
  };
}
