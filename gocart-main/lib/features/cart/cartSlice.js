import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunk: fetch cart from API
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('shoppilot_token')
            if (!token) return null
            const res = await fetch('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) return null
            return await res.json()
        } catch {
            return null
        }
    }
)

// Async thunk: add item to API cart
export const apiAddToCart = createAsyncThunk(
    'cart/apiAddToCart',
    async ({ productId, quantity = 1 }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('shoppilot_token')
            if (!token) return null
            const res = await fetch('http://localhost:5000/api/cart/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productId, quantity }),
            })
            if (!res.ok) return null
            return await res.json()
        } catch {
            return null
        }
    }
)

// Async thunk: update item quantity in API cart
export const apiUpdateCartItem = createAsyncThunk(
    'cart/apiUpdateCartItem',
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('shoppilot_token')
            if (!token) return null
            const res = await fetch(`http://localhost:5000/api/cart/items/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ quantity }),
            })
            if (!res.ok) return null
            return await res.json()
        } catch {
            return null
        }
    }
)

// Async thunk: remove item from API cart
export const apiRemoveFromCart = createAsyncThunk(
    'cart/apiRemoveFromCart',
    async (productId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('shoppilot_token')
            if (!token) return null
            const res = await fetch(`http://localhost:5000/api/cart/items/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) return null
            return await res.json()
        } catch {
            return null
        }
    }
)

// Async thunk: clear API cart
export const apiClearCart = createAsyncThunk(
    'cart/apiClearCart',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('shoppilot_token')
            if (!token) return null
            const res = await fetch('http://localhost:5000/api/cart', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) return null
            return true
        } catch {
            return null
        }
    }
)

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},        // { productId: quantity } — local fallback
        apiCart: null,         // full API cart object with populated products
        apiCartItems: {},      // normalized: { productId: quantity } from API
        useAPI: false,         // whether API cart is available
        loading: false,
    },
    reducers: {
        // Local-only actions (used when not logged in)
        addToCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]++
            } else {
                state.cartItems[productId] = 1
            }
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId]
                }
            }
            state.total = Math.max(0, state.total - 1)
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] || 0
            delete state.cartItems[productId]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
            state.apiCart = null
            state.apiCartItems = {}
            state.useAPI = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.fulfilled, (state, action) => {
                if (action.payload && action.payload.items) {
                    state.apiCart = action.payload
                    state.apiCartItems = {}
                    let total = 0
                    for (const item of action.payload.items) {
                        const id = item.product?._id || item.product
                        state.apiCartItems[id] = item.quantity
                        total += item.quantity
                    }
                    state.total = total
                    state.useAPI = true
                }
            })
            .addCase(apiAddToCart.fulfilled, (state, action) => {
                if (action.payload && action.payload.items) {
                    state.apiCart = action.payload
                    state.apiCartItems = {}
                    let total = 0
                    for (const item of action.payload.items) {
                        const id = item.product?._id || item.product
                        state.apiCartItems[id] = item.quantity
                        total += item.quantity
                    }
                    state.total = total
                    state.useAPI = true
                }
            })
            .addCase(apiUpdateCartItem.fulfilled, (state, action) => {
                if (action.payload && action.payload.items) {
                    state.apiCart = action.payload
                    state.apiCartItems = {}
                    let total = 0
                    for (const item of action.payload.items) {
                        const id = item.product?._id || item.product
                        state.apiCartItems[id] = item.quantity
                        total += item.quantity
                    }
                    state.total = total
                }
            })
            .addCase(apiRemoveFromCart.fulfilled, (state, action) => {
                if (action.payload && action.payload.items) {
                    state.apiCart = action.payload
                    state.apiCartItems = {}
                    let total = 0
                    for (const item of action.payload.items) {
                        const id = item.product?._id || item.product
                        state.apiCartItems[id] = item.quantity
                        total += item.quantity
                    }
                    state.total = total
                }
            })
            .addCase(apiClearCart.fulfilled, (state) => {
                state.apiCart = null
                state.apiCartItems = {}
                state.total = 0
            })
    },
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions

export default cartSlice.reducer
