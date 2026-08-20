'use client'
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";
import RecommendedForYou from "@/components/RecommendedForYou";
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '@/lib/features/product/productSlice'
import { productDummyData } from '@/assets/assets'

export default function Home() {
    const dispatch = useDispatch()
    const { list: products } = useSelector(state => state.product)

    useEffect(() => {
        // Fetch products from API, fall back to dummy data if API unavailable
        dispatch(fetchProducts()).unwrap().catch(() => {
            // API not available (no DB connected) — load dummy data as fallback
            dispatch({ type: 'product/setProduct', payload: productDummyData })
        })
    }, [dispatch])

    return (
        <div>
            <Hero />
            <LatestProducts />
            <RecommendedForYou />
            <BestSelling />
            <OurSpecs />
            <Newsletter />
        </div>
    );
}
