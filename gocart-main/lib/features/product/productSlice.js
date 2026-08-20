import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunk: fetch products from API
export const fetchProducts = createAsyncThunk(
    'product/fetchProducts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const searchParams = new URLSearchParams()
            if (params.search) searchParams.set('search', params.search)
            if (params.category) searchParams.set('category', params.category)
            if (params.brand) searchParams.set('brand', params.brand)
            if (params.sort) searchParams.set('sort', params.sort)
            if (params.order) searchParams.set('order', params.order)
            if (params.page) searchParams.set('page', params.page)
            if (params.limit) searchParams.set('limit', params.limit)

            const url = `/api/products${searchParams.toString() ? '?' + searchParams.toString() : ''}`
            const res = await fetch(url)

            if (!res.ok) {
                throw new Error(`Failed to fetch products: ${res.status}`)
            }

            const data = await res.json()
            return data.products || data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk: fetch a single product by ID
export const fetchProductById = createAsyncThunk(
    'product/fetchProductById',
    async (productId, { rejectWithValue }) => {
        try {
            const res = await fetch(`/api/products/${productId}`)

            if (!res.ok) {
                if (res.status === 404) return null
                throw new Error(`Failed to fetch product: ${res.status}`)
            }

            return await res.json()
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
        currentProduct: null,
        loading: false,
        error: null,
        pagination: {
            total: 0,
            page: 1,
            limit: 50,
            totalPages: 1,
        },
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
        },
        clearProduct: (state) => {
            state.list = []
            state.currentProduct = null
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchProducts
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false
                state.list = action.payload
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Failed to fetch products'
            })
            // fetchProductById
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false
                state.currentProduct = action.payload
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Failed to fetch product'
            })
    },
})

export const { setProduct, clearProduct, clearError } = productSlice.actions

export default productSlice.reducer
