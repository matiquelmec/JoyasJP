// 🚀 Configuración de Lighthouse para Performance Monitoring

module.exports = {
  ci: {
    collect: {
      // URLs a testear automáticamente
      url: [
        'http://localhost:3000',
        'http://localhost:3000/productos',
        'http://localhost:3000/productos/black-link'
      ],
      // Configuración de Chrome
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop'
      },
      // Número de runs para promedio
      numberOfRuns: 3
    },

    // 🎯 Performance Budgets - THRESHOLDS CRÍTICOS
    assert: {
      // Performance Score mínimo
      assertions: {
        'categories:performance': ['error', { minScore: 0.70 }], // 70+
        'categories:accessibility': ['error', { minScore: 0.80 }], // 80+
        'categories:best-practices': ['error', { minScore: 0.90 }], // 90+

        // Core Web Vitals
        'metrics:largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // 2.5s
        'metrics:total-blocking-time': ['error', { maxNumericValue: 200 }], // 200ms
        'metrics:cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // 0.1
        'metrics:first-contentful-paint': ['error', { maxNumericValue: 1800 }], // 1.8s

        // Resource budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }], // 500KB JS
        'resource-summary:image:size': ['error', { maxNumericValue: 1000000 }], // 1MB images
        'resource-summary:total:size': ['error', { maxNumericValue: 2000000 }], // 2MB total

        // Specific audits
        'unused-javascript': ['error', { maxNumericValue: 200000 }], // 200KB unused JS
        'render-blocking-resources': ['error', { maxNumericValue: 500 }], // 500ms blocking
        'uses-optimized-images': 'error',
        'uses-webp-images': 'error',
        'efficient-animated-content': 'error',
        'offscreen-images': 'error'
      }
    },

    // 📊 Upload results para análisis histórico
    upload: {
      target: 'temporary-public-storage'
    },

    // 🚀 Server configuration
    server: {
      port: 9001,
      storage: '.lighthouseci'
    }
  },

  // 🎯 Custom audit configuration
  extends: 'lighthouse:default',

  settings: {
    // Solo auditorías de performance y core web vitals
    onlyCategories: ['performance', 'accessibility'],

    // Skip audits not relevant for this project
    skipAudits: [
      'canonical',
      'robots-txt',
      'tap-targets'
    ],

    // Throttling para simular conexión 3G
    throttlingMethod: 'simulate',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4
    },

    // Configuración del dispositivo
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    }
  }
}