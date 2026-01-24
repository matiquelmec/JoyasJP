import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PendingPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-center">
      <div className="max-w-md mx-auto">
        <AlertTriangle className="w-24 h-24 text-yellow-500 mx-auto" />
        <h1 className="mt-6 text-4xl font-headline font-bold">
          Pago Pendiente
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tu pago está pendiente de aprobación. Te notificaremos por email una
          vez que se complete el proceso.
        </p>
        <Button asChild className="mt-8">
          <Link href="/productos">Volver a la Tienda</Link>
        </Button>
      </div>
    </div>
  )
}
