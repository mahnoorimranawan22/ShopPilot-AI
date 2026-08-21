'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'

export function AnimateOnScroll({ children, direction = 'up', delay = 0, duration = 0.5, className = '', once = true }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once, margin: '-50px' })
    const controls = useAnimation()

    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
            x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
            scale: direction === 'scale' ? 0.9 : 1,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            transition: { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] },
        },
    }

    useEffect(() => {
        if (isInView) controls.start('visible')
    }, [isInView, controls])

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerContainer({ children, className = '', stagger = 0.08 }) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: stagger } },
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({ children, className = '' }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function FadeIn({ children, className = '', delay = 0, duration = 0.6 }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay, duration }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function SlideUp({ children, className = '', delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function ScaleIn({ children, className = '', delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5, type: 'spring', stiffness: 200 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function TextReveal({ text, className = '', delay = 0 }) {
    const words = text.split(' ')
    return (
        <motion.span className={className}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + i * 0.08, duration: 0.5 }}
                >
                    {word}&nbsp;
                </motion.span>
            ))}
        </motion.span>
    )
}

export function CountUp({ end, duration = 2, delay = 0, prefix = '', suffix = '' }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        if (!isInView) return
        let start = 0
        const increment = end / (duration * 60)
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                start += increment
                if (start >= end) {
                    setCount(end)
                    clearInterval(interval)
                } else {
                    setCount(Math.floor(start))
                }
            }, 1000 / 60)
            return () => clearInterval(interval)
        }, delay * 1000)
        return () => clearTimeout(timer)
    }, [end, duration, delay, isInView])

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    )
}
