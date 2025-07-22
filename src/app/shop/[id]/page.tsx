import { notFound } from 'next/navigation';
import { ProductDetailView } from '@/components/shop/product-detail-view';
import { getProductById, getRelatedProducts } from '@/lib/api';
import { products } from '@/lib/products'; // Fallback a los productos estáticos
import type { Metadata } from 'next';

interface ProductPageProps {
  params: {
    id: string;
  };
}

// Función para obtener producto (con fallback)
async function getProduct(id: string) {
  try {
    // Intentar obtener de Supabase primero
    const product = await getProductById(id);
    if (product) {
      return product;
    }
  } catch (error) {
    console.log('Error fetching from Supabase, using static data:', error);
  }

  // Fallback a productos estáticos
  const staticProduct = products.find(p => p.id === id);
  if (!staticProduct) {
    return null;
  }

  // Convertir producto estático al formato correcto
  return {
    ...staticProduct,
    description: staticProduct.description || `${staticProduct.name} - Joya de alta calidad perfecta para complementar tu estilo personal. Fabricada en ${staticProduct.materials || 'materiales premium'} con acabado ${staticProduct.color?.toLowerCase() || 'elegante'}. ${staticProduct.dimensions ? `Dimensiones: ${staticProduct.dimensions}cm.` : ''} Perfecta para regalar o para uso personal.`,
    image_hint: staticProduct.name,
    sku: staticProduct.id,
    specifications: [
      ...(staticProduct.materials ? [{ name: 'Material', value: staticProduct.materials }] : []),
      ...(staticProduct.dimensions ? [{ name: 'Dimensiones', value: `${staticProduct.dimensions} cm` }] : []),
      ...(staticProduct.color ? [{ name: 'Color', value: staticProduct.color }] : []),
      { name: 'Garantía', value: '6 meses por defectos de fabricación' },
      { name: 'Cuidado', value: 'Limpiar con paño suave y seco' }
    ],
    gallery: [{
      imageUrl: staticProduct.imageUrl,
      imageHint: staticProduct.name,
      isPrimary: true
    }],
    seo: {
      title: `${staticProduct.name} - Joyas JP`,
      description: `${staticProduct.category} ${staticProduct.name} en ${staticProduct.color || 'acabado premium'}. ${staticProduct.materials || 'Material de alta calidad'}. Compra online con envío gratis.`,
      keywords: [
        staticProduct.category,
        staticProduct.color?.toLowerCase(),
        staticProduct.materials?.toLowerCase(),
        'joyería',
        'accesorios',
        'joyas jp',
        'chile'
      ].filter(Boolean)
    }
  };
}

// Función para obtener productos relacionados (con fallback)
async function getRelated(productId: string, category: string) {
  try {
    // Intentar obtener de Supabase primero
    const related = await getRelatedProducts(productId, category, 4);
    if (related.length > 0) {
      return related;
    }
  } catch (error) {
    console.log('Error fetching related from Supabase, using static data:', error);
  }

  // Fallback a productos estáticos
  return products
    .filter(p => p.category === category && p.id !== productId && p.stock > 0)
    .slice(0, 4);
}

// Generar metadata dinámico
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Producto no encontrado - Joyas JP',
      description: 'El producto que buscas no existe.',
    };
  }

  return {
    title: product.seo?.title || `${product.name} - Joyas JP`,
    description: product.seo?.description || product.description,
    keywords: product.seo?.keywords?.join(', '),
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.imageUrl],
    },
  };
}

// Generar rutas estáticas para productos principales
export async function generateStaticParams() {
  // Generar para los primeros productos más populares
  const popularProductIds = [
    'PCD_1', 'PCD_2', 'PCD_3', 'PCD_4', 'PCD_5',
    'PCP_1', 'PCP_2', 'PCP_3', 'PCP_4', 'PCP_5',
    'PDD_1', 'PDD_2', 'PDD_3', 'PDD_4', 'PDD_5',
    'PPP_1', 'PPP_2', 'PPP_3', 'PAX_1', 'PAX_2'
  ];

  return popularProductIds.map((id) => ({
    id: id,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelated(params.id, product.category);

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
