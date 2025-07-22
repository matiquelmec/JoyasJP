
"use client";

import { useCart } from '@/hooks/use-cart';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
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
    <Button onClick={handleAddToCart} className="w-full">
      Añadir al Carrito
    </Button>
  );
}
