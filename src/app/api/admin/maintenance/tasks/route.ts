import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Verificar contraseña de admin
function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedPassword = 'joyasjp2024'
  
  if (!authHeader || authHeader !== `Bearer ${expectedPassword}`) {
    return false
  }
  return true
}

// Crear cliente Supabase
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Crear tabla de maintenance_tasks si no existe
async function ensureMaintenanceTable(client: any) {
  try {
    // Intentar crear la tabla
    const { error } = await client.rpc('create_maintenance_tasks_table', {})
    if (error && !error.message.includes('already exists')) {
      console.warn('Could not create maintenance_tasks table:', error)
    }
  } catch (error) {
    console.warn('Could not ensure maintenance_tasks table:', error)
  }
}

// Obtener tareas desde la base de datos o crear las por defecto
async function getMaintenanceTasks(client: any) {
  try {
    // Intentar obtener tareas existentes
    const { data: existingTasks, error } = await client
      .from('maintenance_tasks')
      .select('*')
      .order('next_due', { ascending: true })

    if (error || !existingTasks || existingTasks.length === 0) {
      // Si no hay tareas o hay error, usar las tareas por defecto
      return getDefaultTasks()
    }

    // Mapear tareas de la BD al formato esperado
    return existingTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      frequency: task.frequency,
      lastRun: task.last_run ? new Date(task.last_run) : null,
      nextDue: new Date(task.next_due),
      priority: task.priority,
      status: task.status,
      category: task.category,
      autoRun: task.auto_run,
      estimatedTime: task.estimated_time
    }))
  } catch (error) {
    console.error('Error getting maintenance tasks:', error)
    return getDefaultTasks()
  }
}

// Tareas por defecto
function getDefaultTasks() {
  const now = new Date()
  
  return [
    {
      id: 'db-backup',
      title: 'Backup Base de Datos',
      description: 'Crear copia de seguridad completa de la base de datos',
      frequency: 'Diario',
      lastRun: new Date(now.getTime() - 86400000), // Ayer
      nextDue: new Date(now.getTime() + 3600000), // En 1 hora
      priority: 'high' as const,
      status: 'pending' as const,
      category: 'database' as const,
      autoRun: true,
      estimatedTime: 5
    },
    {
      id: 'image-cleanup',
      title: 'Limpiar Imágenes Huérfanas',
      description: 'Eliminar imágenes no utilizadas y optimizar almacenamiento',
      frequency: 'Semanal',
      lastRun: new Date(now.getTime() - 604800000), // Hace 1 semana
      nextDue: new Date(now.getTime() + 86400000), // Mañana
      priority: 'medium' as const,
      status: 'pending' as const,
      category: 'files' as const,
      autoRun: false,
      estimatedTime: 10
    },
    {
      id: 'cache-clear',
      title: 'Limpiar Cache del Sistema',
      description: 'Eliminar cache obsoleto y regenerar cache crítico',
      frequency: 'Semanal',
      lastRun: new Date(now.getTime() - 86400000 * 3), // Hace 3 días
      nextDue: new Date(now.getTime() + 86400000 * 4), // En 4 días
      priority: 'medium' as const,
      status: 'pending' as const,
      category: 'performance' as const,
      autoRun: true,
      estimatedTime: 2
    },
    {
      id: 'security-scan',
      title: 'Escaneo de Seguridad',
      description: 'Verificar vulnerabilidades y actualizar dependencias',
      frequency: 'Semanal',
      lastRun: new Date(now.getTime() - 86400000 * 7), // Hace 1 semana
      nextDue: new Date(now.getTime() + 86400000), // Mañana
      priority: 'high' as const,
      status: 'overdue' as const,
      category: 'security' as const,
      autoRun: false,
      estimatedTime: 15
    },
    {
      id: 'dependencies-update',
      title: 'Actualizar Dependencias',
      description: 'Revisar y actualizar paquetes npm con parches de seguridad',
      frequency: 'Quincenal',
      lastRun: new Date(now.getTime() - 86400000 * 10), // Hace 10 días
      nextDue: new Date(now.getTime() + 86400000 * 5), // En 5 días
      priority: 'medium' as const,
      status: 'pending' as const,
      category: 'updates' as const,
      autoRun: false,
      estimatedTime: 30
    },
    {
      id: 'performance-audit',
      title: 'Auditoría de Performance',
      description: 'Análisis completo de rendimiento y optimizaciones',
      frequency: 'Mensual',
      lastRun: new Date(now.getTime() - 86400000 * 15), // Hace 15 días
      nextDue: new Date(now.getTime() + 86400000 * 15), // En 15 días
      priority: 'medium' as const,
      status: 'pending' as const,
      category: 'performance' as const,
      autoRun: true,
      estimatedTime: 20
    },
    {
      id: 'log-cleanup',
      title: 'Limpiar Logs Antiguos',
      description: 'Archivar logs antiguos y mantener solo los necesarios',
      frequency: 'Mensual',
      lastRun: new Date(now.getTime() - 86400000 * 20), // Hace 20 días
      nextDue: new Date(now.getTime() + 86400000 * 10), // En 10 días
      priority: 'low' as const,
      status: 'pending' as const,
      category: 'files' as const,
      autoRun: true,
      estimatedTime: 5
    }
  ]
}

// GET - Obtener todas las tareas de mantenimiento
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = createSupabaseClient()
    
    if (!client) {
      return NextResponse.json({ 
        error: 'Database client not available',
        tasks: getDefaultTasks()
      }, { status: 500 })
    }

    const tasks = await getMaintenanceTasks(client)

    return NextResponse.json({ 
      tasks,
      success: true 
    })

  } catch (error) {
    console.error('Error getting maintenance tasks:', error)
    return NextResponse.json({ 
      error: 'Failed to get maintenance tasks',
      details: error.message,
      tasks: getDefaultTasks()
    }, { status: 500 })
  }
}

// POST - Actualizar estado de una tarea
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { taskId, status, lastRun, nextDue } = await request.json()
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }

    const client = createSupabaseClient()
    
    if (!client) {
      return NextResponse.json({ 
        error: 'Database client not available'
      }, { status: 500 })
    }

    // Intentar actualizar en la base de datos
    try {
      const updateData = {
        status: status || 'completed',
        last_run: lastRun || new Date().toISOString(),
        next_due: nextDue || new Date(Date.now() + 86400000).toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await client
        .from('maintenance_tasks')
        .update(updateData)
        .eq('id', taskId)

      if (error) {
        console.warn('Could not update task in database:', error)
      }
    } catch (dbError) {
      console.warn('Database update failed:', dbError)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Task updated successfully'
    })

  } catch (error) {
    console.error('Error updating maintenance task:', error)
    return NextResponse.json({ 
      error: 'Failed to update maintenance task',
      details: error.message 
    }, { status: 500 })
  }
}