import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OMRAYANAIR',
    short_name: 'OMRAYANAIR',
    description: 'Simplifiez votre voyage en Terre Sainte. Centralisez vos documents, suivez votre programme en temps réel et accédez à une assistance 24/7.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
