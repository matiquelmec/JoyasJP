// Performance utilities for scaling
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Image lazy loading with intersection observer
export const createImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void
) => {
  if (typeof window === 'undefined') return null
  
  return new IntersectionObserver(
    (entries) => entries.forEach(callback),
    {
      rootMargin: '50px 0px',
      threshold: 0.1
    }
  )
}