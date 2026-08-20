'use client'
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";

const Counter = ({ productId, maxStock = 999 }) => {

    const { cartItems } = useSelector(state => state.cart);
    const dispatch = useDispatch();
    const currentQty = cartItems[productId] || 0

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button
                onClick={() => dispatch(removeFromCart({ productId }))}
                disabled={currentQty <= 0}
                className="p-1 select-none disabled:opacity-30 disabled:cursor-not-allowed"
            >-</button>
            <p className="p-1 min-w-[20px] text-center">{currentQty}</p>
            <button
                onClick={() => {
                    if (currentQty < maxStock) {
                        dispatch(addToCart({ productId }))
                    }
                }}
                disabled={currentQty >= maxStock}
                className="p-1 select-none disabled:opacity-30 disabled:cursor-not-allowed"
            >+</button>
        </div>
    )
}

export default Counter
