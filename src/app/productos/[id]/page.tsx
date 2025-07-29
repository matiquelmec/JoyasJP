import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import { getProductById, getRelatedProducts } from '@/lib/api'; // Usar API cacheada
import { Product } from '@/lib/types';
import { AddToCartButton } from '@/components/shop/add-to-cart-button';
import { AddToWishlistButton } from '@/components/shop/add-to-wishlist-button';
import { RelatedProductsServer, RelatedProductsSkeleton } from '@/components/shop/related-products-server';
import { ProductPreloader } from '@/components/performance/product-preloader';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase-client';

interface ProductPageProps {
  params: {
    id: string;
  };
}

// Eliminamos getProduct local - usamos la versión cacheada de api.ts

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductById(params.id);

  if (!product) {
    return {
      title: 'Producto no encontrado | Joyas JP',
    };
  }

  return {
    title: `${product.name} | Joyas JP`,
    description: product.description || `Descubre ${product.name} - Alta joyería urbana de Joyas JP`,
    openGraph: {
      title: `${product.name} | Joyas JP`,
      description: product.description || `Descubre ${product.name} - Alta joyería urbana de Joyas JP`,
      images: [
        {
          url: product.imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  // Solo generar static params para productos más populares
  // El resto se generará on-demand (ISR)
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized for generateStaticParams.');
      return [];
    }
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .limit(50); // Solo pre-generar top 50 productos
    
    return products?.map((product) => ({
      id: product.id,
    })) || [];
  } catch (error) {
    console.error('Error generating static params:', error as Error);
    return [];
  }
}

// Configuración ISR - regenerar cada 1 hora
export const revalidate = 3600;

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="min-h-screen bg-background">
      <ProductPreloader 
        productImageUrl={product.imageUrl} 
        relatedCategory={product.category}
      />
      
      {/* 🔧 SOLUCIÓN: Container con padding adicional para evitar conflicto con header */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link
            href="/productos"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a productos
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* Product Image Optimizada */}
          <div className="space-y-6">
            <div className="relative aspect-square w-full max-w-lg mx-auto lg:max-w-none bg-muted/30 rounded-lg overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={`${product.name} - Joya premium de ${product.category} en ${product.color || 'varios colores'}`}
                width={600}
                height={600}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 45vw"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                priority
                fetchPriority="high"
                loading="eager"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
              

              <h1 className="text-3xl lg:text-4xl font-headline font-bold">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary">
                {formattedPrice}
              </p>
              <p className="text-sm text-muted-foreground">
                Precio incluye IVA. Envío gratis a partir de $40.000
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Descripción</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Details / Characteristics */}
            {(product.dimensions || product.materials || product.color || product.detail) && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Detalles del Producto</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {product.dimensions && <li>Dimensiones: {product.dimensions}</li>}
                  {product.materials && <li>Materiales: {product.materials}</li>}
                  {product.color && <li>Color: {product.color}</li>}
                  {product.detail && <li>Detalle: {product.detail}</li>}
                </ul>
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="space-y-4">
              <AddToCartButton product={product} className="w-full" size="lg" />
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Beneficios</h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="w-5 h-5 text-primary" />
                  <span>Envío gratis a partir de $40.000</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <span>Devoluciones gratuitas hasta 30 días</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products - Delayed to prioritize main image */}
        <div className="mt-16">
          <Suspense fallback={<RelatedProductsSkeleton />}>
            <RelatedProductsServer 
              currentProductId={product.id} 
              category={product.category} 
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
