"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useWishlist } from '@/hooks/use-wishlist';
import { Heart, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isItemInWishlist } = useWishlist();

  const isInWishlist = isItemInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast({
      title: "Producto añadido",
      description: `${product.name} ha sido añadido a tu carrito.`,
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="group relative border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <Link href={`/shop/${product.id}`} className="contents">
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="absolute top-2 right-2 z-10">
        <Button size="icon" variant="ghost" className="bg-white/70 hover:bg-white rounded-full" onClick={handleWishlistClick}>
          <Heart className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
        </Button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/shop/${product.id}`} legacyBehavior>
          <h3 className="text-lg font-semibold truncate cursor-pointer">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
        <div className="flex-grow" />
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xl font-bold text-primary">${product.price.toLocaleString('es-CL')}</p>
          <Button size="icon" onClick={handleAddToCart}>
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
