"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function AddToCartButton({
  product,
  className,
  size = "default",
  variant = "default"
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    if (isAdding || justAdded) return;

    setIsAdding(true);

    try {
      addItem(product);

      toast({
        title: "¡Producto añadido! 🎉",
        description: `${product.name} se ha agregado a tu carrito.`,
        duration: 3000,
      });

      setJustAdded(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setJustAdded(false);
      }, 2000);

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || justAdded}
      className={cn(className)}
      size={size}
      variant={variant}
    >
      {isAdding ? (
        <>
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Agregando...
        </>
      ) : justAdded ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          ¡Agregado!
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          Agregar al carrito
        </>
      )}
    </Button>
  );
}
