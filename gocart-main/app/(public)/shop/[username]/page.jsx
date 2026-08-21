import ProductClient from './StoreShopClient'

export function generateStaticParams() {
    return [
        { username: 'seller_1' },
        { username: 'seller_2' },
    ]
}

export default function StoreShopPage({ params }) {
    return <ProductClient params={params} />
}
