import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Connectify',
    short_name: 'Connectify',
    description: 'Connect with people around you based on your interests and hobbies',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f9ff',
    theme_color: '#14b8a6',
    icons: [
      {
        src: '/logo-icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}