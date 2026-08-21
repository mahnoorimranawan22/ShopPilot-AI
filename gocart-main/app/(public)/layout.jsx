'use client'
import Banner from "@/components/Banner";
import NavbarWrapper from "@/components/NavbarWrapper";
import Footer from "@/components/Footer";
import LiveChatWidget from "@/components/LiveChatWidget";
import AIFloatingButton from "@/components/AIFloatingButton";
import ComparisonButton from "@/components/ComparisonButton";
import BackToTop from "@/components/ui/BackToTop";

export default function PublicLayout({ children }) {

    return (
        <>
            <Banner />
            <NavbarWrapper />
            {children}
            <Footer />
            <LiveChatWidget />
            <AIFloatingButton />
            <ComparisonButton />
            <BackToTop />
        </>
    );
}
