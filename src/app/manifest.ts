import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HemantTraumaCentre',
    short_name: 'HemantTrauma',
    description: 'Best Orthopedic Doctor in Bhagalpur - Dr. Himanshu Kumar Hemant',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#EF4444', // Red-500 from your theme
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
