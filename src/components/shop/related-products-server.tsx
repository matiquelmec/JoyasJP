import { getRelatedProducts } from '@/lib/api';
import ProductCard from '@/components/shop/product-card';

interface RelatedProductsServerProps {
  currentProductId: string;
  category: string;
}

export async function RelatedProductsServer({ 
  currentProductId, 
  category 
}: RelatedProductsServerProps) {
  const relatedProducts = await getRelatedProducts(currentProductId, category, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl lg:text-3xl font-headline font-bold">
        Productos Relacionados
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            index={index + 50} // Offset alto para evitar priority 
          />
        ))}
      </div>
    </div>
  );
}

// Loading skeleton component
export function RelatedProductsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded-lg w-64 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden shadow-sm animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-5 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}