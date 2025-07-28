import { getRelatedProducts } from '@/lib/api';
import ProductCard from '@/components/shop/product-card';
import { RelatedProductsLoadingSkeleton } from '@/components/ui/enterprise-loading';

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

// Simplified loading skeleton using centralized system
export function RelatedProductsSkeleton() {
  return <RelatedProductsLoadingSkeleton />;
}