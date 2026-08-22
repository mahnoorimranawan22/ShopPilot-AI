import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
    title: "ShopPilot AI - Smart Shopping, Powered by Intelligence",
    description: "AI-powered commerce platform for smarter shopping and business growth. Discover products personalized to you with intelligent recommendations.",
    keywords: ["AI shopping", "e-commerce", "product recommendations", "smart shopping", "ShopPilot"],
    authors: [{ name: "ShopPilot AI" }],
    openGraph: {
        title: "ShopPilot AI - Smart Shopping, Powered by Intelligence",
        description: "AI-powered commerce platform for smarter shopping and business growth.",
        url: "https://mahnoorimranawan22.github.io/ShopPilot-AI",
        siteName: "ShopPilot AI",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ShopPilot AI" }],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "ShopPilot AI",
        description: "AI-powered commerce platform for smarter shopping.",
    },
    icons: {
        icon: "/favicon.svg",
        apple: "/apple-touch-icon.svg",
        shortcut: "/favicon.svg",
    },
    manifest: "/manifest.json",
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export const themeColor = "#f97316";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <StoreProvider>
                    <Toaster />
                    {children}
                </StoreProvider>
            </body>
        </html>
    );
}
