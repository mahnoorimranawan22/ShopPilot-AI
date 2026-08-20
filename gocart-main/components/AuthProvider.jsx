'use client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadUser } from '@/lib/features/user/userSlice'
import { fetchCart } from '@/lib/features/cart/cartSlice'
import { fetchWishlist } from '@/lib/features/wishlist/wishlistSlice'

export default function AuthProvider({ children }) {
    const dispatch = useDispatch()
    const { isLoggedIn } = useSelector(state => state.user)

    useEffect(() => {
        const token = localStorage.getItem('shoppilot_token')
        if (token) {
            dispatch(loadUser())
        }
    }, [dispatch])

    // When user becomes logged in, load their cart & wishlist
    useEffect(() => {
        if (isLoggedIn) {
            dispatch(fetchCart())
            dispatch(fetchWishlist())
        }
    }, [isLoggedIn, dispatch])

    return children
}
