import ProductClient from './ProductClient'

export function generateStaticParams() {
    return [
        { productId: 'prod_1' },
        { productId: 'prod_2' },
        { productId: 'prod_3' },
        { productId: 'prod_4' },
        { productId: 'prod_5' },
        { productId: 'prod_6' },
        { productId: 'prod_7' },
        { productId: 'prod_8' },
        { productId: 'prod_9' },
        { productId: 'prod_10' },
        { productId: 'prod_11' },
        { productId: 'prod_12' },
    ]
}

export default function ProductPage({ params }) {
    return <ProductClient params={params} />
}
