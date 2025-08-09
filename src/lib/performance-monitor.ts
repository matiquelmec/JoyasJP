/**
 * 🚀 Sistema de Monitoreo de Performance Permanente
 * 
 * Este sistema te ayuda a mantener el rendimiento alto SIEMPRE:
 * 1. Monitoreo automático en cada deploy
 * 2. Alertas cuando el performance baja
 * 3. Métricas en tiempo real
 * 4. Recomendaciones automáticas
 */

export interface PerformanceAlert {
  type: 'warning' | 'error' | 'info'
  metric: string
  value: number
  threshold: number
  message: string
  recommendations: string[]
  timestamp: number
}

export interface PerformanceThresholds {
  score: { warning: number; critical: number }
  lcp: { warning: number; critical: number }
  fid: { warning: number; critical: number }
  cls: { warning: number; critical: number }
  tbt: { warning: number; critical: number }
}

// 🎯 Thresholds para alertas automáticas
export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  score: { warning: 70, critical: 50 },
  lcp: { warning: 2.5, critical: 4.0 },
  fid: { warning: 100, critical: 300 },
  cls: { warning: 0.1, critical: 0.25 },
  tbt: { warning: 200, critical: 500 }
}

export class PerformanceMonitor {
  private static alerts: PerformanceAlert[] = []
  
  /**
   * 🔍 Analizar métricas y generar alertas
   */
  static analyzeMetrics(metrics: any): PerformanceAlert[] {
    const newAlerts: PerformanceAlert[] = []
    
    // Score general
    if (metrics.score < PERFORMANCE_THRESHOLDS.score.critical) {
      newAlerts.push({
        type: 'error',
        metric: 'Performance Score',
        value: metrics.score,
        threshold: PERFORMANCE_THRESHOLDS.score.critical,
        message: `Score crítico: ${metrics.score}. ¡Acción inmediata requerida!`,
        recommendations: [
          'Optimizar imágenes más grandes',
          'Reducir JavaScript no utilizado',
          'Implementar lazy loading',
          'Revisar CDN configuration'
        ],
        timestamp: Date.now()
      })
    } else if (metrics.score < PERFORMANCE_THRESHOLDS.score.warning) {
      newAlerts.push({
        type: 'warning',
        metric: 'Performance Score',
        value: metrics.score,
        threshold: PERFORMANCE_THRESHOLDS.score.warning,
        message: `Score bajo: ${metrics.score}. Considera optimizar.`,
        recommendations: [
          'Comprimir imágenes',
          'Minificar CSS/JS',
          'Revisar requests innecesarios'
        ],
        timestamp: Date.now()
      })
    }
    
    // LCP (Largest Contentful Paint)
    if (metrics.lcp > PERFORMANCE_THRESHOLDS.lcp.critical) {
      newAlerts.push({
        type: 'error',
        metric: 'LCP',
        value: metrics.lcp,
        threshold: PERFORMANCE_THRESHOLDS.lcp.critical,
        message: `LCP muy lento: ${metrics.lcp.toFixed(1)}s`,
        recommendations: [
          'Optimizar imagen hero principal',
          'Usar preload para recursos críticos',
          'Reducir tiempo de servidor',
          'Comprimir imágenes above-the-fold'
        ],
        timestamp: Date.now()
      })
    } else if (metrics.lcp > PERFORMANCE_THRESHOLDS.lcp.warning) {
      newAlerts.push({
        type: 'warning',
        metric: 'LCP',
        value: metrics.lcp,
        threshold: PERFORMANCE_THRESHOLDS.lcp.warning,
        message: `LCP mejorable: ${metrics.lcp.toFixed(1)}s`,
        recommendations: [
          'Optimizar imágenes principales',
          'Revisar lazy loading configuration'
        ],
        timestamp: Date.now()
      })
    }
    
    // TBT (Total Blocking Time)
    if (metrics.tbt > PERFORMANCE_THRESHOLDS.tbt.critical) {
      newAlerts.push({
        type: 'error',
        metric: 'TBT',
        value: metrics.tbt,
        threshold: PERFORMANCE_THRESHOLDS.tbt.critical,
        message: `JavaScript bloqueando: ${Math.round(metrics.tbt)}ms`,
        recommendations: [
          'Reducir bundle de JavaScript',
          'Implementar code splitting',
          'Diferir scripts no críticos',
          'Revisar third-party scripts'
        ],
        timestamp: Date.now()
      })
    }
    
    // CLS (Cumulative Layout Shift)
    if (metrics.cls > PERFORMANCE_THRESHOLDS.cls.critical) {
      newAlerts.push({
        type: 'error',
        metric: 'CLS',
        value: metrics.cls,
        threshold: PERFORMANCE_THRESHOLDS.cls.critical,
        message: `Layout inestable: ${metrics.cls.toFixed(3)}`,
        recommendations: [
          'Definir dimensiones de imágenes',
          'Reservar espacio para ads/widgets',
          'Evitar insertar contenido dinámico',
          'Usar aspect-ratio CSS'
        ],
        timestamp: Date.now()
      })
    }
    
    this.alerts.push(...newAlerts)
    return newAlerts
  }
  
