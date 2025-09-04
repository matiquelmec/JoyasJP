import { cn } from '@/lib/utils'

interface ProductCardSkeletonProps {
  className?: string
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        'group relative border rounded-lg overflow-hidden shadow-sm flex flex-col h-full bg-card animate-pulse',
        className
      )}
    >
      {/* Image skeleton */}
      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-5 flex flex-col flex-grow space-y-4">
        {/* Title skeleton */}
        <div className="h-6 bg-muted rounded-md w-3/4" />

        {/* Badge skeleton */}
        <div className="h-6 bg-muted rounded-full w-24" />

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>

        <div className="flex-grow" />

        {/* Price and button skeleton */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
          <div className="h-8 bg-muted rounded w-20" />
          <div className="h-10 w-10 bg-muted rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default ProductCardSkeleton