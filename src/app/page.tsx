import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/shop/product-card';
import { ArrowDown, Sparkles, Trophy, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Product } from '@/lib/types';
import { Suspense } from 'react';

async function getFeaturedProducts(): Promise<Product[]> {
  if (!supabase) {
    console.warn('Supabase client is not initialized, cannot fetch featured products.');
    return [];
  }

  try {
    // Obtener TODOS los productos de la base de datos
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('*') as { data: Product[] | null; error: { message: string } | null };

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    if (!allProducts || allProducts.length === 0) {
      return [];
    }

    // 🎲 RANDOMIZACIÓN COMPLETA - Productos diferentes en cada visita
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {featuredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[calc(100vh+9rem)] w-full overflow-hidden mt-[-9rem]">
        <video
          src="/assets/mi-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          aria-label="Video promocional de Joyas JP"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10" />

        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white p-4 pt-36">
          <Image
            src="/assets/logo.webp"
            alt="Joyas JP - Alta joyería para la escena urbana"
            width={500}
            height={500}
            priority
            className="h-auto w-80 md:w-96 lg:w-[450px] mb-6 drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]"
          />

          <p className="mt-4 max-w-2xl text-lg md:text-xl text-white/90 mb-8">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Atrévete a brillar con estilo único
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md w-full">
            <Link href="/shop" className="flex-1">
              <Button
                size="lg"
                className="w-full font-bold text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Ver Colección
              </Button>
            </Link>
            <Link href="/services" className="flex-1">
              <Button
                size="lg"
                variant="outline"
                className="w-full font-bold text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-105"
              >
                <Heart className="w-5 h-5 mr-2" />
                Servicios
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <ArrowDown className="w-8 h-8 text-white/70" />
          <span className="sr-only">Desplázate para ver más</span>
        </div>
      </section>

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
            <Link href="/shop">
              <Button size="lg" className="font-semibold px-8">
                Ver Toda la Colección
                <ArrowDown className="w-4 h-4 ml-2 rotate-[-90deg]" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Calidad Premium</h3>
              <p className="text-muted-foreground">
                Materiales de primera calidad con certificados de autenticidad y garantía completa.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Diseño Único</h3>
              <p className="text-muted-foreground">
                Cada pieza es cuidadosamente diseñada para reflejar la autenticidad del estilo urbano.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Pasión por el Arte</h3>
              <p className="text-muted-foreground">
                Creamos más que joyas, creamos expresiones artísticas que cuentan tu historia.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
