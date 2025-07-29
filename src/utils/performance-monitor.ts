"use client";

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  resourceSizes: {
    images: number;
    scripts: number;
    stylesheets: number;
    fonts: number;
    total: number;
  };
  imageLoadTimes: Array<{
    src: string;
    loadTime: number;
    size: number;
  }>;
}

interface PerformanceBudget {
  maxPageSize: number; // KB
  maxImageSize: number; // KB
  maxScriptSize: number; // KB
  maxCSSSize: number; // KB
  maxLCP: number; // ms
  maxFID: number; // ms
  maxCLS: number; // score
  maxImages: number; // count
  maxRequests: number; // count
}

// Budget por defecto optimizado para e-commerce
const DEFAULT_BUDGET: PerformanceBudget = {
  maxPageSize: 2048, // 2MB total
  maxImageSize: 500, // 500KB por imagen
  maxScriptSize: 1024, // 1MB scripts
  maxCSSSize: 200, // 200KB CSS
  maxLCP: 2500, // 2.5s
  maxFID: 100, // 100ms
  maxCLS: 0.1, // 0.1 score
  maxImages: 20, // máximo 20 imágenes por página
  maxRequests: 50, // máximo 50 requests
};

class PerformanceMonitor {
  private budget: PerformanceBudget;
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: Map<string, PerformanceObserver> = new Map();
  private imageLoadTimes: Array<{ src: string; loadTime: number; size: number }> = [];
  private startTime: number = performance.now();
  private violations: Array<{ type: string; message: string; value: number; limit: number }> = [];

  constructor(budget: Partial<PerformanceBudget> = {}) {
    this.budget = { ...DEFAULT_BUDGET, ...budget };
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor Web Vitals
    this.observeWebVitals();
    
    // Monitor resource loading
    this.observeResourceTiming();
    
    // Monitor navigation timing
    this.observeNavigationTiming();
    
    // Monitor long tasks
    this.observeLongTasks();
    
    // Monitor layout shifts
    this.observeLayoutShifts();

    // Monitor images
    this.monitorImages();

    // Setup periodic checks
    this.setupPeriodicChecks();
  }

