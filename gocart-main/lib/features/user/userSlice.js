import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI, tokenManager, usersAPI } from '@/lib/api'

// Async thunk: register
export const registerUser = createAsyncThunk(
    'user/register',
    async (data, { rejectWithValue }) => {
        try {
            const result = await authAPI.register(data)
            tokenManager.set(result.token)
            return result.user
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk: login
export const loginUser = createAsyncThunk(
    'user/login',
    async (data, { rejectWithValue }) => {
        try {
            const result = await authAPI.login(data)
            tokenManager.set(result.token)
            return result.user
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk: load user from token on app init
export const loadUser = createAsyncThunk(
    'user/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const token = tokenManager.get()
            if (!token) return null
            const user = await authAPI.getMe()
            return user
        } catch (error) {
            tokenManager.remove()
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk: update profile
export const updateUserProfile = createAsyncThunk(
    'user/updateProfile',
    async (data, { rejectWithValue }) => {
        try {
            const user = await authAPI.updateProfile(data)
            return user
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

const userSlice = createSlice({
    name: 'user',
    initialState: {
        isLoggedIn: false,
        userData: null,
        token: null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.isLoggedIn = false
            state.userData = null
            state.token = null
            state.error = null
            tokenManager.remove()
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false
                state.isLoggedIn = true
                state.userData = action.payload
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false
                state.isLoggedIn = true
                state.userData = action.payload
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Load user
            .addCase(loadUser.pending, (state) => {
                state.loading = true
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.loading = false
                if (action.payload) {
                    state.isLoggedIn = true
                    state.userData = action.payload
                } else {
                    state.isLoggedIn = false
                    state.userData = null
                }
            })
            .addCase(loadUser.rejected, (state) => {
                state.loading = false
                state.isLoggedIn = false
                state.userData = null
            })
            // Update profile
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.userData = action.payload
            })
    },
})

export const { logout, clearError } = userSlice.actions

export default userSlice.reducer
