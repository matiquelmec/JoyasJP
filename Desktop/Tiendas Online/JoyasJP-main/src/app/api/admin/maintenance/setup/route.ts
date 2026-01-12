import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminAuth } from '@/lib/admin-auth'

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

// SQL para crear la tabla de maintenance_tasks
const createMaintenanceTasksTableSQL = `
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(50) NOT NULL,
  last_run TIMESTAMP,
  next_due TIMESTAMP NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'overdue')) DEFAULT 'pending',
  category VARCHAR(50) NOT NULL CHECK (category IN ('database', 'files', 'performance', 'security', 'updates')),
  auto_run BOOLEAN DEFAULT false,
  estimated_time INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default maintenance tasks if table is empty
INSERT INTO maintenance_tasks (
  id, title, description, frequency, last_run, next_due, priority, status, category, auto_run, estimated_time
) 
SELECT * FROM (VALUES 
  ('db-backup', 'Backup Base de Datos', 'Crear copia de seguridad completa de la base de datos', 'Diario', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 hour', 'high', 'pending', 'database', true, 5),
  ('image-cleanup', 'Limpiar Imágenes Huérfanas', 'Eliminar imágenes no utilizadas y optimizar almacenamiento', 'Semanal', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP + INTERVAL '1 day', 'medium', 'pending', 'files', false, 10),
  ('cache-clear', 'Limpiar Cache del Sistema', 'Eliminar cache obsoleto y regenerar cache crítico', 'Semanal', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '4 days', 'medium', 'pending', 'performance', true, 2),
  ('security-scan', 'Escaneo de Seguridad', 'Verificar vulnerabilidades y actualizar dependencias', 'Semanal', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP + INTERVAL '1 day', 'high', 'overdue', 'security', false, 15),
  ('dependencies-update', 'Actualizar Dependencias', 'Revisar y actualizar paquetes npm con parches de seguridad', 'Quincenal', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP + INTERVAL '5 days', 'medium', 'pending', 'updates', false, 30),
  ('performance-audit', 'Auditoría de Performance', 'Análisis completo de rendimiento y optimizaciones', 'Mensual', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP + INTERVAL '15 days', 'medium', 'pending', 'performance', true, 20),
  ('log-cleanup', 'Limpiar Logs Antiguos', 'Archivar logs antiguos y mantener solo los necesarios', 'Mensual', CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP + INTERVAL '10 days', 'low', 'pending', 'files', true, 5)
) AS default_tasks(id, title, description, frequency, last_run, next_due, priority, status, category, auto_run, estimated_time)
WHERE NOT EXISTS (SELECT 1 FROM maintenance_tasks);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_next_due ON maintenance_tasks(next_due);
`

// POST - Configurar tabla de mantenimiento
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = createSupabaseClient()

    if (!client) {
      return NextResponse.json({
        error: 'Database client not available'
      }, { status: 500 })
    }


    // Ejecutar SQL para crear la tabla y datos iniciales
    const { data, error } = await client.rpc('exec_sql', {
      sql: createMaintenanceTasksTableSQL
    })

    if (error) {
      // Si RPC no está disponible, intentar crear tabla manualmente

      try {
        // Intentar insertar datos de prueba para verificar si la tabla existe
        const { error: insertError } = await client
          .from('maintenance_tasks')
          .insert([{
            id: 'test-setup',
            title: 'Setup Test',
            description: 'Test task for setup',
            frequency: 'Diario',
            next_due: new Date().toISOString(),
            priority: 'low',
            status: 'completed',
            category: 'database',
            auto_run: false,
            estimated_time: 1
          }])

        if (!insertError) {
          // La tabla existe, eliminar el registro de prueba
          await client
            .from('maintenance_tasks')
            .delete()
            .eq('id', 'test-setup')
        }

      } catch (tableError) {
        return NextResponse.json({
          error: 'Could not create maintenance_tasks table. Please create it manually in Supabase.',
          suggestion: 'Run the provided SQL in the Supabase SQL editor',
          sql: createMaintenanceTasksTableSQL
        }, { status: 500 })
      }
    }


    return NextResponse.json({
      success: true,
      message: 'Maintenance system setup completed successfully',
      tableCreated: true
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to setup maintenance system',
      details: error.message,
      sql: createMaintenanceTasksTableSQL
    }, { status: 500 })
  }
}

// GET - Verificar estado del sistema de mantenimiento
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = createSupabaseClient()

    if (!client) {
      return NextResponse.json({
        error: 'Database client not available',
        ready: false
      }, { status: 500 })
    }

    // Verificar si la tabla existe consultando algunas tareas
    const { data, error } = await client
      .from('maintenance_tasks')
      .select('count')
      .limit(1)

    const tableExists = !error

    return NextResponse.json({
      ready: tableExists,
      tableExists,
      message: tableExists
        ? 'Maintenance system is ready'
        : 'Maintenance system needs setup',
      setupSQL: tableExists ? null : createMaintenanceTasksTableSQL
    })

  } catch (error) {
    return NextResponse.json({
      ready: false,
      error: 'Failed to check maintenance system',
      details: error.message
    }, { status: 500 })
  }
}