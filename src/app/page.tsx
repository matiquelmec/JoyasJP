import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/shop/product-card';
import { ArrowDown, Sparkles, Trophy, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Product } from '@/lib/types';
import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { ImagePreloader } from '@/components/performance/image-preloader';
import { HeroSection } from '@/components/home/hero-section';

export const dynamic = 'force-dynamic';

async function getFeaturedProducts(): Promise<Product[]> {
  noStore();
  if (!supabase) {
    console.warn('Supabase client is not initialized, cannot fetch featured products.');
    return [];
  }

  try {
    // Obtener solo los campos necesarios para productos destacados
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('id, name, price, imageUrl, category, description, materials, color')
      .gt('stock', 0) // Solo productos en stock
      .order('updated_at', { ascending: false })
      .limit(20) as { data: Product[] | null; error: { message: string } | null }; // Limitar consulta inicial

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    if (!allProducts || allProducts.length === 0) {
      return [];
    }

    // 🎲 RANDOMIZACIÓN OPTIMIZADA - Solo de los 20 más recientes
    const shuffledProducts = allProducts
      .map(product => ({ product, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ product }) => product);

    // Tomar los primeros 6 productos aleatorizados
    return shuffledProducts.slice(0, 6);

  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    return [];
  }
}

function ProductSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-5 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

function FeaturedProductsSection() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({length: 6}).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    }>
      <FeaturedProducts />
    </Suspense>
  );
}

async function FeaturedProducts() {
  const featuredProducts = await getFeaturedProducts();

  if (featuredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Próximamente</h3>
        <p className="text-muted-foreground">
          Estamos preparando nuestra increíble colección para ti.
        </p>
        <Link href="/contact">
          <Button className="mt-4" variant="outline">
            Contáctanos para más información
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Precargar imágenes de productos destacados */}
      <ImagePreloader 
        images={featuredProducts.slice(0, 6).map(p => p.imageUrl)}
        priority={true}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredProducts.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            index={index}
            priority={index < 3} // Prioridad para las primeras 3 en home
          />
        ))}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section Adaptativo */}
      <HeroSection />

      {/* Featured Products Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">
              Piezas Destacadas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestra selección de joyas únicas, diseñadas para expresar tu personalidad y estilo.
            </p>
          </div>

          <FeaturedProductsSection />

          <div className="text-center mt-12">
            <Link href="/productos">
              <Button size="lg" className="font-semibold px-8">
                Ver Toda la Colección
                <ArrowDown className="w-4 h-4 ml-2 rotate-[-90deg]" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      
     </div>
  );
}
