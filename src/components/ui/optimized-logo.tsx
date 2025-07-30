"use client";

import Image from 'next/image';
import { useState } from 'react';
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
  const [hasError, setHasError] = useState(false);
  
  // Mostrar fallback solo si hay error (con color más suave)
  if (hasError) {
    return (
      <div className={cn(
        'relative flex items-center justify-center',
        logoSizes[size],
        className
      )}>
        <div className={cn(
          'text-gray-600 font-bold select-none tracking-wider',
          size === 'hero' ? 'text-6xl' : 
          size === 'xl' ? 'text-5xl' :
          size === 'lg' ? 'text-4xl' : 
          size === 'md' ? 'text-2xl' : 'text-xl'
        )}>
          JP
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      'relative',
      logoSizes[size],
      className
    )}>
      <Image
        src="/assets/logo.webp"
        alt="Joyas JP - Alta joyería urbana"
        fill
        sizes={logoSizeValues[size]}
        className={cn(
          'object-contain',
          showDropShadow && 'drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]'
        )}
        priority={priority}
        unoptimized={false}
        quality={85}
        onLoad={() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Logo loaded successfully from /assets/logo.webp');
          }
        }}
        onError={(e) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Logo failed to load from /assets/logo.webp');
            console.error('Falling back to JP text');
          }
          setHasError(true);
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
    <OptimizedLogo 
      size="hero" 
      priority={true}
      showDropShadow={true}
      className={cn('mb-6 relative z-30', className)}
    />
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