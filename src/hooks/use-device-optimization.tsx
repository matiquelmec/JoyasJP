"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';

// Tipos de dispositivos
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'unknown';
export type PerformanceLevel = 'low' | 'medium' | 'high';

interface DeviceInfo {
  type: DeviceType;
  width: number;
  height: number;
  pixelRatio: number;
  touch: boolean;
  orientation: 'portrait' | 'landscape';
}

interface ConnectionInfo {
  type: ConnectionType;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface PerformanceInfo {
  level: PerformanceLevel;
  memory: number;
  cores: number;
  batterySaver: boolean;
}

// Hook principal para optimización por dispositivo
export function useDeviceOptimization() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    width: 1200,
    height: 800,
    pixelRatio: 1,
    touch: false,
    orientation: 'landscape',
  });

  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    type: 'wifi',
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
  });

  const [performanceInfo, setPerformanceInfo] = useState<PerformanceInfo>({
    level: 'high',
    memory: 4,
    cores: 4,
    batterySaver: false,
  });

  // Detectar tipo de dispositivo
  const detectDeviceType = useCallback((width: number): DeviceType => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1440) return 'desktop';
    return 'large-desktop';
  }, []);

  // Detectar información de conexión
  const detectConnection = useCallback((): ConnectionInfo => {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

    if (!connection) {
      return {
        type: 'wifi',
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: false,
      };
    }

    const getConnectionType = (effectiveType: string): ConnectionType => {
      switch (effectiveType) {
        case 'slow-2g': return 'slow-2g';
        case '2g': return '2g';
        case '3g': return '3g';
        case '4g': return connection.type === 'wifi' ? 'wifi' : '4g';
        default: return 'unknown';
      }
    };

    return {
      type: getConnectionType(connection.effectiveType),
      effectiveType: connection.effectiveType,
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100,
      saveData: connection.saveData || false,
    };
  }, []);

  // Detectar capacidades de performance
  const detectPerformance = useCallback((): PerformanceInfo => {
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    
    // Estimar nivel de performance
    let level: PerformanceLevel = 'medium';
    if (memory >= 8 && cores >= 8) level = 'high';
    else if (memory <= 2 || cores <= 2) level = 'low';

    // Detectar battery saver (experimental)
    const battery = (navigator as any).getBattery?.();
    const batterySaver = battery?.charging === false && battery?.level < 0.2;

    return {
      level,
      memory,
      cores,
      batterySaver: batterySaver || false,
    };
  }, []);

  // Actualizar información del dispositivo
  const updateDeviceInfo = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    setDeviceInfo({
      type: detectDeviceType(width),
      width,
      height,
      pixelRatio: window.devicePixelRatio || 1,
      touch: 'ontouchstart' in window,
      orientation: width > height ? 'landscape' : 'portrait',
    });

    setConnectionInfo(detectConnection());
    setPerformanceInfo(detectPerformance());
  }, [detectDeviceType, detectConnection, detectPerformance]);

  // Effect para inicializar y escuchar cambios
  useEffect(() => {
    updateDeviceInfo();

    const handleResize = () => updateDeviceInfo();
    const handleOrientationChange = () => setTimeout(updateDeviceInfo, 100);
    const handleConnectionChange = () => setConnectionInfo(detectConnection());

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [updateDeviceInfo, detectConnection]);

  return {
    device: deviceInfo,
    connection: connectionInfo,
    performance: performanceInfo,
    updateDeviceInfo,
  };
}

// Hook para configuraciones optimizadas de imágenes
export function useImageOptimization() {
  const { device, connection, performance } = useDeviceOptimization();

  const imageConfig = useMemo(() => {
    const isSlowConnection = ['slow-2g', '2g', '3g'].includes(connection.type);
    const isLowPerformance = performance.level === 'low';
    const isMobile = device.type === 'mobile';
    const hasLowMemory = performance.memory <= 2;

    return {
      // Calidad de imagen basada en conexión y dispositivo
      quality: isSlowConnection || isLowPerformance ? 60 : 
               isMobile ? 75 : 85,
      
      // Formato preferido
      format: device.width < 768 ? 'webp' : 'webp',
      
      // Tamaños de imagen
      sizes: {
        thumbnail: isMobile ? 150 : 200,
        small: isMobile ? 300 : 400,
        medium: isMobile ? 500 : 800,
        large: isMobile ? 800 : 1200,
      },
      
      // Lazy loading configuration
      lazyLoading: {
        rootMargin: isSlowConnection ? '100px' : 
                   isMobile ? '200px' : '300px',
        threshold: 0.1,
        immediateLoad: isSlowConnection ? 2 : 
                      isMobile ? 4 : 8,
      },
      
      // Progressive loading
      progressive: {
        enabled: !isSlowConnection,
        lowQuality: 30,
        highQuality: isSlowConnection ? 70 : 85,
        delay: isSlowConnection ? 300 : 100,
      },
      
      // Preloading strategy
      preloading: {
        enabled: !isSlowConnection && !hasLowMemory,
        maxImages: isSlowConnection ? 3 : 
                  isMobile ? 6 : 12,
        priority: performance.level === 'high',
      },
    };
  }, [device, connection, performance]);

  return imageConfig;
}

