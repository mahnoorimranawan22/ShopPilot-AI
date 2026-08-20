'use client'
import AdminLayout from "@/components/admin/AdminLayout"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function RootAdminLayout({ children }) {
    return (
        <ProtectedRoute roles={['admin']}>
            <AdminLayout>
                {children}
            </AdminLayout>
        </ProtectedRoute>
    )
}
