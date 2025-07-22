import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-center">
      <div className="max-w-md mx-auto">
        <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto" />
        <h1 className="mt-6 text-4xl font-headline font-bold">¡Pago Exitoso!</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Gracias por tu compra. Hemos recibido tu pago y estamos preparando tu pedido. Recibirás una confirmación por email en breve.
        </p>
        <Button asChild className="mt-8">
          <Link href="/shop">
            Seguir Comprando
          </Link>
        </Button>
      </div>
    </div>
  );
}
