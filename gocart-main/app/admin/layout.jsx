'use client'
import AdminLayout from "@/components/admin/AdminLayout"
import ProtectedRoute from "@/components/ProtectedRoute"
import { motion } from 'framer-motion'

export default function RootAdminLayout({ children }) {
    return (
        <ProtectedRoute roles={['admin']}>
            <AdminLayout>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </AdminLayout>
        </ProtectedRoute>
    )
}
