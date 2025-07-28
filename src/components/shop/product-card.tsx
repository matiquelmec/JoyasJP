"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useWishlist } from '@/hooks/use-wishlist';
import { Heart, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

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
    setImageLoading(false);
  };

  const handleImageError = () => {
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
          {/* Placeholder elegante con logo y efecto shimmer */}
          {imageLoading && isIntersecting && (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-amber-50/80 overflow-hidden">
              {/* Efecto shimmer dorado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent animate-shimmer" />
              {/* Logo centrado con opacidad suave */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/assets/logo.webp"
                  alt="Joyas JP Logo"
                  width={60}
                  height={60}
                  className="opacity-20 animate-pulse"
                  priority
                />
              </div>
              {/* Overlay sutil para mejor transición */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-white/5" />
            </div>
          )}

          {/* Placeholder cuando no está en viewport */}
          {!isIntersecting && (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-white/80 to-amber-50/50 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-2 opacity-30">
                <Image
                  src="/assets/logo.webp"
                  alt="Joyas JP Logo"
                  width={40}
                  height={40}
                  className="opacity-60"
                  priority
                />
                <Sparkles className="w-6 h-6 text-amber-600/60" />
              </div>
            </div>
          )}

          {!imageError && isIntersecting ? (
            <Image
              src={product.imageUrl}
              alt={`${product.name} - Joya urbana premium de Joyas JP`}
              fill
              sizes="(max-width: 480px) 50vw, (max-width: 640px) 45vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-transform duration-300 group-hover:scale-105",
                imageLoading ? "scale-105 blur-sm opacity-0" : "scale-100 blur-0 opacity-100"
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={priority || (typeof window !== 'undefined' && window.innerWidth < 768 ? index < 3 : index < 6)}
              loading={priority || (typeof window !== 'undefined' && window.innerWidth < 768 ? index < 3 : index < 6) ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          ) : isIntersecting && imageError ? (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-50/50 via-white/80 to-amber-50/50">
              <div className="flex flex-col items-center space-y-3 opacity-50">
                <Image
                  src="/assets/logo.webp"
                  alt="Joyas JP Logo"
                  width={48}
                  height={48}
                  className="opacity-60"
                  priority
                />
                <div className="text-xs text-amber-600/60 text-center">
                  Imagen no disponible
                </div>
              </div>
            </div>
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
