import { Suspense } from 'react'
import { ProductService } from '@/services/product.service'
import { ShopClient } from '@/components/shop/shop-client'
import { productConfig } from '@/lib/config'

export const revalidate = 60 // Revalidación ISR de 60s + purga en 0ms vía revalidatePath

export default async function ShopPage() {
  // Fetch data directly on the server
  const [fetchedProducts, fetchedColors] = await Promise.all([
    ProductService.getAllProducts(),
    ProductService.getAvailableColors(),
  ])

  // Filtrado básico de seguridad/limpieza
  const validProducts = fetchedProducts.filter(product =>
    product.name &&
    product.name.toLowerCase() !== 'prueba' &&
    product.price > 0
  );

  const colors = ['all', ...productConfig.colors]

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ShopClient initialProducts={validProducts} initialColors={colors} />
    </Suspense>
  )
}
