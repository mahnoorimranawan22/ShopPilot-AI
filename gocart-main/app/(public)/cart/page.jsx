'use client'
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart, apiRemoveFromCart, apiUpdateCartItem } from "@/lib/features/cart/cartSlice";
import { Trash2Icon, ShoppingCartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import PageTransition from "@/components/ui/PageTransition";

export default function Cart() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const dispatch = useDispatch()

    const { cartItems, apiCart, apiCartItems, useAPI } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);
    const isLoggedIn = useSelector(state => state.user.isLoggedIn);

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    // Build cart array from either API or local data
    useEffect(() => {
        let total = 0
        const arr = []

        if (useAPI && apiCart?.items) {
            // API cart — items have populated product data
            for (const item of apiCart.items) {
                const product = item.product
                if (product && (product._id || product.id)) {
                    const qty = item.quantity
                    arr.push({ ...product, quantity: qty, id: product._id || product.id })
                    total += (product.price || 0) * qty
                }
            }
        } else {
            // Local cart
            for (const [key, value] of Object.entries(cartItems)) {
                const product = products.find(p => (p._id || p.id) === key)
                if (product) {
                    arr.push({ ...product, quantity: value, id: product._id || product.id })
                    total += product.price * value
                }
            }
        }

        setCartArray(arr)
        setTotalPrice(total)
    }, [cartItems, apiCart, apiCartItems, useAPI, products])

    const handleDeleteItem = (productId) => {
        if (isLoggedIn) {
            dispatch(apiRemoveFromCart(productId))
        } else {
            dispatch(deleteItemFromCart({ productId }))
        }
        toast.success('Removed from cart')
    }

    if (cartArray.length === 0) {
        return (
            <PageTransition>
            <div className="min-h-[80vh] mx-6 flex flex-col items-center justify-center text-slate-400 gap-4">
                <ShoppingCartIcon size={64} strokeWidth={1} className="text-slate-300" />
                <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
                <p className="text-sm">Discover amazing products on ShopPilot AI</p>
                <Link href="/shop" className="bg-orange-500 text-white px-8 py-2.5 rounded-full hover:bg-orange-600 transition text-sm">
                    Browse Products
                </Link>
            </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition>
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto ">
                <PageTitle heading="My Cart" text={`${cartArray.length} item${cartArray.length > 1 ? 's' : ''} in your cart`} linkText="Add more" />

                <div className="flex items-start justify-between gap-5 max-lg:flex-col">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full max-w-4xl text-slate-600 table-auto">
                            <thead>
                                <tr className="max-sm:text-sm">
                                    <th className="text-left">Product</th>
                                    <th>Quantity</th>
                                    <th>Total Price</th>
                                    <th className="max-md:hidden">Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartArray.map((item, index) => (
                                    <tr key={index} className="space-x-2">
                                        <td className="flex gap-3 my-4">
                                            <Link href={`/product/${item.id}`} className="flex gap-3 items-center justify-center bg-slate-100 size-18 rounded-md hover:bg-slate-200 transition">
                                                <Image src={item.images?.[0] || ''} className="h-14 w-auto" alt="" width={45} height={45} />
                                            </Link>
                                            <div>
                                                <Link href={`/product/${item.id}`} className="max-sm:text-sm hover:text-orange-500 transition">{item.name}</Link>
                                                <p className="text-xs text-slate-500">{item.category}</p>
                                                <p>{currency}{item.price}</p>
                                                {item.stock !== undefined && item.stock < 10 && item.stock > 0 && (
                                                    <p className="text-xs text-amber-600">Only {item.stock} left</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <Counter productId={item.id} maxStock={item.stock || 999} />
                                        </td>
                                        <td className="text-center">{currency}{(item.price * item.quantity).toLocaleString()}</td>
                                        <td className="text-center max-md:hidden">
                                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all">
                                                <Trash2Icon size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <OrderSummary totalPrice={totalPrice} items={cartArray} />
                </div>
            </div>
        </div>
        </PageTransition>
    )
}
