import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="text-3xl md:text-4xl font-semibold mt-4 mb-2">Página No Encontrada</h2>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        Lo sentimos, no pudimos encontrar la página que buscas. Es posible que se haya movido o eliminado.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button size="lg">
            Volver al Inicio
          </Button>
        </Link>
        <Link href="/shop">
          <Button size="lg" variant="outline">
            Ir a la Tienda
          </Button>
        </Link>
        <Link href="/services">
          <Button size="lg" variant="outline">
            Nuestros Servicios
          </Button>
        </Link>
      </div>
    </div>
  );
}
