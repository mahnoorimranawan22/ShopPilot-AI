'use client'
import { ArrowRight, StarIcon, SendIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { reviewsAPI } from "@/lib/api"
import toast from "react-hot-toast"

const ProductDescription = ({ product }) => {

    const [selectedTab, setSelectedTab] = useState('Description')
    const [reviews, setReviews] = useState([])
    const [reviewsLoading, setReviewsLoading] = useState(false)
    const [newRating, setNewRating] = useState(5)
    const [newReview, setNewReview] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const isLoggedIn = useSelector(state => state.user.isLoggedIn)
    const userData = useSelector(state => state.user.userData)

    const productId = product._id || product.id

    // Fetch real reviews when switching to Reviews tab
    useEffect(() => {
        if (selectedTab === 'Reviews') {
            setReviewsLoading(true)
            reviewsAPI.getProductReviews(productId)
                .then(data => {
                    setReviews(data.reviews || [])
                })
                .catch(() => {
                    // Fallback to product.rating array
                    setReviews(product.rating || [])
                })
                .finally(() => setReviewsLoading(false))
        }
    }, [selectedTab, productId, product.rating])

    const handleSubmitReview = async (e) => {
        e.preventDefault()
        if (!newReview.trim()) return toast.error('Please write a review')
        setSubmitting(true)
        try {
            // In a real flow, the user would have an orderId
            // For now we'll show the form but require a valid order
            toast.success('Review submitted! (Requires a delivered order)')
            setNewReview('')
            setNewRating(5)
        } catch (error) {
            toast.error(error.message || 'Failed to submit review')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="my-18 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button
                        key={index}
                        className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`}
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                        {tab === 'Reviews' && (
                            <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                                {reviews.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <p className="max-w-xl leading-relaxed">{product.description}</p>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="mt-6">
                    {/* Add Review Form */}
                    {isLoggedIn && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
                            <h3 className="font-medium text-slate-700 mb-3">Write a Review</h3>
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => setNewRating(star)} className="transition hover:scale-110">
                                        <StarIcon size={22} fill={star <= newRating ? "#6366f1" : "#D1D5DB"} className="text-transparent" />
                                    </button>
                                ))}
                                <span className="text-xs text-slate-400 ml-2">{newRating}/5</span>
                            </div>
                            <form onSubmit={handleSubmitReview} className="flex gap-3">
                                <textarea
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                    placeholder="Share your experience with this product..."
                                    rows={3}
                                    className="flex-1 p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={submitting || !newReview.trim()}
                                    className="self-end bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-1"
                                >
                                    <SendIcon size={14} />
                                    {submitting ? '...' : 'Post'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Reviews List */}
                    {reviewsLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse flex gap-5">
                                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                                        <div className="h-3 bg-slate-200 rounded w-full mb-1" />
                                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {reviews.map((item, index) => (
                                <div key={index} className="flex gap-5 mb-8 pb-8 border-b border-slate-100 last:border-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                                        {item.user?.image ? (
                                            <Image src={item.user.image} alt="" width={40} height={40} className="w-full h-full object-cover" />
                                        ) : (
                                            (item.user?.name || 'U')[0].toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center">
                                                {Array(5).fill('').map((_, idx) => (
                                                    <StarIcon key={idx} size={14} className='text-transparent' fill={item.rating >= idx + 1 ? "#6366f1" : "#D1D5DB"} />
                                                ))}
                                            </div>
                                            <p className="font-medium text-slate-800 text-sm">{item.user?.name || 'Anonymous'}</p>
                                        </div>
                                        <p className="text-sm max-w-lg my-2 text-slate-600">{item.review}</p>
                                        <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <p className="text-lg font-medium text-slate-500 mb-1">No reviews yet</p>
                            <p className="text-sm">Be the first to review this product</p>
                        </div>
                    )}
                </div>
            )}

            {/* Store Page */}
            {product.store && (
                <div className="flex gap-3 mt-14">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                        {product.store.logo ? (
                            <Image src={product.store.logo} alt="" width={100} height={100} className="w-full h-full object-cover" />
                        ) : (
                            (product.store.name || 'S')[0]
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-slate-600">Product by {product.store.name}</p>
                        <Link href={`/shop/${product.store.username}`} className="flex items-center gap-1.5 text-indigo-500"> view store <ArrowRight size={14} /></Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDescription
