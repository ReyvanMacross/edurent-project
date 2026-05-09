/** @type {import('next').NextConfig} */
console.log('NEXT CONFIG LOADED')

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'rjwzrtuzgqxzdsenrtrr.supabase.co', // TAMBAHIN SATU 'r' LAGI DI SINI
      },
    ],
  },
}

module.exports = nextConfig