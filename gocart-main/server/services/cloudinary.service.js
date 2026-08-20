import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Local file path
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result with URL
 */
export const uploadImage = async (filePath, options = {}) => {
    const defaultOptions = {
        folder: 'shoppilot-ai',
        transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' },
            { fetch_format: 'auto' },
        ],
        ...options,
    }

    try {
        const result = await cloudinary.uploader.upload(filePath, defaultOptions)
        return {
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            thumbnail: getThumbnailUrl(result.public_id),
        }
    } catch (error) {
        console.error('Cloudinary upload error:', error.message)
        throw new Error(`Image upload failed: ${error.message}`)
    }
}

/**
 * Upload buffer/image from memory (for API uploads)
 * @param {Buffer} fileBuffer - Image buffer
 * @param {string} filename - Original filename
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
export const uploadBuffer = async (fileBuffer, filename, options = {}) => {
    return new Promise((resolve, reject) => {
        const defaultOptions = {
            folder: 'shoppilot-ai',
            public_id: `${Date.now()}-${filename.split('.')[0]}`,
            transformation: [
                { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' },
                { fetch_format: 'auto' },
            ],
            ...options,
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            defaultOptions,
            (error, result) => {
                if (error) {
                    console.error('Cloudinary buffer upload error:', error.message)
                    reject(new Error(`Image upload failed: ${error.message}`))
                } else {
                    resolve({
                        publicId: result.public_id,
                        url: result.secure_url,
                        width: result.width,
                        height: result.height,
                        format: result.format,
                        bytes: result.bytes,
                        thumbnail: getThumbnailUrl(result.public_id),
                    })
                }
            }
        )

        uploadStream.end(fileBuffer)
    })
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>}
 */
export const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId)
        return true
    } catch (error) {
        console.error('Cloudinary delete error:', error.message)
        return false
    }
}

/**
 * Delete multiple images
 * @param {string[]} publicIds - Array of public IDs
 * @returns {Promise<object>}
 */
export const deleteMultipleImages = async (publicIds) => {
    try {
        const result = await cloudinary.api.delete_resources(publicIds)
        return result
    } catch (error) {
        console.error('Cloudinary batch delete error:', error.message)
        throw error
    }
}

/**
 * Get optimized thumbnail URL
 * @param {string} publicId - Cloudinary public ID
 * @param {number} width - Thumbnail width (default: 300)
 * @returns {string} Transformed URL
 */
export const getThumbnailUrl = (publicId, width = 300) => {
    return cloudinary.url(publicId, {
        transformation: [
            { width, height: width, crop: 'fill', quality: 'auto:good' },
            { fetch_format: 'auto' },
        ],
        secure: true,
    })
}

/**
 * Get optimized product image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {string} size - 'small' | 'medium' | 'large'
 * @returns {string} Transformed URL
 */
export const getProductImageUrl = (publicId, size = 'medium') => {
    const sizes = {
        small: { width: 400, height: 400 },
        medium: { width: 800, height: 800 },
        large: { width: 1200, height: 1200 },
    }

    const { width, height } = sizes[size] || sizes.medium

    return cloudinary.url(publicId, {
        transformation: [
            { width, height, crop: 'limit', quality: 'auto:good' },
            { fetch_format: 'auto' },
        ],
        secure: true,
    })
}

/**
 * Check if Cloudinary is configured
 * @returns {boolean}
 */
export const isConfigured = () => {
    return !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    )
}

export default {
    uploadImage,
    uploadBuffer,
    deleteImage,
    deleteMultipleImages,
    getThumbnailUrl,
    getProductImageUrl,
    isConfigured,
}
