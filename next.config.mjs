import dotenv from "dotenv"

dotenv.config({ path: ".env.migrate.local", override: true })
dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF first: ~30-50% smaller than WebP at equal quality, huge win on
    // 3G/4G bundles. Next.js negotiates via Accept header, falling back to
    // webp then the original format automatically.
    formats: ['image/avif', 'image/webp'],
    // Keep the device/image width buckets modest — this app's largest
    // rendered image is a course thumbnail card, never a full-bleed hero.
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
          { key: 'Content-Security-Policy', value: `default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; form-action 'self' https://www.paynow.co.zw; img-src 'self' data: blob: https:; media-src 'self' https:; connect-src 'self' https://*.paynow.co.zw https://*.neon.tech; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline'; font-src 'self' data:; upgrade-insecure-requests` },
          ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
        ],
      },
      {
        // Not content-hashed, so avoid `immutable` — a day of hard caching
        // plus a week of background revalidation still saves repeat
        // requests without risking a stale logo if the asset changes.
        source: '/:path*.(svg|jpg|jpeg|png|webp|avif|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ]
  },
}

export default nextConfig
