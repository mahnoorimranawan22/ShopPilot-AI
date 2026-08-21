'use client'
import StoreLayout from "@/components/store/StoreLayout"
import ProtectedRoute from "@/components/ProtectedRoute"
import { motion } from 'framer-motion'

export default function RootStoreLayout({ children }) {
    return (
        <ProtectedRoute roles={['seller', 'admin']}>
            <StoreLayout>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </StoreLayout>
        </ProtectedRoute>
    )
}