// Hook para configuraciones de scroll virtual
export function useVirtualScrollOptimization() {
  const { device, performance } = useDeviceOptimization();

  const scrollConfig = useMemo(() => {
    const isLowPerformance = performance.level === 'low';
    const isMobile = device.type === 'mobile';

    return {
      // Número de elementos a renderizar
      overscan: isLowPerformance ? 2 : 
                isMobile ? 3 : 5,
      
      // Buffer de elementos
      bufferSize: isLowPerformance ? 5 : 
                  isMobile ? 10 : 15,
      
      // Debounce para scroll
      scrollDebounce: isLowPerformance ? 50 : 16,
      
      // Usar requestAnimationFrame
      useRAF: performance.level !== 'low',
      
      // Columnas en grid
      columns: device.type === 'mobile' ? 1 :
               device.type === 'tablet' ? 2 :
               device.width < 1280 ? 3 : 4,
      
      // Altura de items
      itemHeight: isMobile ? 400 : 450,
      
      // Gap entre items
      gap: isMobile ? 12 : 16,
    };
  }, [device, performance]);

  return scrollConfig;
}

// Hook para optimizaciones de red
export function useNetworkOptimization() {
  const { connection } = useDeviceOptimization();

  const networkConfig = useMemo(() => {
    const isSlowConnection = ['slow-2g', '2g', '3g'].includes(connection.type);
    const isFastConnection = connection.type === 'wifi' || connection.downlink > 5;

    return {
      // Número máximo de requests simultáneos
      maxConcurrentRequests: isSlowConnection ? 2 : 
                            isFastConnection ? 6 : 4,
      
      // Timeout para requests
      requestTimeout: isSlowConnection ? 10000 : 5000,
      
      // Retry strategy
      retries: isSlowConnection ? 1 : 2,
      retryDelay: isSlowConnection ? 2000 : 1000,
      
      // Preloading behavior
      aggressivePreload: isFastConnection && !connection.saveData,
      
      // Compression
      acceptCompression: true,
      preferWebP: true,
      
      // Cache strategy
      cacheFirst: isSlowConnection,
      staleWhileRevalidate: isFastConnection,
    };
  }, [connection]);

  return networkConfig;
}

// Hook para animaciones optimizadas
export function useAnimationOptimization() {
  const { device, performance } = useDeviceOptimization();

  const animationConfig = useMemo(() => {
    const isLowPerformance = performance.level === 'low';
    const hasHighRefreshRate = device.width > 1200;

    return {
      // Habilitar animaciones
      enabled: !isLowPerformance,
      
      // Reduced motion preference
      respectReducedMotion: true,
      
      // Duración de animaciones
      duration: isLowPerformance ? 150 : 
                hasHighRefreshRate ? 300 : 250,
      
      // Easing functions
      easing: isLowPerformance ? 'ease' : 'ease-out',
      
      // Transform over position
      useTransform: true,
      
      // Will-change optimization
      useWillChange: performance.level === 'high',
      
      // Frame rate target
      targetFPS: isLowPerformance ? 30 : 60,
    };
  }, [device, performance]);

  return animationConfig;
}

// Hook para configuración de componentes
export function useComponentOptimization() {
  const { device, performance, connection } = useDeviceOptimization();

  return useMemo(() => {
    const isLowEnd = performance.level === 'low' || 
                    ['slow-2g', '2g'].includes(connection.type);
    
    return {
      // Virtual scrolling threshold
      virtualScrollThreshold: isLowEnd ? 20 : 50,
      
      // Lazy component loading
      lazyComponents: device.type === 'mobile' || isLowEnd,
      
      // Image optimization
      optimizeImages: true,
      
      // Skeleton loading
      showSkeletons: !isLowEnd,
      
      // Progressive enhancement
      progressiveEnhancement: true,
      
      // Bundle splitting
      codeSplitting: device.type !== 'mobile' || performance.level === 'high',
    };
  }, [device, performance, connection]);
}