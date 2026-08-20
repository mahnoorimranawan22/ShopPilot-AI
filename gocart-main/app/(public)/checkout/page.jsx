'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Image from "next/image"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { PlusIcon, XIcon, ShieldCheckIcon, TruckIcon, CreditCardIcon } from "lucide-react"
import AddressModal from "@/components/AddressModal"
import { clearCart, apiClearCart } from "@/lib/features/cart/cartSlice"
import { ordersAPI } from "@/lib/api"

export default function Checkout() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const router = useRouter()
    const dispatch = useDispatch()

    const { cartItems, apiCart, apiCartItems, useAPI } = useSelector(state => state.cart)
    const products = useSelector(state => state.product.list)
    const addressList = useSelector(state => state.address.list)
    const isLoggedIn = useSelector(state => state.user.isLoggedIn)

    const [cartArray, setCartArray] = useState([])
    const [totalPrice, setTotalPrice] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState('COD')
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [couponCodeInput, setCouponCodeInput] = useState('')
    const [coupon, setCoupon] = useState('')
    const [step, setStep] = useState(1)
    const [placing, setPlacing] = useState(false)

    useEffect(() => {
        let total = 0
        const arr = []

        if (useAPI && apiCart?.items) {
            for (const item of apiCart.items) {
                const product = item.product
                if (product) {
                    arr.push({ ...product, quantity: item.quantity, id: product._id || product.id })
                    total += (product.price || 0) * item.quantity
                }
            }
        } else {
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

    const handlePlaceOrder = async () => {
        if (!selectedAddress) return toast.error('Please select a delivery address')
        setPlacing(true)

        try {
            if (isLoggedIn) {
                const orderData = {
                    shippingAddress: {
                        name: selectedAddress.name,
                        email: selectedAddress.email || '',
                        street: selectedAddress.street,
                        city: selectedAddress.city,
                        state: selectedAddress.state,
                        zip: selectedAddress.zip,
                        country: selectedAddress.country || 'USA',
                        phone: selectedAddress.phone || '',
                    },
                    paymentMethod,
                    couponCode: coupon?.code || '',
                }

                await ordersAPI.place(orderData)
                dispatch(apiClearCart())
            } else {
                dispatch(clearCart())
            }

            toast.success('Order placed successfully! 🎉')
            router.push('/orders')
        } catch (error) {
            toast.error(error.message || 'Failed to place order')
        } finally {
            setPlacing(false)
        }
    }

    if (cartArray.length === 0) {
        return (
            <div className="min-h-[80vh] mx-6 flex flex-col items-center justify-center text-slate-400 gap-4">
                <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
                <p className="text-sm">Add some products before checking out</p>
                <button onClick={() => router.push('/shop')} className="bg-indigo-600 text-white px-8 py-2.5 rounded-full hover:bg-indigo-700 transition text-sm">
                    Browse Products
                </button>
            </div>
        )
    }

    const discount = coupon ? (coupon.discount / 100 * totalPrice) : 0
    const finalTotal = totalPrice - discount

    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-6xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-semibold">Checkout</h1>
                    <p className="text-slate-500 text-sm mt-1">{cartArray.length} item{cartArray.length > 1 ? 's' : ''} in your order</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-3 mb-10 max-w-md">
                    {[{ n: 1, label: 'Address' }, { n: 2, label: 'Payment' }, { n: 3, label: 'Confirm' }].map((s, i) => (
                        <div key={s.n} className="flex items-center gap-3 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition ${step >= s.n ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {step > s.n ? '✓' : s.n}
                            </div>
                            <span className={`text-xs sm:text-sm hidden sm:block ${step >= s.n ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{s.label}</span>
                            {i < 2 && <div className={`flex-1 h-0.5 rounded ${step > s.n ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        {/* Step 1: Address */}
                        {step === 1 && (
                            <div className="bg-white border border-slate-200 rounded-xl p-6">
                                <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
                                {addressList.length > 0 && (
                                    <div className="space-y-3 mb-4">
                                        {addressList.map((addr, index) => (
                                            <label key={index} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${selectedAddress?.id === addr.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                                                <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="mt-1 accent-indigo-600" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-slate-700">{addr.name}</p>
                                                    <p className="text-slate-500">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
                                                    <p className="text-slate-500">{addr.country} · {addr.phone}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => setShowAddressModal(true)} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                    <PlusIcon size={16} /> Add New Address
                                </button>
                                <div className="flex justify-end mt-6">
                                    <button onClick={() => setStep(2)} disabled={!selectedAddress} className="bg-indigo-600 text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                                        Continue to Payment
                                    </button>
                                </div>
                                {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}
                            </div>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <div className="bg-white border border-slate-200 rounded-xl p-6">
                                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                                <div className="space-y-3">
                                    {[
                                        { id: 'COD', label: 'Cash on Delivery', icon: TruckIcon, desc: 'Pay when your order arrives' },
                                        { id: 'STRIPE', label: 'Credit / Debit Card', icon: CreditCardIcon, desc: 'Secure online payment via Stripe' },
                                    ].map(method => (
                                        <label key={method.id} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${paymentMethod === method.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-indigo-600" />
                                            <method.icon size={20} className="text-slate-500" />
                                            <div>
                                                <p className="font-medium text-sm text-slate-700">{method.label}</p>
                                                <p className="text-xs text-slate-400">{method.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-6">
                                    <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-slate-700 font-medium">← Back</button>
                                    <button onClick={() => setStep(3)} className="bg-indigo-600 text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-indigo-700 transition">Review Order</button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirm */}
                        {step === 3 && (
                            <div className="bg-white border border-slate-200 rounded-xl p-6">
                                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                                <div className="divide-y divide-slate-100">
                                    {cartArray.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 py-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                                                <Image src={item.images?.[0] || ''} alt="" width={50} height={50} className="h-12 w-auto" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                                                <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium text-slate-700">{currency}{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Address:</span>
                                        <span className="text-slate-700">{selectedAddress?.name}, {selectedAddress?.city}, {selectedAddress?.state}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Payment:</span>
                                        <span className="text-slate-700">{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Credit / Debit Card'}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-6">
                                    <button onClick={() => setStep(2)} className="text-sm text-slate-500 hover:text-slate-700 font-medium">← Back</button>
                                    <button onClick={handlePlaceOrder} disabled={placing} className="bg-indigo-600 text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60 flex items-center gap-2">
                                        {placing ? 'Placing Order...' : `Place Order · ${currency}${finalTotal.toFixed(2)}`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Total Sidebar */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sticky top-6">
                            <h3 className="font-semibold text-slate-700 mb-4">Order Total</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal ({cartArray.length} items)</span>
                                    <span className="text-slate-700">{currency}{totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Shipping</span>
                                    <span className="text-emerald-600 font-medium">Free</span>
                                </div>
                                {coupon && (
                                    <div className="flex justify-between text-slate-500">
                                        <span>Coupon ({coupon.code})</span>
                                        <span className="text-emerald-600">-{currency}{discount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="my-4 pt-4 border-t border-slate-200">
                                {!coupon ? (
                                    <form onSubmit={(e) => { e.preventDefault(); if (couponCodeInput.toUpperCase() === 'NEW20') { setCoupon({ code: 'NEW20', discount: 20, description: '20% Off' }); toast.success('Coupon applied!') } else { toast.error('Invalid coupon code') } }} className="flex gap-2">
                                        <input value={couponCodeInput} onChange={(e) => setCouponCodeInput(e.target.value)} type="text" placeholder="Coupon code" className="flex-1 text-sm p-2 border border-slate-200 rounded outline-none focus:border-indigo-400" />
                                        <button type="submit" className="text-sm px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 transition">Apply</button>
                                    </form>
                                ) : (
                                    <div className="flex items-center justify-between text-xs">
                                        <p>🎉 <span className="font-semibold">{coupon.code}</span> — {coupon.description}</p>
                                        <XIcon size={14} className="cursor-pointer text-slate-400 hover:text-red-500" onClick={() => { setCoupon(''); setCouponCodeInput('') }} />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between pt-4 border-t border-slate-200 text-lg font-semibold">
                                <span>Total</span>
                                <span>{currency}{finalTotal.toFixed(2)}</span>
                            </div>
                            <div className="mt-6 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-slate-400"><ShieldCheckIcon size={14} /> Secure checkout</div>
                                <div className="flex items-center gap-2 text-xs text-slate-400"><TruckIcon size={14} /> Free shipping on all orders</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
