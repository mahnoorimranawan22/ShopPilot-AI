/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: process.env.GITHUB_PAGES ? '/ShopPilot-AI' : '',
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
    trailingSlash: true,
};

export default nextConfig;
