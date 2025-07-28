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

// Enterprise loading skeleton component
export function RelatedProductsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <div className="h-8 bg-gray-300 rounded-lg w-64 animate-pulse" />
      
      {/* Products grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden shadow-sm">
            {/* Enterprise dark image skeleton */}
            <div className="aspect-square bg-gray-900 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
                   style={{ animationDelay: `${i * 200}ms` }} />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/50 text-xs">
                  Producto relacionado...
                </div>
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" 
                   style={{ animationDelay: `${i * 100}ms` }} />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" 
                   style={{ animationDelay: `${i * 150}ms` }} />
              <div className="h-5 bg-gray-400 rounded w-2/3 animate-pulse" 
                   style={{ animationDelay: `${i * 200}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}