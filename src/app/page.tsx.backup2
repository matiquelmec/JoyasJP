import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/shop/product-card';
import { ArrowDown } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Product } from '@/lib/types';

async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch featured products.');
  }

  // Shuffle and select 6 random products
  const shuffled = data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  return (
    <div className="flex flex-col">
      <section className="relative h-screen w-full overflow-hidden">
        <video
          src="/assets/mi-video.mp4"
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10" />

        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white p-4">
          <Image
            src="/assets/logo.png"
            alt="Joyas JP Logo"
            width={500}
            height={500}
            priority
            className="h-auto w-48 md:w-64 lg:w-80"
          />
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-foreground/80">
            Atrévete a jugar
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/shop">
              <Button size="lg" className="font-bold text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-300 hover:scale-105 w-64">
                Compra la Colección
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" className="font-bold text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-transform duration-300 hover:scale-105 w-64">
                Servicios para Artistas
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <ArrowDown className="w-8 h-8 text-white/70" />
        </div>
      </section>

      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-headline text-center font-bold mb-12">Piezas Destacadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}