'use client'
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";
import RecommendedForYou from "@/components/RecommendedForYou";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '@/lib/features/product/productSlice'
import { productDummyData } from '@/assets/assets'

export default function Home() {
    const dispatch = useDispatch()
    const { list: products } = useSelector(state => state.product)

    useEffect(() => {
        dispatch(fetchProducts()).unwrap().catch(() => {
            dispatch({ type: 'product/setProduct', payload: productDummyData })
        })
    }, [dispatch])

    return (
        <div>
            <Hero />
            <AnimateOnScroll>
                <LatestProducts />
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.1}>
                <RecommendedForYou />
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.1}>
                <BestSelling />
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.1}>
                <OurSpecs />
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.1}>
                <Newsletter />
            </AnimateOnScroll>
        </div>
    );
}
