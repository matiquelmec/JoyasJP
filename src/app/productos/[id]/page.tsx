import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddToWishlistButton } from '@/components/shop/add-to-wishlist-button'
import { RelatedProducts } from '@/components/shop/related-products'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase-client'
import type { Product } from '@/lib/types'
import { ProductPageClient } from '@/components/shop/product-page-client'
import { ProductSchema } from '@/components/seo/ProductSchema'
import { ProductImageGallery } from '@/components/shop/product-image-gallery'

interface ProductPageProps {
  params: {
    id: string
  }
}

import { ProductService } from '@/services/product.service'

/**
 * Obtiene un producto usando el servicio centralizado que soporta ID o Slug
 */
async function getProduct(idOrSlug: string): Promise<Product | null> {
  const product = await ProductService.getProductById(idOrSlug)
  return product
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
  const priceFormatted = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)
  
  const galleryImages = Array.isArray(product.gallery) && product.gallery.length > 0 
    ? product.gallery 
    : [product.imageUrl || '/assets/logo.webp']

  return {
    title: `${product.name} - ${priceFormatted} | Joyas JP`,
    description: `${productDescription}. Envío gratis en compras sobre $50.000.`,
    openGraph: {
      type: 'website',
      title: `${product.name} | Joyas JP`,
      description: `${productDescription} - ${priceFormatted}`,
      images: galleryImages.map(img => ({
        url: img,
        width: 1200,
        height: 1200,
        alt: product.name,
      })),
      siteName: 'Joyas JP',
      locale: 'es_CL',
      url: `/productos/${product.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Joyas JP`,
      description: productDescription.slice(0, 140),
      images: [galleryImages[0]],
    },
  }
}

// Revalidar cada 12 horas (ISR) para mantener datos y optimizar el uso de Supabase
export const revalidate = 43200

export async function generateStaticParams() {
  if (!supabase) {
    return []
  }

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, slug')

    if (error || !products) {
      return []
    }

    const paths = products.flatMap((product: any) => {
      const p = []
      if (product.id) p.push({ id: product.id })
      if (product.slug) p.push({ id: product.slug })
      return p
    })

    return paths
  } catch (error) {
    return []
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  const availability = (product.stock && product.stock > 0) ? 'InStock' : 'OutOfStock'

  return (
    <div className="min-h-screen bg-background">
      <ProductSchema product={product} availability={availability} />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link
            href="/productos"
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
          {/* Product Gallery */}
          <div className="space-y-6">
            <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
              <ProductImageGallery 
                images={product.gallery || [product.imageUrl]} 
                name={product.name} 
              />

              {/* Image Actions */}
              <div className="absolute top-4 right-4 z-10">
                <AddToWishlistButton product={product} />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="capitalize">
                  {product.category}
                </Badge>
              </div>

              <h1 className="text-3xl lg:text-4xl font-headline font-bold">
                {product.name}
              </h1>
            </div>

            {/* Price - Now using client component for dynamic config */}
            <ProductPageClient
              product={product}
              variants={await ProductService.getSiblings(product)}
            />

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
