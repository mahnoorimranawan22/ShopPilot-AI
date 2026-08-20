'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <div className='relative flex-1 flex flex-col bg-gradient-to-br from-indigo-50 via-white to-violet-50 border border-indigo-100 rounded-3xl xl:min-h-100 group overflow-hidden'>
                    {/* Subtle grid pattern */}
                    <div className='absolute inset-0 opacity-[0.03]' style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                    <div className='relative p-5 sm:p-16 z-10'>
                        {/* Badge */}
                        <div className='inline-flex items-center gap-2 bg-indigo-100/80 backdrop-blur text-indigo-700 px-4 py-2 rounded-full text-xs sm:text-sm font-medium'>
                            <SparklesIcon size={14} className='text-indigo-500' />
                            AI-Powered Shopping Experience
                        </div>

                        {/* Headline */}
                        <h1 className='text-4xl sm:text-6xl leading-[1.1] my-5 sm:my-6 font-bold'>
                            <span className='text-slate-800'>Shop smarter with</span>
                            <br />
                            <span className='bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600 bg-clip-text text-transparent'>AI.</span>
                        </h1>

                        {/* Description */}
                        <p className='text-slate-500 text-base sm:text-lg leading-relaxed max-w-md mb-8 sm:mb-10'>
                            Discover products personalized to you and make better purchasing decisions with intelligent recommendations.
                        </p>

                        {/* CTA Buttons */}
                        <div className='flex flex-wrap items-center gap-4'>
                            <Link href='/shop' className='inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium py-3.5 px-8 rounded-full hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 transition-all'>
                                Explore Products
                                <ArrowRightIcon size={16} />
                            </Link>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { query: '' } }))}
                                className='inline-flex items-center gap-2 bg-white text-slate-700 text-sm font-medium py-3.5 px-8 rounded-full border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md active:scale-95 transition-all'
                            >
                                ✨ Ask ShopPilot AI
                            </button>
                        </div>
                    </div>

                    {/* Hero Model Image */}
                    <img className='sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm opacity-90' src={assets.hero_model_img} alt="" />
                </div>

                {/* Side Cards */}
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    <Link href='/shop' className='flex-1 flex items-center justify-between w-full bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-200/50 rounded-3xl p-6 px-8 group hover:shadow-lg hover:shadow-violet-500/10 transition-all'>
                        <div>
                            <p className='text-3xl font-bold bg-gradient-to-r from-slate-800 to-violet-500 bg-clip-text text-transparent max-w-40'>Best products</p>
                            <p className='flex items-center gap-1 mt-4 text-violet-600 font-medium'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        <img className='w-35' src={assets.hero_product_img1} alt="" />
                    </Link>
                    <Link href='/shop' className='flex-1 flex items-center justify-between w-full bg-gradient-to-br from-cyan-100 to-cyan-50 border border-cyan-200/50 rounded-3xl p-6 px-8 group hover:shadow-lg hover:shadow-cyan-500/10 transition-all'>
                        <div>
                            <p className='text-3xl font-bold bg-gradient-to-r from-slate-800 to-cyan-500 bg-clip-text text-transparent max-w-40'>20% discounts</p>
                            <p className='flex items-center gap-1 mt-4 text-cyan-600 font-medium'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        <img className='w-35' src={assets.hero_product_img2} alt="" />
                    </Link>
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero
