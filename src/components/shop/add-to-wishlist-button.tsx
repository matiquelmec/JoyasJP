"use client";

import { useState, useEffect } from 'react';
import { useWishlist } from '@/hooks/use-wishlist';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToWishlistButtonProps {
  product: Product;
  className?: string;
}

export function AddToWishlistButton({ product, className }: AddToWishlistButtonProps) {
  const { addItem, removeItem, isItemInWishlist } = useWishlist();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Evita el parpadeo en la carga inicial (hydration mismatch)
  // y muestra un ícono deshabilitado mientras se determina el estado.
  if (!isClient) {
    return (
      <Button
        size="icon"
        variant="ghost"
        disabled
        className={cn("bg-white/90 rounded-full shadow-sm", className)}
        aria-label="Cargando estado de favoritos"
      >
        <Heart className="w-5 h-5 text-gray-400" />
      </Button>
    );
  }

  const isInWishlist = isItemInWishlist(product.id);

  const handleWishlistClick = () => {
    try {
      if (isInWishlist) {
        removeItem(product.id);
        toast({
          title: "Eliminado de favoritos",
          description: `${product.name} se eliminó de tus favoritos.`,
        });
      } else {
        addItem(product);
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

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        "bg-white/90 hover:bg-white rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110",
        className
      )}
      onClick={handleWishlistClick}
      aria-label={isInWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-all duration-200",
          isInWishlist
            ? 'text-red-500'
            : 'text-gray-600 hover:text-red-500'
        )}
        fill={isInWishlist ? 'currentColor' : 'none'}
      />
    </Button>
  );
}