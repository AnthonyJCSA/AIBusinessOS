/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Excluir proyectos anidados del build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers de seguridad para producción
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
              "connect-src 'self' https://*.supabase.co https://api.openai.com https://www.google-analytics.com https://www.googletagmanager.com",
              "frame-src 'none'",
            ].join('; '),
          },
        ],
      },
      // Cache agresivo para assets estáticos
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // Redirects de producción
  async redirects() {
    return [
      { source: '/app', destination: '/dashboard', permanent: true },
      { source: '/pos',  destination: '/dashboard', permanent: false },
    ]
  },

  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/coriva-tienda-nextjs/**'],
    }
    // Reducir tamaño del bundle en cliente
    if (!isServer) {
      config.resolve.fallback = { fs: false, net: false, tls: false }
    }
    return config
  },
}

module.exports = nextConfig
