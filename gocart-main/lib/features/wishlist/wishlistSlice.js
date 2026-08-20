import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunk: fetch wishlist from API
export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('shoppilot_token')
            if (!token) return null
            const res = await fetch('http://localhost:5000/api/users/wishlist', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) return null
            return await res.json()
        } catch {
            return null
        }
    }
)

// Async thunk: toggle wishlist item via API
export const apiToggleWishlist = createAsyncThunk(
    'wishlist/apiToggle',
    async (productId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('shoppilot_token')
            if (!token) return null
            const res = await fetch(`http://localhost:5000/api/users/wishlist/${productId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) return null
            return await res.json()
        } catch {
            return null
        }
    }
)

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [],         // array of product IDs (local fallback)
        products: [],      // populated products from API
        useAPI: false,
    },
    reducers: {
        // Local-only actions
        toggleWishlist: (state, action) => {
            const { productId } = action.payload
            const index = state.items.indexOf(productId)
            if (index > -1) {
                state.items.splice(index, 1)
            } else {
                state.items.push(productId)
            }
        },
        addToWishlist: (state, action) => {
            const { productId } = action.payload
            if (!state.items.includes(productId)) {
                state.items.push(productId)
            }
        },
        removeFromWishlist: (state, action) => {
            const { productId } = action.payload
            state.items = state.items.filter(id => id !== productId)
            state.products = state.products.filter(p => (p._id || p.id) !== productId)
        },
        clearWishlist: (state) => {
            state.items = []
            state.products = []
            state.useAPI = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                if (action.payload && action.payload.products) {
                    state.products = action.payload.products
                    state.items = action.payload.products.map(p => p._id || p.id)
                    state.useAPI = true
                }
            })
            .addCase(apiToggleWishlist.fulfilled, (state, action) => {
                if (action.payload && action.payload.wishlist) {
                    state.products = action.payload.wishlist.products || []
                    state.items = state.products.map(p => p._id || p.id)
                    state.useAPI = true
                }
            })
    },
})

export const { toggleWishlist, addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions

export default wishlistSlice.reducer
