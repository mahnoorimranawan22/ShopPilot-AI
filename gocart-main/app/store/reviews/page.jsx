'use client'
import { useState, useEffect } from "react"
import Loading from "@/components/Loading"
import SectionCard from "@/components/dashboard/SectionCard"
import ReviewAnalysis from "@/components/ReviewAnalysis"
import { StarIcon, MessageSquareIcon, ThumbsUpIcon } from "lucide-react"

const demoReviews = [
    { id: 1, user: 'Jane Customer', avatar: null, product: 'AirPods Pro', rating: 5, text: 'Absolutely love this product! The noise cancellation is incredible and the battery lasts forever.', date: '2h ago', helpful: 12, replied: false },
    { id: 2, user: 'Alex Morgan', avatar: null, product: 'Sony WH-1000XM5', rating: 4, text: 'Great headphones, comfortable for long sessions. Only minor complaint is the carrying case could be better.', date: '5h ago', helpful: 8, replied: true },
    { id: 3, user: 'Bessie Cooper', avatar: null, product: 'Casio G-Shock', rating: 5, text: 'Exactly what I expected. Premium build quality and the watch looks amazing on my wrist.', date: '1d ago', helpful: 15, replied: false },
    { id: 4, user: 'Kristin Watson', avatar: null, product: 'Logitech MX Master 3S', rating: 4, text: 'Best mouse I have ever used. The scroll wheel is addictive and the ergonomics are perfect.', date: '1d ago', helpful: 6, replied: false },
    { id: 5, user: 'Jenny Wilson', avatar: null, product: 'Dyson V15', rating: 3, text: 'Good vacuum but quite heavy. The laser feature is cool though. Expected more for the price.', date: '2d ago', helpful: 4, replied: true },
    { id: 6, user: 'Mike Ross', avatar: null, product: 'Canon EOS R50', rating: 5, text: 'Perfect starter mirrorless! The autofocus is blazing fast and the video quality is stunning.', date: '3d ago', helpful: 11, replied: false },
]

export default function StoreReviews() {
    const [loading, setLoading] = useState(true)
    const [reviews, setReviews] = useState([])
    const [filter, setFilter] = useState('all') // all, 5, 4, 3, 2, 1

    useEffect(() => {
        setTimeout(() => { setReviews(demoReviews); setLoading(false) }, 500)
    }, [])

    if (loading) return <Loading />

    const filtered = filter === 'all' ? reviews : reviews.filter(r => r.rating === Number(filter))
    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0
    const ratingDist = [5, 4, 3, 2, 1].map(r => ({ rating: r, count: reviews.filter(rev => rev.rating === r).length }))

    return (
        <div className="text-slate-500 mb-28 max-w-5xl">
            <h1 className="text-2xl mb-6">Store <span className="text-slate-800 font-medium">Reviews</span></h1>

            {/* AI Review Analysis */}
            <div className="mb-8">
                <ReviewAnalysis reviews={reviews} />
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <SectionCard className="text-center">
                    <p className="text-4xl font-bold text-slate-800">{avgRating}</p>
                    <div className="flex justify-center mt-2">
                        {Array(5).fill('').map((_, i) => <StarIcon key={i} size={18} fill={i < Math.round(avgRating) ? "#6366f1" : "#D1D5DB"} className="text-transparent" />)}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{reviews.length} reviews</p>
                </SectionCard>
                <SectionCard className="col-span-2">
                    <div className="space-y-2">
                        {ratingDist.map(d => {
                            const pct = reviews.length ? (d.count / reviews.length) * 100 : 0
                            return (
                                <div key={d.rating} className="flex items-center gap-3 text-xs">
                                    <span className="w-3 text-slate-500">{d.rating}</span>
                                    <StarIcon size={12} fill="#6366f1" className="text-transparent" />
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="w-6 text-right text-slate-400">{d.count}</span>
                                </div>
                            )
                        })}
                    </div>
                </SectionCard>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4">
                {['all', 5, 4, 3, 2, 1].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {f === 'all' ? 'All' : `${f} ★`}
                    </button>
                ))}
            </div>

            {/* Reviews */}
            <div className="space-y-3">
                {filtered.map(review => (
                    <div key={review.id} className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {review.user[0]}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium text-slate-700">{review.user}</p>
                                    <div className="flex">{Array(5).fill('').map((_, j) => <StarIcon key={j} size={12} fill={j < review.rating ? "#6366f1" : "#D1D5DB"} className="text-transparent" />)}</div>
                                    <span className="text-xs text-slate-400">{review.date}</span>
                                </div>
                                <p className="text-xs text-indigo-600 mt-0.5">{review.product}</p>
                                <p className="text-sm text-slate-600 mt-2">{review.text}</p>
                                <div className="flex items-center gap-4 mt-3">
                                    <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition">
                                        <ThumbsUpIcon size={12} /> {review.helpful} helpful
                                    </button>
                                    {!review.replied ? (
                                        <button className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition">
                                            <MessageSquareIcon size={12} /> Reply
                                        </button>
                                    ) : (
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                            <MessageSquareIcon size={12} /> Replied
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
