export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry
    let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    
    if (context && Object.keys(context).length > 0) {
      logMessage += ` | Context: ${JSON.stringify(context)}`
    }
    
    if (error) {
      logMessage += ` | Error: ${error.message}`
      if (error.stack && this.isDevelopment) {
        logMessage += `\n${error.stack}`
      }
    }
    
    return logMessage
  }

  private createLogEntry(
    level: LogEntry['level'], 
    message: string, 
    context?: Record<string, any>, 
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    }
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('info', message, context)
    console.info(this.formatLog(entry))
    this.sendToExternalService(entry)
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('warn', message, context)
    console.warn(this.formatLog(entry))
    this.sendToExternalService(entry)
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    const entry = this.createLogEntry('error', message, context, error)
    console.error(this.formatLog(entry))
    this.sendToExternalService(entry)
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.isDevelopment) return
    
    const entry = this.createLogEntry('debug', message, context)
    console.debug(this.formatLog(entry))
  }

  private async sendToExternalService(entry: LogEntry) {
    try {
      if (entry.level === 'error' || entry.level === 'warn') {
        if (typeof window !== 'undefined' && 'localStorage' in window) {
          const logs = this.getStoredLogs()
          logs.push(entry)
          
          const maxLogs = 100
          if (logs.length > maxLogs) {
            logs.splice(0, logs.length - maxLogs)
          }
          
          localStorage.setItem('app_logs', JSON.stringify(logs))
        }
      }
    } catch (e) {
      console.error('Failed to store log:', e)
    }
  }

  getStoredLogs(): LogEntry[] {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const stored = localStorage.getItem('app_logs')
        return stored ? JSON.parse(stored) : []
      }
    } catch (e) {
      console.error('Failed to retrieve stored logs:', e)
    }
    return []
  }

  clearStoredLogs() {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        localStorage.removeItem('app_logs')
      }
    } catch (e) {
      console.error('Failed to clear stored logs:', e)
    }
  }
}

export const logger = new Logger()

export function logApiCall(
  endpoint: string, 
  method: string, 
  status?: number, 
  duration?: number
) {
  const context = {
    endpoint,
    method,
    status,
    duration: duration ? `${duration}ms` : undefined
  }

  if (status && status >= 400) {
    logger.error(`API call failed: ${method} ${endpoint}`, context)
  } else {
    logger.info(`API call: ${method} ${endpoint}`, context)
  }
}

export function logUserAction(action: string, context?: Record<string, any>) {
  logger.info(`User action: ${action}`, context)
}

export function logError(error: Error, context?: Record<string, any>) {
  logger.error('Application error', context, error)
}