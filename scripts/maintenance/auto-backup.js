#!/usr/bin/env node

/**
 * 💾 Sistema de Backup Automático
 * 
 * Crea copias de seguridad automáticas de:
 * - Base de datos Supabase
 * - Archivos de configuración
 * - Imágenes de productos
 * - Logs importantes
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class AutoBackup {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups')
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    
    this.stats = {
      filesBackedUp: 0,
      totalSize: 0,
      errors: 0
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const emoji = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    }[type] || 'ℹ️'
    
    console.log(`${emoji} [${timestamp}] ${message}`)
  }

  /**
   * 🗂️ Crear directorio de backup
   */
  ensureBackupDirectory() {
    const todayBackup = path.join(this.backupDir, this.timestamp)
    
    if (!fs.existsSync(todayBackup)) {
      fs.mkdirSync(todayBackup, { recursive: true })
      this.log(`Directorio de backup creado: ${todayBackup}`)
    }
    
    return todayBackup
  }

  /**
   * 📊 Backup de configuraciones críticas
   */
  async backupConfigurations(backupPath) {
    this.log('Backing up configuraciones...')
    
    const configFiles = [
      'package.json',
      'package-lock.json',
      'next.config.js',
      'tailwind.config.ts',
      'tsconfig.json',
      '.env.example',
      'lighthouse.config.js'
    ]

    const configBackupDir = path.join(backupPath, 'config')
    fs.mkdirSync(configBackupDir, { recursive: true })

    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        try {
          const destPath = path.join(configBackupDir, file)
          fs.copyFileSync(file, destPath)
          
          const size = fs.statSync(file).size
          this.stats.filesBackedUp++
          this.stats.totalSize += size
          
          this.log(`Config backed up: ${file}`)
        } catch (error) {
          this.log(`Error backing up ${file}: ${error.message}`, 'error')
          this.stats.errors++
        }
      }
    }
  }

  /**
   * 🖼️ Backup de imágenes de productos
   */
  async backupProductImages(backupPath) {
    this.log('Backing up imágenes de productos...')
    
    const assetsDir = path.join(process.cwd(), 'public/assets')
    const imagesBackupDir = path.join(backupPath, 'images')
    
    if (!fs.existsSync(assetsDir)) {
      this.log('Directorio de assets no encontrado', 'warning')
      return
    }

    fs.mkdirSync(imagesBackupDir, { recursive: true })

    try {
      const files = fs.readdirSync(assetsDir)
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file)
      )

      for (const file of imageFiles) {
        const sourcePath = path.join(assetsDir, file)
        const destPath = path.join(imagesBackupDir, file)
        
        fs.copyFileSync(sourcePath, destPath)
        
        const size = fs.statSync(sourcePath).size
        this.stats.filesBackedUp++
        this.stats.totalSize += size
      }
      
      this.log(`${imageFiles.length} imágenes backed up`, 'success')
    } catch (error) {
      this.log(`Error backing up images: ${error.message}`, 'error')
      this.stats.errors++
    }
  }

  /**
   * 🗄️ Backup de base de datos (metadata)
   */
  async backupDatabaseSchema(backupPath) {
    this.log('Backing up database schema...')
    
    const dbBackupDir = path.join(backupPath, 'database')
    fs.mkdirSync(dbBackupDir, { recursive: true })

    // Backup de archivos SQL si existen
    const sqlFiles = [
      'database/schema.sql',
      'database/optimized-schema.sql',
      'supabase/migrations'
    ]

    for (const sqlPath of sqlFiles) {
      if (fs.existsSync(sqlPath)) {
        try {
          const fileName = path.basename(sqlPath)
          const destPath = path.join(dbBackupDir, fileName)
          
          if (fs.statSync(sqlPath).isDirectory()) {
            // Copiar directorio completo
            this.copyDirectory(sqlPath, destPath)
          } else {
            // Copiar archivo
            fs.copyFileSync(sqlPath, destPath)
            const size = fs.statSync(sqlPath).size
            this.stats.filesBackedUp++
            this.stats.totalSize += size
          }
          
          this.log(`DB schema backed up: ${fileName}`)
        } catch (error) {
          this.log(`Error backing up ${sqlPath}: ${error.message}`, 'error')
          this.stats.errors++
        }
      }
    }

    // Crear snapshot de configuración actual
    const configSnapshot = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not-set',
      version: this.getPackageVersion(),
      backupType: 'automated'
    }

    const snapshotPath = path.join(dbBackupDir, 'config-snapshot.json')
    fs.writeFileSync(snapshotPath, JSON.stringify(configSnapshot, null, 2))
    this.stats.filesBackedUp++
  }

  /**
   * 📋 Backup de logs críticos
   */
  async backupLogs(backupPath) {
    this.log('Backing up logs...')
    
    const logsBackupDir = path.join(backupPath, 'logs')
    const logsSources = [
      'logs',
      '.next/trace',
      'scripts/maintenance'
    ]

    for (const logsPath of logsSources) {
      if (fs.existsSync(logsPath)) {
        try {
          const destPath = path.join(logsBackupDir, path.basename(logsPath))
          
          if (fs.statSync(logsPath).isDirectory()) {
            this.copyDirectory(logsPath, destPath)
          } else {
            fs.mkdirSync(logsBackupDir, { recursive: true })
            fs.copyFileSync(logsPath, destPath)
          }
          
          this.log(`Logs backed up: ${path.basename(logsPath)}`)
        } catch (error) {
          this.log(`Error backing up logs: ${error.message}`, 'error')
          this.stats.errors++
        }
      }
    }
  }

  /**
   * 📦 Crear archivo comprimido del backup
   */
  async compressBackup(backupPath) {
    this.log('Comprimiendo backup...')
    
    try {
      const archiveName = `backup-${this.timestamp}.tar.gz`
      const archivePath = path.join(this.backupDir, archiveName)
      
      // Comprimir usando tar (en Windows necesitarías 7zip o similar)
      const command = process.platform === 'win32' 
        ? `powershell Compress-Archive -Path "${backupPath}\\*" -DestinationPath "${backupPath}.zip"`
        : `tar -czf "${archivePath}" -C "${this.backupDir}" "${this.timestamp}"`
      
      execSync(command, { stdio: 'inherit' })
      
      // Verificar archivo comprimido
      const archiveStats = fs.statSync(process.platform === 'win32' ? `${backupPath}.zip` : archivePath)
      
      this.log(`Backup comprimido: ${this.formatBytes(archiveStats.size)}`, 'success')
      
      return process.platform === 'win32' ? `${backupPath}.zip` : archivePath
    } catch (error) {
      this.log(`Error comprimiendo backup: ${error.message}`, 'error')
      return backupPath
    }
  }

  /**
   * 🧹 Limpiar backups antiguos (mantener últimos 7)
   */
  async cleanOldBackups() {
    this.log('Limpiando backups antiguos...')
    
    if (!fs.existsSync(this.backupDir)) return

    try {
      const backups = fs.readdirSync(this.backupDir)
        .filter(name => name.startsWith('backup-') || /\d{4}-\d{2}-\d{2}/.test(name))
        .sort()
        .reverse() // Más recientes primero

      if (backups.length > 7) {
        const toDelete = backups.slice(7) // Mantener solo los 7 más recientes
        
        for (const oldBackup of toDelete) {
          const oldPath = path.join(this.backupDir, oldBackup)
          
          try {
            if (fs.statSync(oldPath).isDirectory()) {
              this.removeDirectory(oldPath)
            } else {
              fs.unlinkSync(oldPath)
            }
            
            this.log(`Backup antiguo eliminado: ${oldBackup}`)
          } catch (error) {
            this.log(`Error eliminando ${oldBackup}: ${error.message}`, 'error')
          }
        }
      }
    } catch (error) {
      this.log(`Error limpiando backups antiguos: ${error.message}`, 'error')
    }
  }

  /**
   * 🛠️ Utilities
   */
  copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true })
    const files = fs.readdirSync(src, { withFileTypes: true })
    
    for (const file of files) {
      const srcPath = path.join(src, file.name)
      const destPath = path.join(dest, file.name)
      
      if (file.isDirectory()) {
        this.copyDirectory(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
        const size = fs.statSync(srcPath).size
        this.stats.filesBackedUp++
        this.stats.totalSize += size
      }
    }
  }

  removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach(file => {
        const curPath = path.join(dirPath, file)
        if (fs.lstatSync(curPath).isDirectory()) {
          this.removeDirectory(curPath)
        } else {
          fs.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(dirPath)
    }
  }

  getPackageVersion() {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      return pkg.version || '1.0.0'
    } catch {
      return '1.0.0'
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 🚀 Ejecutar backup completo
   */
  async runBackup() {
    this.log('💾 Iniciando backup automático...')
    const startTime = Date.now()

    try {
      const backupPath = this.ensureBackupDirectory()

      await this.backupConfigurations(backupPath)
      await this.backupProductImages(backupPath)
      await this.backupDatabaseSchema(backupPath)
      await this.backupLogs(backupPath)
      
      // Comprimir backup
      const archivePath = await this.compressBackup(backupPath)
      
      // Limpiar backups antiguos
      await this.cleanOldBackups()

      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)

      this.log('🎉 Backup completado exitosamente!', 'success')
      this.log(`Estadísticas:`)
      this.log(`  • Archivos respaldados: ${this.stats.filesBackedUp}`)
      this.log(`  • Tamaño total: ${this.formatBytes(this.stats.totalSize)}`)
      this.log(`  • Errores: ${this.stats.errors}`)
      this.log(`  • Tiempo total: ${duration}s`)
      this.log(`  • Archivo: ${path.basename(archivePath)}`)

      // Guardar log del backup
      const logEntry = {
        timestamp: new Date().toISOString(),
        stats: this.stats,
        duration: parseFloat(duration),
        archivePath: archivePath,
        success: this.stats.errors === 0
      }

      const logsDir = path.join(process.cwd(), 'logs')
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true })
      }

      const logFile = path.join(logsDir, 'backup.log')
      const logLine = JSON.stringify(logEntry) + '\n'
      fs.appendFileSync(logFile, logLine)

      return archivePath

    } catch (error) {
      this.log(`Error durante el backup: ${error.message}`, 'error')
      process.exit(1)
    }
  }
}

// 🚀 Ejecutar si se llama directamente
if (require.main === module) {
  const backup = new AutoBackup()
  backup.runBackup()
}

module.exports = AutoBackup