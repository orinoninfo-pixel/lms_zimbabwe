/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
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
