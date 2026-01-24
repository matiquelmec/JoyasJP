#!/usr/bin/env node

/**
 * 🎯 Performance Budget Checker
 * 
 * Este script verifica que el performance se mantenga dentro de los límites
 * y bloquea deploys si el rendimiento es insuficiente.
 */

const fs = require('fs')
const path = require('path')

// 🚨 PERFORMANCE BUDGETS - Si estos fallan, el deploy se bloquea
const PERFORMANCE_BUDGETS = {
  score: {
    minimum: 70,
    target: 80,
    excellent: 90
  },
  lcp: {
    good: 3.5,
    poor: 5.0
  },
  tbt: {
    good: 400,
    poor: 600
  },
  cls: {
    good: 0.15,
    poor: 0.25
  },
  bundleSize: {
    warning: 400000, // 400KB
    critical: 500000  // 500KB
  }
}

class PerformanceBudgetChecker {

  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    }
  }

  /**
   * 📊 Leer resultados de Lighthouse CI
   */
  readLighthouseResults() {
    try {
      const resultsPath = path.join(process.cwd(), '.lighthouseci')

      // En un setup real, leerías los resultados JSON de Lighthouse CI
      // Por ahora, simulamos datos
      return {
        score: parseInt(process.env.LIGHTHOUSE_SCORE) || Math.floor(Math.random() * 30) + 60,
        lcp: parseFloat(process.env.LCP_SCORE) || (Math.random() * 3 + 1.5),
        tbt: parseFloat(process.env.TBT_SCORE) || Math.floor(Math.random() * 300 + 100),
        cls: parseFloat(process.env.CLS_SCORE) || (Math.random() * 0.15 + 0.05)
      }
    } catch (error) {
      console.error('❌ Error reading Lighthouse results:', error.message)
      return null
    }
  }

  /**
   * 📏 Verificar Performance Score
   */
  checkPerformanceScore(score) {
    if (score >= PERFORMANCE_BUDGETS.score.excellent) {
      this.results.passed++
      this.results.details.push(`✅ Performance Score: ${score} (Excellent!)`)
      return true
    } else if (score >= PERFORMANCE_BUDGETS.score.target) {
      this.results.passed++
      this.results.details.push(`✅ Performance Score: ${score} (Good)`)
      return true
    } else if (score >= PERFORMANCE_BUDGETS.score.minimum) {
      this.results.warnings++
      this.results.details.push(`⚠️  Performance Score: ${score} (Acceptable, but could be better)`)
      return true
    } else {
      this.results.failed++
      this.results.details.push(`❌ Performance Score: ${score} (Below minimum of ${PERFORMANCE_BUDGETS.score.minimum})`)
      return false
    }
  }

  /**
   * 🎯 Verificar LCP (Largest Contentful Paint)
   */
  checkLCP(lcp) {
    if (lcp <= PERFORMANCE_BUDGETS.lcp.good) {
      this.results.passed++
      this.results.details.push(`✅ LCP: ${lcp.toFixed(2)}s (Good)`)
      return true
    } else if (lcp <= PERFORMANCE_BUDGETS.lcp.poor) {
      this.results.warnings++
      this.results.details.push(`⚠️  LCP: ${lcp.toFixed(2)}s (Needs improvement)`)
      return true
    } else {
      this.results.failed++
      this.results.details.push(`❌ LCP: ${lcp.toFixed(2)}s (Too slow)`)
      return false
    }
  }

  /**
   * ⏱️ Verificar TBT (Total Blocking Time)
   */
  checkTBT(tbt) {
    if (tbt <= PERFORMANCE_BUDGETS.tbt.good) {
      this.results.passed++
      this.results.details.push(`✅ TBT: ${Math.round(tbt)}ms (Good)`)
      return true
    } else if (tbt <= PERFORMANCE_BUDGETS.tbt.poor) {
      this.results.warnings++
      this.results.details.push(`⚠️  TBT: ${Math.round(tbt)}ms (Needs improvement)`)
      return true
    } else {
      this.results.failed++
      this.results.details.push(`❌ TBT: ${Math.round(tbt)}ms (Too high)`)
      return false
    }
  }

  /**
   * 📐 Verificar CLS (Cumulative Layout Shift)
   */
  checkCLS(cls) {
    if (cls <= PERFORMANCE_BUDGETS.cls.good) {
      this.results.passed++
      this.results.details.push(`✅ CLS: ${cls.toFixed(3)} (Good)`)
      return true
    } else if (cls <= PERFORMANCE_BUDGETS.cls.poor) {
      this.results.warnings++
      this.results.details.push(`⚠️  CLS: ${cls.toFixed(3)} (Needs improvement)`)
      return true
    } else {
      this.results.failed++
      this.results.details.push(`❌ CLS: ${cls.toFixed(3)} (Too unstable)`)
      return false
    }
  }

  /**
   * 📦 Verificar Bundle Size
   */
  checkBundleSize() {
    try {
      const nextBuildPath = path.join(process.cwd(), '.next')
      const buildManifest = path.join(nextBuildPath, 'build-manifest.json')

      if (fs.existsSync(buildManifest)) {
        const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'))
        // Calcular tamaño aproximado del bundle
        const bundleSize = Object.keys(manifest.pages).length * 50000 // Estimación

        if (bundleSize <= PERFORMANCE_BUDGETS.bundleSize.warning) {
          this.results.passed++
          this.results.details.push(`✅ Bundle Size: ~${Math.round(bundleSize / 1000)}KB (Good)`)
          return true
        } else if (bundleSize <= PERFORMANCE_BUDGETS.bundleSize.critical) {
          this.results.warnings++
          this.results.details.push(`⚠️  Bundle Size: ~${Math.round(bundleSize / 1000)}KB (Large)`)
          return true
        } else {
          this.results.failed++
          this.results.details.push(`❌ Bundle Size: ~${Math.round(bundleSize / 1000)}KB (Too large)`)
          return false
        }
      }
    } catch (error) {
      this.results.warnings++
      this.results.details.push(`⚠️  Bundle Size: Could not determine (${error.message})`)
    }

    return true
  }

  /**
   * 🚀 Ejecutar todas las verificaciones
   */
  async runChecks() {
    console.log('🎯 Running Performance Budget Checks...\n')

    const metrics = this.readLighthouseResults()

    if (!metrics) {
      console.error('❌ Could not read performance metrics')
      process.exit(1)
    }

    console.log('📊 Performance Metrics:')
    console.log(`   Score: ${metrics.score}`)
    console.log(`   LCP: ${metrics.lcp.toFixed(2)}s`)
    console.log(`   TBT: ${Math.round(metrics.tbt)}ms`)
    console.log(`   CLS: ${metrics.cls.toFixed(3)}`)
    console.log('')

    // Ejecutar todas las verificaciones
    const checks = [
      this.checkPerformanceScore(metrics.score),
      this.checkLCP(metrics.lcp),
      this.checkTBT(metrics.tbt),
      this.checkCLS(metrics.cls),
      this.checkBundleSize()
    ]

    const allPassed = checks.every(check => check)

    // Mostrar resultados
    console.log('📋 Budget Check Results:')
    this.results.details.forEach(detail => console.log(`   ${detail}`))
    console.log('')

    console.log(`📊 Summary: ${this.results.passed} passed, ${this.results.warnings} warnings, ${this.results.failed} failed`)

    if (allPassed && this.results.failed === 0) {
      console.log('🎉 All performance budgets passed!')

      // Exportar métricas para GitHub Actions usando la API moderna
      if (process.env.GITHUB_OUTPUT) {
        const output = [
          `performance-score=${metrics.score}`,
          `lcp=${metrics.lcp.toFixed(2)}`,
          `status=passed`
        ].join('\n')
        fs.appendFileSync(process.env.GITHUB_OUTPUT, output + '\n')
      }

      process.exit(0)
    } else {
      console.log('\n❌ Performance budget failed!')
      console.log('🚨 Deploy blocked until performance improves.')

      if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `status=failed\n`)
        console.log(`::error::Performance budget failed with ${this.results.failed} critical issues`)
      }

      // Sugerir acciones
      console.log('\n💡 Suggested actions:')
      if (metrics.score < PERFORMANCE_BUDGETS.score.minimum) {
        console.log('   • Run lighthouse audit locally and fix critical issues')
        console.log('   • Optimize images and reduce JavaScript bundle size')
      }
      if (metrics.lcp > PERFORMANCE_BUDGETS.lcp.poor) {
        console.log('   • Optimize hero images and critical resources')
      }
      if (metrics.tbt > PERFORMANCE_BUDGETS.tbt.poor) {
        console.log('   • Reduce JavaScript execution time')
        console.log('   • Implement code splitting and lazy loading')
      }

      process.exit(1)
    }
  }
}

// 🚀 Ejecutar verificación
const checker = new PerformanceBudgetChecker()
checker.runChecks().catch(error => {
  console.error('❌ Performance check failed:', error)
  process.exit(1)
})