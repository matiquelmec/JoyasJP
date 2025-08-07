'use client'

import { motion } from 'framer-motion'

interface ProductSkeletonProps {
  count?: number
  className?: string
}

export function ProductSkeleton({ count = 1, className = '' }: ProductSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {/* Image skeleton with jewelry theme */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
            {/* Animated shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
              animate={{ x: [-100, 400] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear",
                delay: i * 0.2 
              }}
            />
            
            {/* Subtle jewelry pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="w-16 h-16 border-4 border-yellow-400/30 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 border-2 border-yellow-500/20 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>

            {/* Floating sparkles */}
            {[...Array(3)].map((_, sparkleIndex) => (
              <motion.div
                key={sparkleIndex}
                className="absolute w-2 h-2 bg-yellow-400/40 rounded-full"
                style={{
                  left: `${20 + sparkleIndex * 30}%`,
                  top: `${30 + sparkleIndex * 15}%`,
                }}
                animate={{ 
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 0.8, 0.3] 
                }}
                transition={{ 
                  duration: 2 + sparkleIndex,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="p-6">
            {/* Title skeleton */}
            <div className="mb-3">
              <motion.div 
                className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Price skeleton */}
            <div className="mb-4">
              <motion.div 
                className="h-5 w-24 bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 rounded-md"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Buttons skeleton */}
            <div className="flex gap-2">
              <motion.div 
                className="flex-1 h-10 bg-gradient-to-r from-gray-200 via-gray-150 to-gray-200 rounded-md"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-150 to-gray-200 rounded-md"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
            </div>
          </div>

          {/* Hover effect skeleton */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={{ opacity: [0, 0.1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      ))}
    </div>
  )
}

// Compact skeleton for grid views
export function ProductSkeletonCompact({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="bg-white rounded-lg overflow-hidden shadow-md"
        >
          <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
              animate={{ x: [-50, 200] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.1 }}
            />
          </div>
          <div className="p-3">
            <motion.div 
              className="h-4 bg-gray-200 rounded mb-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <motion.div 
              className="h-3 w-16 bg-yellow-100 rounded"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}