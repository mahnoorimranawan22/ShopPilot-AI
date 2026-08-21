'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { motion } from 'framer-motion'
import CategoriesMarquee from './CategoriesMarquee'

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
}

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const Hero = () => {

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={container}
                    className='relative flex-1 flex flex-col bg-gradient-to-br from-orange-50 via-white to-rose-50 border border-orange-100 rounded-3xl xl:min-h-100 group overflow-hidden'
                >
                    {/* Subtle grid pattern */}
                    <div className='absolute inset-0 opacity-[0.03]' style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                    {/* Animated gradient blob */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className='absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-violet-400/20 rounded-full blur-3xl'
                    />

                    <div className='relative p-5 sm:p-16 z-10'>
                        {/* Badge */}
                        <motion.div variants={fadeUp} className='inline-flex items-center gap-2 bg-orange-100/80 bg-orange-100/80 backdrop-blur text-orange-600 px-4 py-2 rounded-full text-xs sm:text-sm font-medium'>
                            <motion.div
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <SparklesIcon size={14} className='text-orange-500' />
                            </motion.div>
                            AI-Powered Shopping Experience
                        </motion.div>

                        {/* Headline with staggered word reveal */}
                        <h1 className='text-4xl sm:text-6xl leading-[1.1] my-5 sm:my-6 font-bold'>
                            <motion.span variants={fadeUp} className='text-slate-800 block'>
                                Shop smarter with
                            </motion.span>
                            <motion.span
                                variants={fadeUp}
                                className='bg-gradient-to-r from-orange-500 via-rose-500 to-orange-500 bg-clip-text text-transparent inline-block'
                            >
                                AI.
                            </motion.span>
                        </h1>

                        {/* Description */}
                        <motion.p variants={fadeUp} className='text-slate-500 text-base sm:text-lg leading-relaxed max-w-md mb-8 sm:mb-10'>
                            Discover products personalized to you and make better purchasing decisions with intelligent recommendations.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div variants={fadeUp} className='flex flex-wrap items-center gap-4'>
                            <Link href='/shop' className='inline-flex items-center gap-2 bg-orange-500 text-white text-sm font-medium py-3.5 px-8 rounded-full hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25 active:scale-95 transition-all duration-200'>
                                Explore Products
                                <motion.span
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <ArrowRightIcon size={16} />
                                </motion.span>
                            </Link>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { query: '' } }))}
                                className='inline-flex items-center gap-2 bg-white bg-white text-slate-700 text-sm font-medium py-3.5 px-8 rounded-full border border-slate-200 hover:border-orange-300 hover:text-orange-500 hover:shadow-md active:scale-95 transition-all duration-200'
                            >
                                ✨ Ask ShopPilot AI
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* Hero Model Image */}
                    <motion.img
                        variants={fadeUp}
                        className='sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm opacity-90'
                        src={assets.hero_model_img}
                        alt=""
                    />
                </motion.div>

                {/* Side Cards */}
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <Link href='/shop' className='flex-1 flex items-center justify-between w-full bg-gradient-to-br from-rose-100 to-rose-50 border border-rose-200/50 rounded-3xl p-6 px-8 group hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300'>
                            <div>
                                <p className='text-3xl font-bold bg-gradient-to-r from-slate-800 to-rose-500 bg-clip-text text-transparent max-w-40'>Best products</p>
                                <p className='flex items-center gap-1 mt-4 text-rose-600 font-medium'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                            </div>
                            <img className='w-35' src={assets.hero_product_img1} alt="" />
                        </Link>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55, duration: 0.6 }}
                    >
                        <Link href='/shop' className='flex-1 flex items-center justify-between w-full bg-gradient-to-br from-cyan-100 to-cyan-50 border border-cyan-200/50 rounded-3xl p-6 px-8 group hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300'>
                            <div>
                                <p className='text-3xl font-bold bg-gradient-to-r from-slate-800 to-cyan-500 bg-clip-text text-transparent max-w-40'>20% discounts</p>
                                <p className='flex items-center gap-1 mt-4 text-cyan-600 font-medium'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                            </div>
                            <img className='w-35' src={assets.hero_product_img2} alt="" />
                        </Link>
                    </motion.div>
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero
