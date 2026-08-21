const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// ─── Token Management ─────────────────────────────────────────
export const tokenManager = {
    get: () => {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('shoppilot_token')
    },
    set: (token) => {
        if (typeof window === 'undefined') return
        localStorage.setItem('shoppilot_token', token)
    },
    remove: () => {
        if (typeof window === 'undefined') return
        localStorage.removeItem('shoppilot_token')
    },
}

// ─── Fetch Wrapper ────────────────────────────────────────────
async function request(endpoint, options = {}) {
    const token = tokenManager.get()
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    }

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
        delete headers['Content-Type']
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    })

    const data = await res.json()

    if (!res.ok) {
        const error = new Error(data.error || `Request failed (${res.status})`)
        error.status = res.status
        error.data = data
        throw error
    }

    return data
}

// ─── Auth API ─────────────────────────────────────────────────
export const authAPI = {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => request('/auth/me'),
    updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
    changePassword: (data) => request('/auth/password', { method: 'PUT', body: JSON.stringify(data) }),
}

// ─── Products API ─────────────────────────────────────────────
export const productsAPI = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString()
        return request(`/products${qs ? '?' + qs : ''}`)
    },
    get: (id) => request(`/products/${id}`),
    create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
    categories: () => request('/products/categories'),
    brands: () => request('/products/brands'),
}

// ─── Cart API ─────────────────────────────────────────────────
export const cartAPI = {
    get: () => request('/cart'),
    addItem: (productId, quantity = 1) =>
        request('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
    updateItem: (productId, quantity) =>
        request(`/cart/items/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    removeItem: (productId) =>
        request(`/cart/items/${productId}`, { method: 'DELETE' }),
    clear: () => request('/cart', { method: 'DELETE' }),
}

// ─── Orders API ───────────────────────────────────────────────
export const ordersAPI = {
    place: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request('/orders'),
    get: (id) => request(`/orders/${id}`),
    cancel: (id) => request(`/orders/${id}/cancel`, { method: 'PUT' }),
}

// ─── Users API ────────────────────────────────────────────────
export const usersAPI = {
    getProfile: (id) => request(`/users/${id}`),
    getWishlist: () => request('/users/wishlist'),
    toggleWishlist: (productId) =>
        request(`/users/wishlist/${productId}`, { method: 'POST' }),
}

// ─── Reviews API ──────────────────────────────────────────────
export const reviewsAPI = {
    getProductReviews: (productId, params = {}) => {
        const qs = new URLSearchParams(params).toString()
        return request(`/reviews/product/${productId}${qs ? '?' + qs : ''}`)
    },
    add: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
}

// ─── Admin API ────────────────────────────────────────────────
export const adminAPI = {
    dashboard: () => request('/admin/dashboard'),
    getUsers: () => request('/admin/users'),
    updateUserRole: (id, role) =>
        request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    toggleUserStatus: (id) =>
        request(`/admin/users/${id}/status`, { method: 'PUT' }),
    getStores: (params = {}) => {
        const qs = new URLSearchParams(params).toString()
        return request(`/admin/stores${qs ? '?' + qs : ''}`)
    },
    approveStore: (id) =>
        request(`/admin/stores/${id}/approve`, { method: 'PUT' }),
    rejectStore: (id) =>
        request(`/admin/stores/${id}/reject`, { method: 'PUT' }),
    getOrders: (params = {}) => {
        const qs = new URLSearchParams(params).toString()
        return request(`/admin/orders${qs ? '?' + qs : ''}`)
    },
    updateOrderStatus: (id, status) =>
        request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    getCoupons: () => request('/admin/coupons'),
    createCoupon: (data) =>
        request('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
    deleteCoupon: (code) =>
        request(`/admin/coupons/${code}`, { method: 'DELETE' }),
}

// ─── AI API ───────────────────────────────────────────────────
export const aiAPI = {
    // AI Shopping Assistant
    ask: (query, limit = 3) =>
        request('/ai/ask', { method: 'POST', body: JSON.stringify({ query, limit }) }),
    suggestions: () => request('/ai/suggestions'),
    followUp: (lastQuery, lastResults) =>
        request('/ai/follow-up', { method: 'POST', body: JSON.stringify({ lastQuery, lastResults }) }),
    // AI Review Analysis
    reviewAnalysis: (productId) =>
        request('/ai/review-analysis', { method: 'POST', body: JSON.stringify({ productId }) }),
    // AI Inventory Intelligence
    inventoryIntelligence: () => request('/ai/inventory-intelligence'),
    // AI Business Intelligence
    businessInsight: (query) =>
        request('/ai/business-insight', { method: 'POST', body: JSON.stringify({ query }) }),
    // Visual Search
    visualSearch: (imageData, limit = 6) =>
        request('/ai/visual-search', { method: 'POST', body: JSON.stringify({ imageData, limit }) }),
    visualSearchFallback: (fileName, limit = 6) =>
        request('/ai/visual-search', { method: 'POST', body: JSON.stringify({ imageData: null, fileName, limit }) }),
    // AI Product Generator
    generateProduct: (name, features = []) =>
        request('/ai/generate-product', { method: 'POST', body: JSON.stringify({ name, features }) }),
    // Personalized recommendations
    recommended: (limit = 8) => request(`/ai/recommended?limit=${limit}`),
    trackBehavior: (eventType, data) =>
        request('/ai/track', { method: 'POST', body: JSON.stringify({ eventType, data }) }),
    // Existing
    recommendations: (productId) => request(`/ai/recommendations/${productId}`),
    trending: (limit = 10) => request(`/ai/trending?limit=${limit}`),
    searchSuggestions: (q) => request(`/ai/search-suggestions?q=${encodeURIComponent(q)}`),
    priceCompare: (productId) => request(`/ai/price-compare/${productId}`),
    categoryInsights: () => request('/ai/category-insights'),
}

// ─── Upload API ───────────────────────────────────────────────
export const uploadAPI = {
    single: async (file) => {
        const formData = new FormData()
        formData.append('image', file)
        const token = tokenManager.get()
        const res = await fetch(`${API_BASE}/upload/single`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })
        if (!res.ok) throw new Error('Upload failed')
        return res.json()
    },
    multiple: async (files) => {
        const formData = new FormData()
        files.forEach(f => formData.append('images', f))
        const token = tokenManager.get()
        const res = await fetch(`${API_BASE}/upload/multiple`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })
        if (!res.ok) throw new Error('Upload failed')
        return res.json()
    },
}
