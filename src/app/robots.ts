import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/admin/', // Protect admin routes from crawling
    },
    sitemap: 'https://hemant-trauma-centre.vercel.app/sitemap.xml',
  };
}
