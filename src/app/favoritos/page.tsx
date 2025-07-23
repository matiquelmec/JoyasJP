"use client";

import { useWishlist } from "@/hooks/use-wishlist";
import ProductCard from "@/components/shop/product-card";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div className="container mx-auto px-4 py-20 md:py-28">
      <h1 className="text-4xl font-headline text-center font-bold mb-12">Tu Lista de Deseos</h1>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 text-2xl font-semibold">Tu lista de deseos está vacía</h2>
          <p className="mt-2 text-muted-foreground">Explora nuestros productos y guarda tus favoritos para más tarde.</p>
          <div className="mt-6">
            <Link href="/shop">
              <Button size="lg">Descubrir Productos</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
