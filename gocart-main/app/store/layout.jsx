'use client'
import StoreLayout from "@/components/store/StoreLayout"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function RootStoreLayout({ children }) {
    return (
        <ProtectedRoute roles={['seller', 'admin']}>
            <StoreLayout>
                {children}
            </StoreLayout>
        </ProtectedRoute>
    )
}
