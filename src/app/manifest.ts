import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FeeFlow',
    short_name: 'FeeFlow',
    description: 'Secure Fee Payments',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#1db954',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