  /**
   * 📊 Obtener recomendaciones basadas en métricas actuales
   */
  static getOptimizationRecommendations(metrics: any): string[] {
    const recommendations: string[] = []
    
    // Recomendaciones específicas basadas en performance
    if (metrics.score >= 90) {
      recommendations.push('🎉 ¡Excelente performance! Mantén las buenas prácticas.')
    } else if (metrics.score >= 75) {
      recommendations.push('✨ Buen performance. Pequeñas optimizaciones pueden llevarte al siguiente nivel.')
    } else if (metrics.score >= 50) {
      recommendations.push('⚡ Performance promedio. Hay oportunidades significativas de mejora.')
    } else {
      recommendations.push('🚨 Performance crítico. Requiere atención inmediata.')
    }
    
    // Recomendaciones específicas por métrica
    if (metrics.lcp > 4.0) {
      recommendations.push('🖼️ Optimiza las imágenes hero y usa preload para recursos críticos')
    }
    
    if (metrics.tbt > 300) {
      recommendations.push('⚙️ Reduce el JavaScript bloqueante con code splitting')
    }
    
    if (metrics.cls > 0.1) {
      recommendations.push('📐 Define dimensiones fijas para imágenes y contenido dinámico')
    }
    
    return recommendations
  }
  
  /**
   * 🔔 Sistema de alertas (en producción enviaría emails/Slack)
   */
  static async sendAlert(alert: PerformanceAlert) {
    // En desarrollo, solo log
    console.warn(`🚨 Performance Alert: ${alert.message}`)
    
    // En producción, aquí enviarías:
    // - Email al equipo
    // - Notificación a Slack
    // - Dashboard alert
    // - Webhook a sistema de monitoreo
    
    return this.mockNotification(alert)
  }
  
  private static async mockNotification(alert: PerformanceAlert) {
    // Simular notificación
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`📧 Mock notification sent for ${alert.metric}`)
        resolve(true)
      }, 1000)
    })
  }
  
  /**
   * 📈 Tracking de tendencias
   */
  static analyzePerformanceTrend(historyMetrics: any[]): {
    trend: 'improving' | 'stable' | 'degrading'
    change: number
    recommendation: string
  } {
    if (historyMetrics.length < 2) {
      return {
        trend: 'stable',
        change: 0,
        recommendation: 'Necesitas más datos históricos para analizar tendencias'
      }
    }
    
    const recent = historyMetrics.slice(0, 3).map(m => m.score)
    const older = historyMetrics.slice(3, 6).map(m => m.score)
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
    
    const change = recentAvg - olderAvg
    
    if (change > 2) {
      return {
        trend: 'improving',
        change,
        recommendation: '🎉 ¡Performance mejorando! Mantén las optimizaciones actuales.'
      }
    } else if (change < -2) {
      return {
        trend: 'degrading',
        change,
        recommendation: '⚠️ Performance empeorando. Revisa cambios recientes.'
      }
    } else {
      return {
        trend: 'stable',
        change,
        recommendation: '📊 Performance estable. Considera nuevas optimizaciones.'
      }
    }
  }
  
  /**
   * 🛠️ Auto-fix suggestions con código
   */
  static getCodeSuggestions(metrics: any): Array<{
    issue: string
    solution: string
    code: string
  }> {
    const suggestions = []
    
    if (metrics.lcp > 3.0) {
      suggestions.push({
        issue: 'LCP lento por imágenes grandes',
        solution: 'Usar Next.js Image con priority para hero images',
        code: `
// ❌ Imagen sin optimizar
<img src="/hero.jpg" alt="Hero" />

// ✅ Imagen optimizada
<Image 
  src="/hero.jpg" 
  alt="Hero" 
  priority 
  width={1200} 
  height={600}
  sizes="(max-width: 768px) 100vw, 1200px"
/>`
      })
    }
    
    if (metrics.tbt > 200) {
      suggestions.push({
        issue: 'JavaScript bloqueante',
        solution: 'Implementar code splitting con dynamic imports',
        code: `
// ❌ Import estático pesado
import HeavyComponent from './HeavyComponent'

// ✅ Dynamic import
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />
})`
      })
    }
    
    return suggestions
  }
}

/**
 * 🔧 Hook para usar en componentes React
 */
export function usePerformanceMonitor() {
  return {
    analyzeMetrics: PerformanceMonitor.analyzeMetrics,
    getRecommendations: PerformanceMonitor.getOptimizationRecommendations,
    getCodeSuggestions: PerformanceMonitor.getCodeSuggestions,
    sendAlert: PerformanceMonitor.sendAlert
  }
}