  private observeWebVitals() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        this.checkBudgetViolation('LCP', lastEntry.startTime, this.budget.maxLCP);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
          this.checkBudgetViolation('FID', this.metrics.firstInputDelay, this.budget.maxFID);
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }
    }

    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        });
      });
      
      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }
    }
  }

  private observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        entries.forEach((entry: any) => {
          const size = entry.transferSize || entry.encodedBodySize || 0;
          const resourceType = this.getResourceType(entry.name);
          
          // Track resource sizes
          if (!this.metrics.resourceSizes) {
            this.metrics.resourceSizes = {
              images: 0,
              scripts: 0,
              stylesheets: 0,
              fonts: 0,
              total: 0,
            };
          }
          
          this.metrics.resourceSizes[resourceType] += size;
          this.metrics.resourceSizes.total += size;
          
          // Check individual resource budgets
          this.checkResourceBudget(resourceType, size, entry.name);
        });
        
        // Check total page size
        if (this.metrics.resourceSizes) {
          const totalSizeKB = this.metrics.resourceSizes.total / 1024;
          this.checkBudgetViolation('Page Size', totalSizeKB, this.budget.maxPageSize);
        }
      });
      
      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (e) {
        console.warn('Resource observer not supported');
      }
    }
  }

  private observeNavigationTiming() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        if (navigation) {
          this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
          this.metrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
        }
      });
    }
  }

  private observeLongTasks() {
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            this.violations.push({
              type: 'Long Task',
              message: `Task took ${entry.duration.toFixed(2)}ms (should be < 50ms)`,
              value: entry.duration,
              limit: 50,
            });
          }
        });
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }
    }
  }

  private observeLayoutShifts() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.metrics.cumulativeLayoutShift = clsValue;
        this.checkBudgetViolation('CLS', clsValue, this.budget.maxCLS);
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  private monitorImages() {
    if (typeof window === 'undefined') return;

    // Monitor existing images
    const images = document.querySelectorAll('img');
    images.forEach(img => this.trackImage(img));

    // Monitor new images
    const imageObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const images = element.querySelectorAll('img');
            images.forEach(img => this.trackImage(img));
            
            if (element.tagName === 'IMG') {
              this.trackImage(element as HTMLImageElement);
            }
          }
        });
      });
    });

    imageObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private trackImage(img: HTMLImageElement) {
    const startTime = performance.now();
    
    const onLoad = () => {
      const loadTime = performance.now() - startTime;
      
      // Estimate image size if not available
      let size = 0;
      const resourceEntries = performance.getEntriesByName(img.src);
      if (resourceEntries.length > 0) {
        const entry = resourceEntries[0] as any;
        size = entry.transferSize || entry.encodedBodySize || 0;
      }
      
      this.imageLoadTimes.push({
        src: img.src,
        loadTime,
        size,
      });

      // Check image budget
      const sizeKB = size / 1024;
      if (sizeKB > this.budget.maxImageSize) {
        this.violations.push({
          type: 'Image Size',
          message: `Image ${img.src} is ${sizeKB.toFixed(2)}KB (limit: ${this.budget.maxImageSize}KB)`,
          value: sizeKB,
          limit: this.budget.maxImageSize,
        });
      }

      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };

    const onError = () => {
      this.violations.push({
        type: 'Image Load Error',
        message: `Failed to load image: ${img.src}`,
        value: 1,
        limit: 0,
      });
      
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };

    if (img.complete) {
      onLoad();
    } else {
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
    }
  }

  private getResourceType(url: string): keyof PerformanceMetrics['resourceSizes'] {
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url)) return 'images';
    if (/\.(js|mjs)$/i.test(url)) return 'scripts';
    if (/\.css$/i.test(url)) return 'stylesheets';
    if (/\.(woff|woff2|ttf|otf)$/i.test(url)) return 'fonts';
    return 'total';
  }

  private checkResourceBudget(type: string, size: number, url: string) {
    const sizeKB = size / 1024;
    let limit = 0;
    
    switch (type) {
      case 'images':
        limit = this.budget.maxImageSize;
        break;
      case 'scripts':
        limit = this.budget.maxScriptSize;
        break;
      case 'stylesheets':
        limit = this.budget.maxCSSSize;
        break;
    }
    
    if (limit > 0 && sizeKB > limit) {
      this.violations.push({
        type: `${type} Size`,
        message: `${url} is ${sizeKB.toFixed(2)}KB (limit: ${limit}KB)`,
        value: sizeKB,
        limit,
      });
    }
  }

  private checkBudgetViolation(metric: string, value: number, limit: number) {
    if (value > limit) {
      this.violations.push({
        type: metric,
        message: `${metric} is ${value.toFixed(2)} (limit: ${limit})`,
        value,
        limit,
      });
    }
  }

  private setupPeriodicChecks() {
    // Check every 30 seconds
    setInterval(() => {
      this.checkImageCount();
      this.checkRequestCount();
    }, 30000);
  }

  private checkImageCount() {
    const imageCount = document.querySelectorAll('img').length;
    if (imageCount > this.budget.maxImages) {
      this.violations.push({
        type: 'Image Count',
        message: `Page has ${imageCount} images (limit: ${this.budget.maxImages})`,
        value: imageCount,
        limit: this.budget.maxImages,
      });
    }
  }

  private checkRequestCount() {
    const resourceEntries = performance.getEntriesByType('resource');
    if (resourceEntries.length > this.budget.maxRequests) {
      this.violations.push({
        type: 'Request Count',
        message: `Page made ${resourceEntries.length} requests (limit: ${this.budget.maxRequests})`,
        value: resourceEntries.length,
        limit: this.budget.maxRequests,
      });
    }
  }

  // Public methods
  public getMetrics(): PerformanceMetrics {
    return {
      pageLoadTime: this.metrics.pageLoadTime || 0,
      firstContentfulPaint: this.metrics.firstContentfulPaint || 0,
      largestContentfulPaint: this.metrics.largestContentfulPaint || 0,
      firstInputDelay: this.metrics.firstInputDelay || 0,
      cumulativeLayoutShift: this.metrics.cumulativeLayoutShift || 0,
      timeToInteractive: this.metrics.timeToInteractive || 0,
      resourceSizes: this.metrics.resourceSizes || {
        images: 0,
        scripts: 0,
        stylesheets: 0,
        fonts: 0,
        total: 0,
      },
      imageLoadTimes: this.imageLoadTimes,
    };
  }

  public getViolations() {
    return this.violations;
  }

  public getBudget() {
    return this.budget;
  }

  public getScore(): number {
    const metrics = this.getMetrics();
    let score = 100;
    
    // Deduct points for violations
    this.violations.forEach((violation) => {
      switch (violation.type) {
        case 'LCP':
          score -= Math.min(30, (violation.value - violation.limit) / 100);
          break;
        case 'FID':
          score -= Math.min(20, (violation.value - violation.limit) / 10);
          break;
        case 'CLS':
          score -= Math.min(25, (violation.value - violation.limit) * 100);
          break;
        case 'Page Size':
          score -= Math.min(15, (violation.value - violation.limit) / 100);
          break;
        default:
          score -= 5;
      }
    });
    
    return Math.max(0, Math.round(score));
  }

  public generateReport(): string {
    const metrics = this.getMetrics();
    const score = this.getScore();
    
    let report = `🎯 Performance Report - Score: ${score}/100\n\n`;
    
    report += `📊 Core Web Vitals:\n`;
    report += `  LCP: ${metrics.largestContentfulPaint.toFixed(2)}ms (target: <${this.budget.maxLCP}ms)\n`;
    report += `  FID: ${metrics.firstInputDelay.toFixed(2)}ms (target: <${this.budget.maxFID}ms)\n`;
    report += `  CLS: ${metrics.cumulativeLayoutShift.toFixed(3)} (target: <${this.budget.maxCLS})\n\n`;
    
    report += `📈 Load Metrics:\n`;
    report += `  FCP: ${metrics.firstContentfulPaint.toFixed(2)}ms\n`;
    report += `  TTI: ${metrics.timeToInteractive.toFixed(2)}ms\n`;
    report += `  Page Load: ${metrics.pageLoadTime.toFixed(2)}ms\n\n`;
    
    report += `💾 Resource Sizes:\n`;
    report += `  Total: ${(metrics.resourceSizes.total / 1024).toFixed(2)}KB\n`;
    report += `  Images: ${(metrics.resourceSizes.images / 1024).toFixed(2)}KB\n`;
    report += `  Scripts: ${(metrics.resourceSizes.scripts / 1024).toFixed(2)}KB\n`;
    report += `  Stylesheets: ${(metrics.resourceSizes.stylesheets / 1024).toFixed(2)}KB\n\n`;
    
    if (this.violations.length > 0) {
      report += `⚠️ Budget Violations (${this.violations.length}):\n`;
      this.violations.forEach((violation, index) => {
        report += `  ${index + 1}. ${violation.type}: ${violation.message}\n`;
      });
    } else {
      report += `✅ No budget violations detected!\n`;
    }
    
    return report;
  }

  public destroy() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function createPerformanceMonitor(budget?: Partial<PerformanceBudget>) {
  if (performanceMonitor) {
    performanceMonitor.destroy();
  }
  
  performanceMonitor = new PerformanceMonitor(budget);
  return performanceMonitor;
}

export function getPerformanceMonitor() {
  return performanceMonitor;
}

// React hook for performance monitoring
export function usePerformanceMonitor(budget?: Partial<PerformanceBudget>) {
  if (typeof window === 'undefined') {
    return {
      metrics: null,
      violations: [],
      score: 100,
      report: '',
    };
  }

  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor(budget);
  }

  return {
    metrics: performanceMonitor.getMetrics(),
    violations: performanceMonitor.getViolations(),
    score: performanceMonitor.getScore(),
    report: performanceMonitor.generateReport(),
  };
}

export type { PerformanceMetrics, PerformanceBudget };