"use client"; import { useState } from "react"; import { useCart } from "@/hooks/use-cart"; import { Product } from "@/lib/types"; import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface ProductDetailViewProps { 
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({ product }: ProductDetailViewProps) { 
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", { 
      style: "currency", 
      currency: "CLP", 
      minimumFractionDigits: 0, 
    }).format(price);
  };

  const handleAddToCart = () => { 
    addItem({ ...product, quantity }); 
    openCart(); 
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return ( 
    <div className="container mx-auto px-4 py-28">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="relative w-full aspect-square object-cover rounded-lg overflow-hidden">
          <Image 
            src={product.imageUrl} 
            alt={product.name} 
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
          <div className="flex items-center gap-4">
            <label className="font-semibold">Cantidad:</label>
            <div className="flex items-center border rounded-lg">
              <Button variant="ghost" size="icon" onClick={decrementQuantity}>
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={incrementQuantity}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button onClick={handleAddToCart} size="lg" className="w-full font-bold">
            Agregar al Carrito
          </Button>
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4">Especificaciones</h2>
            <div className="space-y-2 text-muted-foreground">
              {product.materials && <p><span className="font-semibold text-foreground">Material:</span> {product.materials}</p>}
              {product.dimensions && <p><span className="font-semibold text-foreground">Dimensiones:</span> {product.dimensions} cm</p>}
              {product.color && <p><span className="font-semibold text-foreground">Color:</span> {product.color}</p>}
            </div>
          </div>
        </div>
      </div>
    </div> 
  ); 
}