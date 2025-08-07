// Simple performance monitoring
export const logPerformance = (metric: string, value: number) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Log critical metrics
    if (value > 3000) { // Slow page load
      console.warn(`🐌 Slow ${metric}: ${value}ms`)
    }
  }
}

export const logError = (error: Error, context?: string) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service in the future
    console.error(`❌ Error ${context}:`, error)
  }
}

// Usage tracking for scaling decisions
export const trackPageView = (page: string) => {
  if (typeof window !== 'undefined') {
    // Simple analytics - replace with real service when needed
    const views = parseInt(localStorage.getItem('pageViews') || '0') + 1
    localStorage.setItem('pageViews', views.toString())
  }
}