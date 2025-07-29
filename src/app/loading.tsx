import { EnterpriseLoading } from '@/components/ui/enterprise-loading';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="max-w-md w-full space-y-8">
        {/* Hero loading con branding */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-primary">Joyas JP</h2>
          <p className="text-muted-foreground">Cargando piezas destacadas...</p>
        </div>
        
        {/* Enterprise loading component */}
        <EnterpriseLoading 
          variant="hero" 
          message="Preparando tu experiencia de alta joyería..." 
          showSpinner={true}
          className="rounded-lg shadow-lg"
        />
        
        {/* Loading grid simulando productos */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <EnterpriseLoading 
            variant="product" 
            count={4}
            message="Cargando productos..."
            className="grid grid-cols-2 gap-4"
          />
        </div>
      </div>
    </div>
  );
}
