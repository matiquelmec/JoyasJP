"use client";

import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import ProductCard from '@/components/shop/product-card';
import { supabase } from '@/lib/supabase-client';

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
}

export function RelatedProducts({ currentProductId, category }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        setLoading(true);
        if (!supabase) {
          throw new Error('Supabase client is not initialized.');
        }
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', category)
          .neq('id', currentProductId)
          .limit(4); // Limitar a 4 productos relacionados

        if (error) {
          throw error;
        }

        setRelatedProducts(data as unknown as Product[]);
      } catch (e: unknown) {
        const err = e as { message: string };
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedProducts();
  }, [currentProductId, category]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Productos Relacionados</h2>
        <p>Cargando productos relacionados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Productos Relacionados</h2>
        <p className="text-red-500">Error al cargar productos relacionados: {error}</p>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Productos Relacionados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}