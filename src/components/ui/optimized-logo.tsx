"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  priority?: boolean;
  showDropShadow?: boolean;
}

const logoSizes = {
  sm: 'w-16 h-16',          // 64px - Para product cards, placeholders pequeños
  md: 'w-20 h-20',          // 80px - Para admin login, elementos medianos
  lg: 'w-28 h-28 md:w-32 md:h-32',  // 112px/128px - Para header
  xl: 'w-40 h-40',          // 160px - Para páginas especiales
  hero: 'w-80 h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px]' // Hero section
};

const logoSizeValues = {
  sm: '(max-width: 768px) 64px, 64px',
  md: '(max-width: 768px) 80px, 80px',
  lg: '(max-width: 768px) 112px, 128px',
  xl: '(max-width: 768px) 160px, 160px',
  hero: '(max-width: 768px) 320px, (max-width: 1024px) 384px, 450px'
};

export function OptimizedLogo({ 
  size = 'md', 
  className,
  priority = false,
  showDropShadow = false
}: OptimizedLogoProps) {
  
  return (
    <div className={cn(
      'relative',
      logoSizes[size],
      className
    )}>
      <Image
        src="/assets/logo.webp"
        alt="Joyas JP Logo"
        fill
        sizes={logoSizeValues[size]}
        className={cn(
          'object-contain',
          showDropShadow && 'drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]'
        )}
        priority={priority}
        quality={95}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => {
          console.log('Logo loaded successfully');
        }}
        onError={(e) => {
          console.error('Error loading logo WebP, trying fallback');
          const target = e.target as HTMLImageElement;
          // Try with different format first
          if (target.src.includes('.webp')) {
            target.src = '/assets/logo.webp?' + Date.now(); // Cache bust
          } else {
            // Ultimate fallback - hide image and show text
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-primary font-bold text-4xl select-none">JP</div>';
            }
          }
        }}
      />
    </div>
  );
}

// Variantes específicas para casos comunes
export function HeaderLogo({ className }: { className?: string }) {
  return (
    <OptimizedLogo 
      size="lg" 
      priority={true}
      className={className}
    />
  );
}

export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('mb-6 relative z-30', className)}>
      <OptimizedLogo 
        size="hero" 
        priority={true}
        showDropShadow={true}
      />
      {/* Fallback visible si el logo no carga */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-6xl md:text-8xl font-bold text-primary opacity-20 select-none">
          JP
        </div>
      </div>
    </div>
  );
}

export function AdminLogo({ className }: { className?: string }) {
  return (
    <OptimizedLogo 
      size="md" 
      priority={true}
      className={cn('mx-auto', className)}
    />
  );
}

export function ProductCardLogo({ className }: { className?: string }) {
  return (
    <OptimizedLogo 
      size="sm" 
      className={className}
    />
  );
}