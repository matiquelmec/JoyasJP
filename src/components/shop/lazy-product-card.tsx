'use client'

import { memo } from 'react'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import ProductCard from './product-card'
import ProductCardSkeleton from './product-card-skeleton'
import type { Product } from '@/lib/types'

interface LazyProductCardProps {
  product: Product
  priority?: boolean
  className?: string
}

const LazyProductCard = memo(function LazyProductCard({
  product,
  priority = false,
  className,
}: LazyProductCardProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px', // Cargar cuando esté a 100px de ser visible
    triggerOnce: true,
  })

  // Si tiene priority, renderizar inmediatamente
  if (priority) {
    return (
      <ProductCard
        product={product}
        priority={priority}
        className={className}
      />
    )
  }

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? (
        <ProductCard
          product={product}
          priority={false}
          className={className}
        />
      ) : (
        <ProductCardSkeleton className={className} />
      )}
    </div>
  )
})

export default LazyProductCard