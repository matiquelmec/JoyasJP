import {
  ArrowLeft,
  Heart,
  RotateCcw,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { AddToWishlistButton } from '@/components/shop/add-to-wishlist-button'
import { RelatedProducts } from '@/components/shop/related-products'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase-client'
import type { Product } from '@/lib/types'
import { ProductPageClient } from '@/components/shop/product-page-client'

interface ProductPageProps {
  params: {
    id: string
  }
}

async function getProduct(id: string): Promise<Product | null> {
  if (!supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    return data as unknown as Product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: 'Producto no encontrado | Joyas JP',
    }
  }

  const productDescription = product.description || `Descubre ${product.name} - Alta joyería urbana de Joyas JP`

  return {
    title: `${product.name} | Joyas JP`,
    description: productDescription,
    keywords: [
      product.name,
      product.category,
      'joyas urbanas',
      'joyería premium Chile',
      'alta joyería',
      'Joyas JP',
      product.category === 'rings' ? 'anillos' : product.category === 'necklaces' ? 'collares' : product.category,
    ],
    openGraph: {
      type: 'website',
      title: `${product.name} | Joyas JP`,
      description: productDescription,
      images: [
        {
          url: product.imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      siteName: 'Joyas JP',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Joyas JP`,
      description: productDescription,
      images: [product.imageUrl],
    },
    alternates: {
      canonical: `/shop/${product.id}`,
    },
  }
}

export async function generateStaticParams() {
  if (!supabase) {
    return []
  }

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id')

    if (error || !products) {
      console.error('Error fetching product IDs for static generation:', error)
      return []
    }

    return products.map((product) => ({
      id: product.id,
    }))
  } catch (error) {
    console.error('Error in generateStaticParams:', error)
    return []
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 🔧 SOLUCIÓN: Container con padding adicional para evitar conflicto con header */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link
            href="/shop"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-6">
            <div className="relative aspect-square w-full max-w-lg mx-auto lg:max-w-none bg-muted/30 rounded-lg overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />

              {/* Image Actions */}
              <div className="absolute top-4 right-4">
                <AddToWishlistButton product={product} />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {product.category}
                </Badge>
                {/* Featured badge removed as 'featured' field doesn't exist in Product interface */}
              </div>

              <h1 className="text-3xl lg:text-4xl font-headline font-bold">
                {product.name}
              </h1>
            </div>

            {/* Price - Now using client component for dynamic config */}
            <ProductPageClient product={product} />

          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts
          currentProductId={product.id}
          category={product.category}
        />
      </div>
    </div>
  )
}
