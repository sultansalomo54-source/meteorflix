/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'localhost',
      'images.tmdb.org',
      'image.tmdb.org',
      'supabase.co',
      'your-domain.com'
    ],
    unoptimized: false
  },
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Uncomment below for static export (shared hosting without Node.js)
  // output: 'export',
  // trailingSlash: true,
}

module.exports = nextConfig