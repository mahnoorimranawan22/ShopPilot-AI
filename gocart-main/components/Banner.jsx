'use client'
import React from 'react'
import toast from 'react-hot-toast';
import { SparklesIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Banner() {

    const [isOpen, setIsOpen] = React.useState(true);

    const handleClaim = () => {
        setIsOpen(false);
        toast.success('Coupon copied to clipboard!');
        navigator.clipboard.writeText('NEW20');
    };

    return (
        <AnimatePresence>
        {isOpen && (
        <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full px-6 py-2 font-medium text-sm text-white text-center bg-gradient-to-r from-orange-500 via-rose-500 to-cyan-500">
            <div className='flex items-center justify-between max-w-7xl mx-auto'>
                <div className='flex items-center gap-2'>
                    <SparklesIcon size={14} />
                    <p>Get 20% OFF on Your First Order with code <span className='font-bold'>NEW20</span></p>
                </div>
                <div className="flex items-center space-x-6">
                    <button onClick={handleClaim} type="button" className="font-normal text-orange-600 bg-white px-7 py-2 rounded-full max-sm:hidden hover:bg-orange-50 transition">Claim Offer</button>
                    <button onClick={() => setIsOpen(false)} type="button" className="font-normal text-white/80 hover:text-white py-2 rounded-full transition">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect y="12.532" width="17.498" height="2.1" rx="1.05" transform="rotate(-45.74 0 12.532)" fill="currentColor" />
                            <rect x="12.533" y="13.915" width="17.498" height="2.1" rx="1.05" transform="rotate(-135.74 12.533 13.915)" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.div>
        )}
        </AnimatePresence>
    );
};
