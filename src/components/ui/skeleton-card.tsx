import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <article
      className={cn(
        'border rounded-lg overflow-hidden shadow-sm bg-card flex flex-col h-full',
        className
      )}
    >
      {/* Image skeleton */}
      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-5 flex flex-col flex-grow space-y-4">
        {/* Title skeleton */}
        <div className="h-7 bg-zinc-800 rounded animate-pulse" />
        
        {/* Category skeleton */}
        <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse" />
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-zinc-800 rounded animate-pulse" />
          <div className="h-3 bg-zinc-800 rounded w-4/5 animate-pulse" />
        </div>

        <div className="flex-grow" />

        {/* Price and button skeleton */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
          <div className="h-8 bg-zinc-800 rounded w-1/2 animate-pulse" />
          <div className="h-10 w-10 bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
    </article>
  )
}

interface SkeletonGridProps {
  count?: number
  className?: string
}

export function SkeletonGrid({ count = 8, className }: SkeletonGridProps) {
  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}