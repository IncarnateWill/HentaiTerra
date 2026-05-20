import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/api/sitemap.xml',
        '/robots.txt',
      ],
      disallow: [
        // Admin & Auth routes
        '/admin/',
        '/auth/',
        '/sso-callback',
        '/sso-callback/*',
        '/oauth/*',
        '/verify-email',
        '/verify-email/*',

        // Clerk authentication routes

        '/user',
        '/user/*',

        // User-specific content
        '/watchlist/',
        '/profile/*',
        '/profile/*/watchlist',
        '/profile/*/watchlist/*',

        // API routes (except sitemap)
        '/api/',
        '/api/episodes/*/views',
        '/api/episodes/*/likes',
        '/api/analytics',
        '/api/analytics/*',
        '/api/webhook',
        '/api/webhook/*',
        '/api/trpc/*',

        // Next.js internal routes
        '/_next/',
        '/_next/static/',
        '/_next/static/*',
        '/_next/image/',
        '/_next/image/*',
        '/_next/data/',
        '/_next/data/*',
        '/_next/webpack-hmr',
        '/__nextjs_original-stack-frame',
        '/__nextjs_launch-editor',

        // Static assets by type
        '/_next/static/chunks/',
        '/_next/static/chunks/*',
        '/_next/static/css/',
        '/_next/static/css/*',
        '/_next/static/js/',
        '/_next/static/js/*',
        '/_next/static/media/',
        '/_next/static/media/*',
        '/_next/static/webpack/',
        '/_next/static/webpack/*',

        // Build artifacts
        '/*.map$',
        '/_next/static/*/*.map',
        '/_next/static/chunks/*.js.map',
        '/*.json$',
        '/build-manifest.json',
        '/react-loadable-manifest.json',
        '/_buildManifest.js',
        '/_ssgManifest.js',

        // Next.js special pages
        '/_error',
        '/_document',
        '/_app',
        '/404',
        '/403',
        '/500',

        // Static resources
        '/fonts',
        '/fonts/*',

        // CDN & Analytics
        '/cdn-cgi/',
        '/cdn-cgi/*',
        '/analytics',
        '/analytics/*',

        // Development & Debug
        '/debug-*',
        '/__*',

        // Rate limiting endpoints
        '/ratelimit/',

        // Vercel-specific
        '/.well-known/vercel/',
        '/.well-known/vercel/*',

        // Common query parameters to ignore
        '/*?*sort=*',
        '/*?*filter=*',
        '/*?*ref=*',
        '/*?*utm_*',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://HentaiTerra.ro'}/api/sitemap.xml`,
  }
}