"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useWishlist } from '@/hooks/use-wishlist';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LazyLoadingPlaceholder, ErrorPlaceholder } from '@/components/ui/enterprise-loading';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
  index?: number;
}

export default function ProductCard({ product, priority = false, className, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isItemInWishlist } = useWishlist();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(index < 12); // Cargar primeras 12 inmediatamente
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Intersection Observer para lazy loading
  useEffect(() => {
    // Detectar si es móvil para optimizaciones específicas
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // En móvil cargar inmediatamente 6 productos (vs 12 en desktop)
    const immediateLoadLimit = isMobile ? 6 : 12;
    
    if (index < immediateLoadLimit) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { 
        // RootMargin más agresivo para precargar antes
        rootMargin: isMobile ? '400px' : '300px',
        // Threshold más bajo para cargar antes
        threshold: 0.01
      }
    );

    const cardElement = document.getElementById(`product-card-${product.id}`);
    if (cardElement) {
      observer.observe(cardElement);
    }

    return () => observer.disconnect();
  }, [index, product.id]);

  const isInWishlist = isClient && isItemInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      addItem(product);
      toast({
        title: "¡Producto añadido! 🎉",
        description: `${product.name} se ha agregado a tu carrito.`,
        duration: 3000,
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isInWishlist) {
        removeFromWishlist(product.id);
        toast({
          title: "Eliminado de favoritos",
          description: `${product.name} se eliminó de tus favoritos.`,
        });
      } else {
        addToWishlist(product);
        toast({
          title: "¡Añadido a favoritos! ❤️",
          description: `${product.name} se agregó a tus favoritos.`,
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar favoritos. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleImageLoad = () => {
    console.log(`Image loaded for product: ${product.name}, URL: ${product.imageUrl}`);
    setImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Image failed to load for product: ${product.name}, URL: ${product.imageUrl}`, e);
    setImageLoading(false);
    setImageError(true);
  };

  // Precio formateado
  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <article
      id={`product-card-${product.id}`}
      className={cn(
        "group relative border rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col h-full bg-card hover:-translate-y-1",
        className
      )}
    >
      <Link
        href={`/productos/${product.id}`}
        className="contents"
        aria-label={`Ver detalles de ${product.name}`}
      >
        <div className="relative w-full aspect-square overflow-hidden bg-muted/30">
          {/* Enterprise loading state con paleta de marca */}
          {imageLoading && isIntersecting && (
            <div className="absolute inset-0 bg-background overflow-hidden border border-border/20">
              <div className="absolute inset-0 bg-gradient-to-r from-background via-muted to-background animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent animate-shimmer" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3" role="status" aria-busy="true" aria-label="Cargando producto">
                <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" aria-hidden="true" />
                <div className="text-muted-foreground text-sm font-medium">Cargando...</div>
                <div className="space-y-2 w-20">
                  <div className="h-2 bg-accent/30 rounded animate-pulse" />
                  <div className="h-2 bg-accent/20 rounded animate-pulse delay-100" />
                </div>
              </div>
            </div>
          )}

          {/* Lazy loading placeholder */}
          {!isIntersecting && <LazyLoadingPlaceholder />}

          {!imageError && isIntersecting ? (
            <Image
              src={product.imageUrl}
              alt={`${product.name} - Joya urbana premium de Joyas JP`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={cn(
                "object-cover transition-transform duration-300 group-hover:scale-105",
                imageLoading ? "scale-105" : "scale-100"
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={priority || (typeof window !== 'undefined' && window.innerWidth < 768 ? index < 3 : index < 6)}
              loading={priority || (typeof window !== 'undefined' && window.innerWidth < 768 ? index < 3 : index < 6) ? "eager" : "lazy"}
            />
          ) : isIntersecting && imageError ? (
            <ErrorPlaceholder 
              error="Error al cargar imagen" 
              imageUrl={product.imageUrl}
            />
          ) : null}

          {isIntersecting && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-200 flex items-center justify-center">
              <Button
                size="sm"
                variant="secondary"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalles
              </Button>
            </div>
          )}
        </div>
      </Link>

      <div className="absolute top-2 right-2 z-20">
        <Button
          size="icon"
          variant="ghost"
          className="bg-white/90 hover:bg-white rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-105"
          onClick={handleWishlistClick}
          aria-label={isInWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors duration-200",
              isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600 hover:text-red-400'
            )}
          />
        </Button>
      </div>

      <div className="p-4 flex flex-col flex-grow space-y-3">
        <Link href={`/productos/${product.id}`}>
          <h3 className="text-lg font-semibold truncate cursor-pointer hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {(product.materials || product.color) && (
          <div className="text-sm text-muted-foreground">
            {product.materials && <span>{product.materials}</span>}
            {product.materials && product.color && <span> • </span>}
            {product.color && <span>{product.color}</span>}
          </div>
        )}

        

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex-grow" />

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-primary">
              {formattedPrice}
            </p>
          </div>

          <Button
            size="icon"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="transition-all duration-200 hover:scale-105 shadow-sm"
            aria-label={`Añadir ${product.name} al carrito`}
          >
            {isAddingToCart ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
