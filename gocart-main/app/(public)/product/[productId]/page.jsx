'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProductById } from "@/lib/features/product/productSlice";
import { productDummyData } from "@/assets/assets";
import Loading from "@/components/Loading";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch()
    const products = useSelector(state => state.product.list);

    useEffect(() => {
        scrollTo(0, 0)
        setLoading(true)

        // Try fetching from API
        dispatch(fetchProductById(productId)).unwrap().then((data) => {
            if (data) {
                setProduct(data)
            } else {
                // Fallback to local data
                const local = products.find((p) => (p._id || p.id) === productId)
                if (local) {
                    setProduct(local)
                } else {
                    const fallback = productDummyData.find((p) => p.id === productId)
                    if (fallback) setProduct(fallback)
                }
            }
        }).catch(() => {
            // API unavailable — try local Redux store
            const local = products.find((p) => (p._id || p.id) === productId)
            if (local) {
                setProduct(local)
            } else {
                const fallback = productDummyData.find((p) => p.id === productId)
                if (fallback) setProduct(fallback)
            }
        }).finally(() => {
            setLoading(false)
        })
    }, [productId, dispatch, products]);

    if (loading) return <Loading />

    if (!product) {
        return (
            <div className="min-h-[60vh] mx-6 flex items-center justify-center text-slate-400">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-500">Product not found</h2>
                    <p className="text-sm mt-2">This product may have been removed or doesn't exist.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <div className="text-gray-600 text-sm mt-8 mb-5">
                    <a href="/" className="hover:text-indigo-600">Home</a>
                    {' / '}
                    <a href="/shop" className="hover:text-indigo-600">Products</a>
                    {' / '}
                    <span className="text-slate-700">{product?.category}</span>
                </div>

                {/* Product Details */}
                <ProductDetails product={product} />

                {/* Description & Reviews */}
                <ProductDescription product={product} />
            </div>
        </div>
    );
}
