'use client'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter, usePathname } from 'next/navigation'
import { loadUser } from '@/lib/features/user/userSlice'
import Loading from './Loading'

/**
 * ProtectedRoute — wraps pages that require authentication.
 *
 * Props:
 *   roles: string[] — allowed roles, e.g. ['admin'] or ['seller', 'admin']
 *   fallback: string — redirect path when not authorized (default: '/login')
 */
export default function ProtectedRoute({ children, roles, fallback = '/login' }) {
    const dispatch = useDispatch()
    const router = useRouter()
    const pathname = usePathname()
    const { isLoggedIn, userData, loading } = useSelector(state => state.user)

    useEffect(() => {
        // On first load, try to restore session from token
        const token = typeof window !== 'undefined' && localStorage.getItem('shoppilot_token')
        if (token && !isLoggedIn && !userData) {
            dispatch(loadUser())
        }
    }, [dispatch, isLoggedIn, userData])

    useEffect(() => {
        if (loading) return

        // Not logged in → redirect to login with return URL
        if (!isLoggedIn || !userData) {
            router.push(`${fallback}?redirect=${encodeURIComponent(pathname)}`)
            return
        }

        // Logged in but wrong role → redirect to home
        if (roles && !roles.includes(userData.role)) {
            router.push('/')
            return
        }
    }, [isLoggedIn, userData, loading, roles, router, pathname, fallback])

    if (loading) return <Loading />
    if (!isLoggedIn || !userData) return null
    if (roles && !roles.includes(userData.role)) return null

    return children
}
