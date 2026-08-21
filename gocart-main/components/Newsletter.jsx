'use client'
import React from 'react'
import Title from './Title'
import { motion } from 'framer-motion'

const Newsletter = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.6 }}
            className='flex flex-col items-center mx-4 my-36'>
            <Title title="Stay in the Loop" description="Get AI-curated deals, personalized product picks, and exclusive offers delivered to your inbox every week." visibleButton={false} />
            <div className='flex bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white ring ring-slate-200'>
                <input className='flex-1 pl-5 outline-none' type="text" placeholder='Enter your email address' />
                <button className='font-medium bg-orange-500 text-white px-7 py-3 rounded-full hover:bg-orange-500 hover:scale-103 active:scale-95 transition'>Get Updates</button>
            </div>
        </motion.div>
    )
}

export default Newsletter
