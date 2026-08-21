/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            }
        ]
    },
    serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
