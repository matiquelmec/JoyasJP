// Enterprise Loading System - Centralized & Clean
// Consolida todos los skeleton loaders en un componente reutilizable

import { cn } from '@/lib/utils';

interface EnterpriseLoadingProps {
  variant: 'product' | 'card' | 'list' | 'hero' | 'related';
  count?: number;
  className?: string;
  message?: string;
  showSpinner?: boolean;
}

// Configuración centralizada con paleta de marca (Rojo Terciopelo + Plata Líquida)
const LOADING_VARIANTS = {
  product: {
    containerClass: 'aspect-square bg-background relative overflow-hidden border border-border/20',
    message: 'Cargando...',
    spinnerSize: 'w-8 h-8',
    showSkeleton: true
  },
  card: {
    containerClass: 'aspect-square bg-background relative overflow-hidden border border-border/20',
    message: 'Cargando productos...',
    spinnerSize: 'w-6 h-6',
    showSkeleton: false
  },
  list: {
    containerClass: 'h-20 bg-background relative overflow-hidden rounded-lg border border-border/20',
    message: 'Cargando lista...',
    spinnerSize: 'w-5 h-5',
    showSkeleton: false
  },
  hero: {
    containerClass: 'h-96 bg-background relative overflow-hidden rounded-lg border border-border/20',
    message: 'Cargando contenido...',
    spinnerSize: 'w-10 h-10',
    showSkeleton: false
  },
  related: {
    containerClass: 'aspect-square bg-background relative overflow-hidden border border-border/20',
    message: 'Producto relacionado...',
    spinnerSize: 'w-5 h-5',
    showSkeleton: false
  }
} as const;

/**
 * Enterprise Loading Component
 * Uso: <EnterpriseLoading variant="product" count={6} />
 */
export function EnterpriseLoading({ 
  variant, 
  count = 1, 
  className,
  message,
  showSpinner = true 
}: EnterpriseLoadingProps) {
  const config = LOADING_VARIANTS[variant];
  const displayMessage = message || config.message;

  if (count === 1) {
    return (
      <div className={cn(config.containerClass, className)}>
        <LoadingContent 
          config={config}
          message={displayMessage}
          showSpinner={showSpinner}
        />
      </div>
    );
  }

  // Para múltiples elementos (grids)
  return (
    <div className={cn('grid gap-6', className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={config.containerClass}>
          <LoadingContent 
            config={config}
            message={displayMessage}
            showSpinner={showSpinner}
            delay={i * 200} // Staggered animation
          />
        </div>
      ))}
    </div>
  );
}

// Componente interno para el contenido de loading
function LoadingContent({ 
  config, 
  message, 
  showSpinner,
  delay = 0
}: {
  config: typeof LOADING_VARIANTS[keyof typeof LOADING_VARIANTS];
  message: string;
  showSpinner: boolean;
  delay?: number;
}) {
  return (
    <>
      {/* Shimmer base con colores de marca */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-background via-muted to-background animate-pulse"
        style={{ willChange: 'opacity' }}
      />
      
      {/* Shimmer overlay con accent (Plata Líquida) */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent"
        style={{ 
          animation: `shimmer 2s infinite`,
          animationDelay: `${delay}ms`,
          willChange: 'transform'
        }}
      />
      
      {/* Loading content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center space-y-3"
        role="status"
        aria-busy="true"
        aria-label={message}
      >
        {showSpinner && (
          <div 
            className={cn(
              config.spinnerSize,
              'border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin'
            )}
            aria-hidden="true"
          />
        )}
        
        <div className="text-muted-foreground text-sm font-medium text-center px-2">
          {message}
        </div>
        
        {config.showSkeleton && (
          <div className="space-y-2 w-20">
            <div 
              className="h-2 bg-accent/30 rounded animate-pulse"
              style={{ animationDelay: `${delay + 100}ms` }}
            />
            <div 
              className="h-2 bg-accent/20 rounded animate-pulse"
              style={{ animationDelay: `${delay + 200}ms` }}
            />
          </div>
        )}
      </div>
    </>
  );
}

// Variantes específicas como componentes wrapper
export function ProductLoadingSkeleton({ 
  count = 1, 
  className 
}: { 
  count?: number; 
  className?: string;
}) {
  return (
    <EnterpriseLoading 
      variant="product" 
      count={count} 
      className={className}
    />
  );
}

export function CardLoadingSkeleton({ 
  count = 1, 
  className 
}: { 
  count?: number; 
  className?: string;
}) {
  return (
    <EnterpriseLoading 
      variant="card" 
      count={count} 
      className={className}
    />
  );
}

export function RelatedProductsLoadingSkeleton({ 
  count = 4, 
  className 
}: { 
  count?: number; 
  className?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Title skeleton con colores de marca */}
      <div className="h-8 bg-accent/30 rounded-lg w-64 animate-pulse" />
      
      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnterpriseLoading 
          variant="related" 
          count={count} 
          className="border rounded-lg overflow-hidden shadow-sm"
        />
      </div>
    </div>
  );
}

// Estados de loading para casos específicos con paleta de marca
export function LazyLoadingPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 bg-background border border-border/20 flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-3 opacity-60">
        <div className="w-6 h-6 border border-accent/50 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" />
        </div>
        <div className="text-muted-foreground text-xs font-medium">
          Esperando...
        </div>
      </div>
    </div>
  );
}

export function ErrorPlaceholder({ 
  error, 
  imageUrl, 
  className 
}: { 
  error: string;
  imageUrl?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      'flex items-center justify-center h-full bg-gradient-to-br from-background via-muted/30 to-background border-2 border-destructive/20',
      className
    )}>
      <div className="flex flex-col items-center space-y-3 opacity-70 p-4 text-center">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center border border-destructive/20">
          <span className="text-destructive text-xl" aria-hidden="true">⚠️</span>
        </div>
        <div className="text-xs text-destructive font-medium">
          Error al cargar imagen
        </div>
        {imageUrl && (
          <div className="text-xs text-muted-foreground break-all max-w-full">
            URL: {imageUrl}
          </div>
        )}
      </div>
    </div>
  );
}