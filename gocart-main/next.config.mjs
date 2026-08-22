/** @type {import('next').NextConfig} */
const isExport = process.env.GITHUB_PAGES === 'true'

const nextConfig = {
    output: isExport ? 'export' : undefined,
    basePath: isExport ? '/ShopPilot-AI' : '',
    images: {
        unoptimized: isExport,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'plus.unsplash.com',
            },
        ],
    },
    serverExternalPackages: ['@prisma/client'],
    trailingSlash: true,
};

export default nextConfig;
