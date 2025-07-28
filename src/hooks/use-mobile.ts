import { useEffect, useState } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function checkMobile() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsLoading(false);
    }

    // Check inicial
    checkMobile();

    // Listener para cambios de tamaño
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, isLoading };
}

// Hook para detección avanzada de móvil - Arreglado para SSR
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [connectionType, setConnectionType] = useState<'slow' | 'fast'>('fast');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    function detectDevice() {
      if (typeof window === 'undefined') return;
      
      const width = window.innerWidth;
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }

      // Detectar tipo de conexión si está disponible (solo en cliente)
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        const slowConnections = ['slow-2g', '2g', '3g'];
        
        if (connection && slowConnections.includes(connection.effectiveType)) {
          setConnectionType('slow');
        } else {
          setConnectionType('fast');
        }
      }
    }

    detectDevice();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', detectDevice);
      return () => window.removeEventListener('resize', detectDevice);
    }
  }, []);

  return { deviceType, connectionType, isClient };
}