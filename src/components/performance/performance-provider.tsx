"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createPerformanceMonitor, PerformanceBudget } from '@/utils/performance-monitor';
import { PreloadProvider } from '@/hooks/use-route-preloader';

interface PerformanceContextValue {
  isOptimizedMode: boolean;
  performanceScore: number;
  enableAnimations: boolean;
  enablePreloading: boolean;
  enableServiceWorker: boolean;
  toggleOptimizedMode: () => void;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

interface PerformanceProviderProps {
  children: ReactNode;
  budget?: Partial<PerformanceBudget>;
  enableByDefault?: boolean;
}

export function PerformanceProvider({ 
  children, 
  budget,
  enableByDefault = true 
}: PerformanceProviderProps) {
  const [isOptimizedMode, setIsOptimizedMode] = useState(enableByDefault);
  const [performanceScore, setPerformanceScore] = useState(100);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [enablePreloading, setEnablePreloading] = useState(true);
  const [enableServiceWorker, setEnableServiceWorker] = useState(true);

  // Inicializar performance monitor
  useEffect(() => {
    if (!isOptimizedMode) return;

    const monitor = createPerformanceMonitor({
      maxPageSize: 2048, // 2MB
      maxImageSize: 500, // 500KB
      maxLCP: 2500,
      maxFID: 100,
      maxCLS: 0.1,
      ...budget
    });

    // Actualizar score cada 5 segundos
    const scoreInterval = setInterval(() => {
      const newScore = monitor.getScore();
      setPerformanceScore(newScore);
      
      // Auto-ajustar configuraciones basado en score
      if (newScore < 70) {
        setEnableAnimations(false);
        setEnablePreloading(false);
        console.warn('🚨 Performance degraded, disabling animations and preloading');
      } else if (newScore > 85) {
        setEnableAnimations(true);
        setEnablePreloading(true);
      }
    }, 5000);

    return () => {
      clearInterval(scoreInterval);
      monitor.destroy();
    };
  }, [isOptimizedMode, budget]);

  // Registrar Service Worker
  useEffect(() => {
    if (!enableServiceWorker || typeof window === 'undefined') return;

    if ('serviceWorker' in navigator && 'caches' in window) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ SW registered:', registration.scope);
          
          // Escuchar actualizaciones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New SW available, reloading...');
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('❌ SW registration failed:', error);
        });

      // Limpiar cache en desarrollo
      if (process.env.NODE_ENV === 'development') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        });
      }
    }
  }, [enableServiceWorker]);

  // Detectar conexión lenta y ajustar automáticamente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const connection = (navigator as any).connection;
    if (connection) {
      const handleConnectionChange = () => {
        const isSlowConnection = ['slow-2g', '2g', '3g'].includes(connection.effectiveType);
        
        if (isSlowConnection && isOptimizedMode) {
          setEnableAnimations(false);
          setEnablePreloading(false);
          console.log('📱 Slow connection detected, optimizing...');
        }
      };

      connection.addEventListener('change', handleConnectionChange);
      handleConnectionChange(); // Check initial state

      return () => {
        connection.removeEventListener('change', handleConnectionChange);
      };
    }
  }, [isOptimizedMode]);

  // Detectar memoria baja y ajustar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const memory = (navigator as any).deviceMemory;
    if (memory && memory <= 2) {
      console.log('💾 Low memory device detected, reducing features...');
      setEnableAnimations(false);
      setEnablePreloading(false);
    }
  }, []);

  const toggleOptimizedMode = () => {
    setIsOptimizedMode(!isOptimizedMode);
    
    // Mostrar notificación al usuario
    if (typeof window !== 'undefined') {
      const message = !isOptimizedMode 
        ? '🚀 Modo optimizado activado' 
        : '⚡ Modo normal activado';
      
      // Aquí podrías usar tu sistema de toast
      console.log(message);
    }
  };

  const value: PerformanceContextValue = {
    isOptimizedMode,
    performanceScore,
    enableAnimations,
    enablePreloading,
    enableServiceWorker,
    toggleOptimizedMode,
  };

  return (
    <PerformanceContext.Provider value={value}>
      <PreloadProvider>
        {children}
      </PreloadProvider>
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
}

// HOC para componentes que necesitan optimización
export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>
) {
  return function OptimizedComponent(props: P) {
    const { isOptimizedMode, enableAnimations } = usePerformance();

    // Aplicar optimizaciones globales
    useEffect(() => {
      if (typeof document === 'undefined') return;

      // Agregar clase CSS para optimizaciones
      document.documentElement.classList.toggle('performance-mode', isOptimizedMode);
      document.documentElement.classList.toggle('animations-enabled', enableAnimations);
    }, [isOptimizedMode, enableAnimations]);

    return <Component {...props} />;
  };
}

// Hook para métricas de rendimiento en tiempo real
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    networkRequests: 0,
    cacheHitRate: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return metrics;
}

// Componente de debug para mostrar métricas (solo en desarrollo)
export function PerformanceDebugger() {
  const { performanceScore, isOptimizedMode } = usePerformance();
  const metrics = usePerformanceMetrics();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>Score: {performanceScore}/100</div>
        <div>FPS: {metrics.fps}</div>
        <div>Memory: {Math.round(metrics.memoryUsage / 1024 / 1024)}MB</div>
        <div>Mode: {isOptimizedMode ? 'Optimized' : 'Normal'}</div>
      </div>
    </div>
  );
}