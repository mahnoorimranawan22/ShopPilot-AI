/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
            {
                protocol: 'https',
                hostname: '*.cloudinary.com',
            },
        ],
    },
    serverExternalPackages: ['@prisma/client'],

    // Production optimizations
    ...(process.env.NODE_ENV === 'production' && {
        compress: true,
        poweredByHeader: false,
        generateEtags: false,
        httpAgentOptions: {
            keepAlive: true,
        },
    }),

    // Headers for security and performance
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
            {
                source: '/api/(.*)',
                headers: [
                    { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
                    { key: 'Pragma', value: 'no-cache' },
                ],
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
        ]
    },

    // Redirects for legacy GoCart URLs → ShopPilot
    async redirects() {
        return [
            {
                source: '/gocart/:path*',
                destination: '/:path*',
                permanent: true,
            },
        ]
    },
}

export default nextConfig
