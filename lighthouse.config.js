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

    // 🎯 Performance Budgets - SENIOR TUNING
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.70 }],
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],

        // Audit-based metrics (más robusto que el prefijo metrics:)
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 350 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],

        // Resource budgets realistas para Joyería de Lujo (Video 4K + High-Res)
        'resource-summary:script:size': ['warn', { maxNumericValue: 800000 }],
        'resource-summary:image:size': ['warn', { maxNumericValue: 3000000 }],
        'resource-summary:total:size': ['error', { maxNumericValue: 10000000 }], // 10MB Buffer definitivo

        // Best practices (Ya implementadas, solo monitoreamos)
        'uses-optimized-images': 'off', // Ya usamos Sharp y WebP dinámico
        'uses-webp-images': 'off',      // Ya estamos en WebP nativo
        'efficient-animated-content': 'warn',
        'offscreen-images': 'warn',
        'unused-javascript': ['warn', { maxNumericValue: 300000 }]
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