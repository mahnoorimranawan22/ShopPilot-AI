'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { apiAddToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon, ShoppingCartIcon, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

const ProductDetails = ({ product }) => {

    const productId = product._id || product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const cart = useSelector(state => state.cart.cartItems);
    const apiCartItems = useSelector(state => state.cart.apiCartItems);
    const useAPI = useSelector(state => state.cart.useAPI);
    const isLoggedIn = useSelector(state => state.user.isLoggedIn);
    const dispatch = useDispatch();
    const router = useRouter()

    const [mainImage, setMainImage] = useState(product.images[0]);
    const [adding, setAdding] = useState(false)

    // Get current quantity from either API or local cart
    const currentQty = useAPI ? (apiCartItems[productId] || 0) : (cart[productId] || 0)
    const inCart = currentQty > 0

    const stock = product.stock ?? 999
    const isOutOfStock = stock === 0 || product.inStock === false
    const isLowStock = stock > 0 && stock < 10

    const addToCartHandler = async () => {
        if (isOutOfStock) return toast.error('This product is out of stock')
        setAdding(true)

        if (isLoggedIn) {
            const result = await dispatch(apiAddToCart({ productId })).unwrap()
            if (result) {
                toast.success('Added to cart')
            } else {
                toast.error('Failed to add to cart')
            }
        } else {
            dispatch(addToCart({ productId }))
            toast.success('Added to cart')
        }
        setAdding(false)
    }

    const averageRating = product.avgRating || (product.rating?.length > 0
        ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length
        : 0)
    const ratingCount = product.ratingCount || product.rating?.length || 0

    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {(product.images || []).map((image, index) => (
                        <div key={index} onClick={() => setMainImage(product.images[index])} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer">
                            <Image src={image} className="group-hover:scale-103 group-active:scale-95 transition" alt="" width={45} height={45} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg">
                    <Image src={mainImage} alt="" width={250} height={250} />
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#6366f1" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{ratingCount} Reviews</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {currency}{product.price} </p>
                    {product.mrp > product.price && (
                        <p className="text-xl text-slate-500 line-through">{currency}{product.mrp}</p>
                    )}
                </div>
                {product.mrp > product.price && (
                    <div className="flex items-center gap-2 text-slate-500">
                        <TagIcon size={14} />
                        <p>Save {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% right now</p>
                    </div>
                )}

                {/* Stock Status */}
                <div className="mt-4">
                    {isOutOfStock ? (
                        <p className="text-sm font-medium text-red-600">Out of Stock</p>
                    ) : isLowStock ? (
                        <p className="text-sm font-medium text-amber-600">Only {stock} left — order soon!</p>
                    ) : (
                        <p className="text-sm text-green-600 flex items-center gap-1"><CheckIcon size={14} /> In Stock ({stock} available)</p>
                    )}
                </div>

                <div className="flex items-end gap-5 mt-8">
                    {inCart && (
                        <div className="flex flex-col gap-3">
                            <p className="text-sm text-slate-600 font-medium">Quantity</p>
                            <Counter productId={productId} maxStock={stock} />
                        </div>
                    )}
                    <button
                        onClick={inCart ? () => router.push('/cart') : addToCartHandler}
                        disabled={isOutOfStock || adding}
                        className="bg-indigo-600 text-white px-10 py-3 text-sm font-medium rounded hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ShoppingCartIcon size={16} />
                        {isOutOfStock ? 'Out of Stock' : adding ? 'Adding...' : inCart ? 'View Cart' : 'Add to Cart'}
                    </button>
                </div>
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> Free shipping worldwide </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" /> 100% Secured Payment </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Trusted by top brands </p>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
