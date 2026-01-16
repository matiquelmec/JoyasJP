import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyAdminAuth } from '@/lib/admin-auth'

// POST - Configurar la base de datos agregando columnas necesarias

// POST - Configurar la base de datos agregando columnas necesarias
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not available - need SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }

  try {
    // Agregar columna deleted_at a la tabla products
    const { error } = await supabaseAdmin.rpc('add_deleted_at_column', {})

    if (error && error.message.includes('already exists')) {
      return NextResponse.json({
        message: 'Database already configured - deleted_at column exists'
      })
    }

    if (error) {
      // Try alternative SQL approach
      const { error: sqlError } = await supabaseAdmin
        .from('products')
        .select('deleted_at')
        .limit(1)

      if (sqlError && sqlError.message.includes('does not exist')) {
        return NextResponse.json({
          error: 'Could not add deleted_at column. Please add it manually in Supabase dashboard:',
          instructions: [
            '1. Go to your Supabase dashboard',
            '2. Go to Table Editor > products',
            '3. Click "Add Column"',
            '4. Name: deleted_at',
            '5. Type: timestamptz',
            '6. Default: NULL',
            '7. Allow nullable: YES'
          ]
        }, { status: 500 })
      }

      return NextResponse.json({ message: 'Column already exists' })
    }

    return NextResponse.json({
      message: 'Database configured successfully - deleted_at column added'
    })
  } catch (error) {
    // console.error('Error setting up database:', error)
    return NextResponse.json({
      error: 'Failed to setup database',
      details: (error as Error).message || String(error),
      instructions: [
        'Manual setup required:',
        '1. Go to your Supabase dashboard',
        '2. Go to Table Editor > products',
        '3. Click "Add Column"',
        '4. Name: deleted_at',
        '5. Type: timestamptz',
        '6. Default: NULL',
        '7. Allow nullable: YES'
      ]
    }, { status: 500 })
  }
}