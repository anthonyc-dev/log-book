import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Digital Logbook',
    short_name: 'Logbook',
    description: 'High-precision activity logging system',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/clock-v3.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/clock-v3.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
