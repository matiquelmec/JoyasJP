"use client";

import { useCart } from '@/hooks/use-cart';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

import { ButtonProps } from '@/components/ui/button';

interface AddToCartButtonProps extends ButtonProps {
  product: Product;
}

export function AddToCartButton({ product, className, size }: AddToCartButtonProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Agregado al carrito",
      description: `${product.name} ha sido añadido a tu carrito.`,
      variant: "default",
    });
  };

  return (
    <Button onClick={handleAddToCart} className={className} size={size}>
      Añadir al Carrito
    </Button>
  );
}