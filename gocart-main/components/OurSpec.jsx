'use client'
import React from 'react'
import Title from './Title'
import { ourSpecsData } from '@/assets/assets'
import { motion } from 'framer-motion'

const cardVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    })
}

const OurSpecs = () => {

    return (
        <div className='px-6 my-20 max-w-6xl mx-auto'>
            <Title visibleButton={false} title='Why ShopPilot AI?' description="Intelligent shopping features designed to help you discover, compare, and buy with confidence." />

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 gap-y-10 mt-26'>
                {
                    ourSpecsData.map((spec, index) => {
                        return (
                            <motion.div
                                key={index}
                                custom={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-30px' }}
                                variants={cardVariant}
                                whileHover={{ y: -5, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}
                                className='relative h-44 px-8 flex flex-col items-center justify-center w-full text-center border rounded-lg group cursor-default'
                                style={{ backgroundColor: spec.accent + 10, borderColor: spec.accent + 30 }}
                            >
                                <h3 className='text-slate-800 font-medium'>{spec.title}</h3>
                                <p className='text-sm text-slate-600 mt-3'>{spec.description}</p>
                                <motion.div
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    className='absolute -top-5 text-white size-10 flex items-center justify-center rounded-md'
                                    style={{ backgroundColor: spec.accent }}
                                >
                                    <spec.icon size={20} />
                                </motion.div>
                            </motion.div>
                        )
                    })
                }
            </div>

        </div>
    )
}

export default OurSpecs
