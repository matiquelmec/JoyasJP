'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Database, 
  HardDrive, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Zap,
  Trash2,
  Download,
  Upload,
  Settings,
  Activity
} from 'lucide-react'
import { maintenanceAPI } from '@/lib/maintenance-api'
import { toast } from '@/hooks/use-toast'

interface MaintenanceTask {
  id: string
  title: string
  description: string
  frequency: string
  lastRun: Date | null
  nextDue: Date
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'running' | 'completed' | 'overdue'
  category: 'database' | 'files' | 'performance' | 'security' | 'updates'
  autoRun: boolean
  estimatedTime: number // minutos
}

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error'
    connections: number
    size: string
    lastBackup: Date
  }
  files: {
    status: 'healthy' | 'warning' | 'error'
    totalSize: string
    orphanedFiles: number
    cacheSize: string
  }
  performance: {
    status: 'healthy' | 'warning' | 'error'
    avgLoadTime: number
    errorRate: number
    uptime: number
  }
  security: {
    status: 'healthy' | 'warning' | 'error'
    lastSecurityScan: Date
    vulnerabilities: number
    sslStatus: 'valid' | 'warning' | 'expired'
  }
}

export default function MantenimientoPage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔧 Tareas de mantenimiento predefinidas
  const defaultTasks: MaintenanceTask[] = [
    {
      id: 'db-backup',
      title: 'Backup Base de Datos',
      description: 'Crear copia de seguridad completa de la base de datos',
      frequency: 'Diario',
      lastRun: new Date(Date.now() - 86400000), // Ayer
      nextDue: new Date(Date.now() + 3600000), // En 1 hora
      priority: 'high',
      status: 'pending',
      category: 'database',
      autoRun: true,
      estimatedTime: 5
    },
    {
      id: 'image-cleanup',
      title: 'Limpiar Imágenes Huérfanas',
      description: 'Eliminar imágenes no utilizadas y optimizar almacenamiento',
      frequency: 'Semanal',
      lastRun: new Date(Date.now() - 604800000), // Hace 1 semana
      nextDue: new Date(Date.now() + 86400000), // Mañana
      priority: 'medium',
      status: 'pending',
      category: 'files',
      autoRun: false,
      estimatedTime: 10
    },
    {
      id: 'cache-clear',
      title: 'Limpiar Cache del Sistema',
      description: 'Eliminar cache obsoleto y regenerar cache crítico',
      frequency: 'Semanal',
      lastRun: new Date(Date.now() - 86400000 * 3), // Hace 3 días
      nextDue: new Date(Date.now() + 86400000 * 4), // En 4 días
      priority: 'medium',
      status: 'pending',
      category: 'performance',
      autoRun: true,
      estimatedTime: 2
    },
    {
      id: 'security-scan',
      title: 'Escaneo de Seguridad',
      description: 'Verificar vulnerabilidades y actualizar dependencias',
      frequency: 'Semanal',
      lastRun: new Date(Date.now() - 86400000 * 7), // Hace 1 semana
      nextDue: new Date(Date.now() + 86400000), // Mañana
      priority: 'high',
      status: 'overdue',
      category: 'security',
      autoRun: false,
      estimatedTime: 15
    },
    {
      id: 'dependencies-update',
      title: 'Actualizar Dependencias',
      description: 'Revisar y actualizar paquetes npm con parches de seguridad',
      frequency: 'Quincenal',
      lastRun: new Date(Date.now() - 86400000 * 10), // Hace 10 días
      nextDue: new Date(Date.now() + 86400000 * 5), // En 5 días
      priority: 'medium',
      status: 'pending',
      category: 'updates',
      autoRun: false,
      estimatedTime: 30
    },
    {
      id: 'performance-audit',
      title: 'Auditoría de Performance',
      description: 'Análisis completo de rendimiento y optimizaciones',
      frequency: 'Mensual',
      lastRun: new Date(Date.now() - 86400000 * 15), // Hace 15 días
      nextDue: new Date(Date.now() + 86400000 * 15), // En 15 días
      priority: 'medium',
      status: 'pending',
      category: 'performance',
      autoRun: true,
      estimatedTime: 20
    },
    {
      id: 'log-cleanup',
      title: 'Limpiar Logs Antiguos',
      description: 'Archivar logs antiguos y mantener solo los necesarios',
      frequency: 'Mensual',
      lastRun: new Date(Date.now() - 86400000 * 20), // Hace 20 días
      nextDue: new Date(Date.now() + 86400000 * 10), // En 10 días
      priority: 'low',
      status: 'pending',
      category: 'files',
      autoRun: true,
      estimatedTime: 5
    }
  ]

  // 🏥 Generar datos de salud del sistema
  const generateSystemHealth = (): SystemHealth => ({
    database: {
      status: Math.random() > 0.1 ? 'healthy' : 'warning',
      connections: Math.floor(Math.random() * 50) + 10,
      size: `${(Math.random() * 100 + 50).toFixed(1)} MB`,
      lastBackup: new Date(Date.now() - Math.random() * 86400000)
    },
    files: {
      status: Math.random() > 0.2 ? 'healthy' : 'warning',
      totalSize: `${(Math.random() * 500 + 200).toFixed(1)} MB`,
      orphanedFiles: Math.floor(Math.random() * 10),
      cacheSize: `${(Math.random() * 50 + 10).toFixed(1)} MB`
    },
    performance: {
      status: Math.random() > 0.15 ? 'healthy' : 'warning',
      avgLoadTime: Math.random() * 1.5 + 1.2, // 1.2-2.7s
      errorRate: Math.random() * 2, // 0-2%
      uptime: Math.random() * 10 + 95 // 95-99%
    },
    security: {
      status: Math.random() > 0.05 ? 'healthy' : 'warning',
      lastSecurityScan: new Date(Date.now() - Math.random() * 604800000),
      vulnerabilities: Math.floor(Math.random() * 3),
      sslStatus: Math.random() > 0.1 ? 'valid' : 'warning'
    }
  })

  // Cargar datos iniciales
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [healthData, tasksData] = await Promise.all([
        maintenanceAPI.getSystemHealth(),
        maintenanceAPI.getMaintenanceTasks()
      ])
      
      setSystemHealth(healthData)
      
      // Asegurar que las fechas sean objetos Date válidos
      const processedTasks = tasksData.map(task => ({
        ...task,
        lastRun: task.lastRun ? new Date(task.lastRun) : null,
        nextDue: new Date(task.nextDue)
      }))
      
      setTasks(processedTasks)
      setLastUpdate(new Date())
      
      toast({
        title: "Datos actualizados",
        description: "Información del sistema cargada correctamente",
      })
    } catch (error) {
    // console.error('Error loading maintenance data:', error)
      setError('Error al cargar datos del sistema')
      
      // Usar datos por defecto en caso de error
      setTasks(defaultTasks)
      setSystemHealth(generateSystemHealth())
      
      toast({
        title: "Error de conexión",
        description: "Usando datos de ejemplo. Algunos datos pueden no estar actualizados.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    
    // Actualizar datos cada 2 minutos
    const interval = setInterval(() => {
      loadData()
    }, 120000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'running': return 'text-blue-600 bg-blue-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'pending': return 'text-gray-600 bg-gray-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database': return Database
      case 'files': return HardDrive
      case 'performance': return Zap
      case 'security': return Shield
      case 'updates': return RefreshCw
      default: return Settings
    }
  }

  const runTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    setRunningTasks(prev => new Set([...Array.from(prev), taskId]))
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'running' } : t
    ))

    toast({
      title: "Ejecutando tarea",
      description: `Iniciando: ${task.title}`,
    })
    
    try {
      // Ejecutar tarea real usando la API
      const result = await maintenanceAPI.runTask(taskId)
      
      if (result.success) {
        // Actualizar estado de la tarea
        const nextDue = new Date(Date.now() + getDaysForFrequency(task.frequency) * 86400000)
        
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { 
            ...t, 
            status: 'completed', 
            lastRun: new Date(),
            nextDue
          } : t
        ))

        toast({
          title: "Tarea completada",
          description: result.message || `${task.title} ejecutada exitosamente`,
        })

        // Recargar datos del sistema
        setTimeout(() => {
          loadData()
        }, 1000)
      } else {
        throw new Error(result.message || 'Error desconocido')
      }
    } catch (error) {
    // console.error('Error executing task:', error)
      
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'pending' } : t
      ))

      toast({
        title: "Error en tarea",
        description: `Error ejecutando ${task.title}: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setRunningTasks(prev => {
        const newSet = new Set(Array.from(prev))
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  const getDaysForFrequency = (frequency: string): number => {
    switch (frequency.toLowerCase()) {
      case 'diario': return 1
      case 'semanal': return 7
      case 'quincenal': return 15
      case 'mensual': return 30
      default: return 7
    }
  }

  const runAllPendingTasks = async () => {
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'overdue')
    
    if (pendingTasks.length === 0) {
      toast({
        title: "No hay tareas pendientes",
        description: "Todas las tareas están al día",
      })
      return
    }

    toast({
      title: "Ejecutando todas las tareas",
      description: `Iniciando ${pendingTasks.length} tareas pendientes`,
    })

    for (const task of pendingTasks) {
      await runTask(task.id)
      // Esperar un poco entre tareas para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    toast({
      title: "Todas las tareas completadas",
      description: `Se ejecutaron ${pendingTasks.length} tareas exitosamente`,
    })
  }

  const getHealthScore = (): number => {
    if (!systemHealth) return 0
    
    let score = 0
    let total = 0
    
    Object.values(systemHealth).forEach(category => {
      if (typeof category === 'object' && 'status' in category) {
        total++
        if (category.status === 'healthy') score += 100
        else if (category.status === 'warning') score += 60
        else score += 20
      }
    })
    
    return Math.round(score / total)
  }

  // Acciones rápidas
  const handleQuickAction = async (action: 'backup' | 'cache' | 'security' | 'update') => {
    try {
      let result
      let actionName = ''
      
      switch (action) {
        case 'backup':
          actionName = 'Backup Manual'
          result = await maintenanceAPI.quickBackup()
          break
        case 'cache':
          actionName = 'Limpiar Cache'
          result = await maintenanceAPI.quickCacheClear()
          break
        case 'security':
          actionName = 'Escaneo de Seguridad'
          result = await maintenanceAPI.quickSecurityScan()
          break
        case 'update':
          actionName = 'Actualizar Todo'
          result = await maintenanceAPI.quickUpdateAll()
          break
      }

      if (result.success) {
        toast({
          title: `${actionName} completado`,
          description: result.message,
        })
        // Recargar datos
        setTimeout(() => loadData(), 1000)
      } else {
        throw new Error(result.message || 'Error desconocido')
      }
    } catch (error) {
    // console.error('Error in quick action:', error)
      toast({
        title: "Error en acción rápida",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const overdueTasks = tasks.filter(t => t.status === 'overdue').length
  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const healthScore = getHealthScore()

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Centro de Mantenimiento</h1>
          <p className="text-muted-foreground">Cargando datos del sistema...</p>
        </div>
        <div className="flex justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Centro de Mantenimiento</h1>
        <p className="text-muted-foreground">
          Mantenimiento automático y salud del sistema • {error && (
            <span className="text-red-500">Modo offline</span>
          )}
        </p>
        {error && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error} - Mostrando datos de ejemplo. Verifica tu conexión.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Salud General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{healthScore}%</div>
            <Progress value={healthScore} className="w-full" />
            <p className="text-xs text-muted-foreground mt-1">
              {healthScore >= 90 ? 'Excelente' : 
               healthScore >= 70 ? 'Bueno' : 
               healthScore >= 50 ? 'Regular' : 'Crítico'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Tareas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{pendingTasks + overdueTasks}</div>
            <div className="flex gap-2">
              {overdueTasks > 0 && (
                <Badge className="text-red-600 bg-red-100">
                  {overdueTasks} vencidas
                </Badge>
              )}
              {pendingTasks > 0 && (
                <Badge className="text-yellow-600 bg-yellow-100">
                  {pendingTasks} pendientes
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Próxima Tarea
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 && (
              <>
                <div className="text-sm font-medium mb-1">
                  {tasks.sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())[0].title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(tasks.sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())[0].nextDue).toLocaleDateString()}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runAllPendingTasks}
              disabled={runningTasks.size > 0}
              className="w-full"
              size="sm"
            >
              {runningTasks.size > 0 ? 'Ejecutando...' : 'Ejecutar Todo'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Health Details */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="w-4 h-4" />
                Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={getStatusColor(systemHealth.database.status)}>
                  {systemHealth.database.status === 'healthy' ? 'Saludable' : 'Advertencia'}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  <div>Tamaño: {systemHealth.database.size}</div>
                  <div>Conexiones: {systemHealth.database.connections}</div>
                  <div>Último backup: {new Date(systemHealth.database.lastBackup).toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Archivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={getStatusColor(systemHealth.files.status)}>
                  {systemHealth.files.status === 'healthy' ? 'Saludable' : 'Advertencia'}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  <div>Tamaño total: {systemHealth.files.totalSize}</div>
                  <div>Cache: {systemHealth.files.cacheSize}</div>
                  <div>Archivos huérfanos: {systemHealth.files.orphanedFiles}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={getStatusColor(systemHealth.performance.status)}>
                  {systemHealth.performance.status === 'healthy' ? 'Saludable' : 'Advertencia'}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  <div>Load time: {systemHealth.performance.avgLoadTime.toFixed(2)}s</div>
                  <div>Error rate: {systemHealth.performance.errorRate.toFixed(1)}%</div>
                  <div>Uptime: {systemHealth.performance.uptime.toFixed(1)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={getStatusColor(systemHealth.security.status)}>
                  {systemHealth.security.status === 'healthy' ? 'Seguro' : 'Advertencia'}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  <div>Vulnerabilidades: {systemHealth.security.vulnerabilities}</div>
                  <div>SSL: {systemHealth.security.sslStatus === 'valid' ? 'Válido' : 'Advertencia'}</div>
                  <div>Último scan: {new Date(systemHealth.security.lastSecurityScan).toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Tareas de Mantenimiento
            </span>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData()}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => {
              const Icon = getCategoryIcon(task.category)
              const isRunning = runningTasks.has(task.id)
              
              return (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-1 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority === 'high' ? 'Alta' : 
                           task.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status === 'pending' ? 'Pendiente' :
                           task.status === 'running' ? 'Ejecutando' :
                           task.status === 'completed' ? 'Completada' :
                           task.status === 'overdue' ? 'Vencida' : task.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {task.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        <div>Frecuencia: {task.frequency} • Duración estimada: {task.estimatedTime} min</div>
                        <div>
                          {task.lastRun 
                            ? `Última ejecución: ${new Date(task.lastRun).toLocaleDateString()}`
                            : 'Nunca ejecutada'
                          } • Próxima: {new Date(task.nextDue).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.autoRun && (
                      <Badge variant="outline" className="text-xs">
                        Auto
                      </Badge>
                    )}
                    <Button
                      onClick={() => runTask(task.id)}
                      disabled={isRunning || task.status === 'running'}
                      size="sm"
                      variant={task.status === 'overdue' ? 'destructive' : 'outline'}
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          Ejecutando
                        </>
                      ) : (
                        'Ejecutar'
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickAction('backup')}
              disabled={runningTasks.size > 0}
            >
              <Download className="w-6 h-6" />
              <span className="text-sm">Backup Manual</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickAction('cache')}
              disabled={runningTasks.size > 0}
            >
              <Trash2 className="w-6 h-6" />
              <span className="text-sm">Limpiar Cache</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickAction('update')}
              disabled={runningTasks.size > 0}
            >
              <RefreshCw className="w-6 h-6" />
              <span className="text-sm">Actualizar Todo</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickAction('security')}
              disabled={runningTasks.size > 0}
            >
              <Shield className="w-6 h-6" />
              <span className="text-sm">Scan Seguridad</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}