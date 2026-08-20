import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Production optimizations
            maxPoolSize: 10,           // Max 10 connections in pool
            minPoolSize: 2,            // Keep 2 warm connections
            serverSelectionTimeoutMS: 5000,  // Fail fast if DB unreachable
            socketTimeoutMS: 45000,    // Close idle sockets after 45s
            heartbeatFrequencyMS: 10000,  // Check DB health every 10s
            ...(process.env.NODE_ENV === 'production' && {
                retryWrites: true,
                w: 'majority',         // Write concern: majority of replicas
                readPreference: 'secondaryPreferred',  // Read from secondary if available
            }),
        })

        console.log(`✅ MongoDB connected: ${conn.connection.host}`)
        console.log(`   Database: ${conn.connection.name}`)
        console.log(`   Ready state: ${conn.connection.readyState === 1 ? 'connected' : 'connecting'}`)

        // Connection event handlers
        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB connection error: ${err.message}`)
        })

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...')
        })

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected')
        })

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close()
            console.log('🔒 MongoDB connection closed (app termination)')
            process.exit(0)
        })

    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`)
        process.exit(1)
    }
}
