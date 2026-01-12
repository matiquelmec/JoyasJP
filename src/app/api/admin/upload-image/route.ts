import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase-client'
import { verifyAdminAuth } from '@/lib/admin-auth'

// Fallback client if admin client is not available
function getSupabaseClient() {
  if (supabaseAdmin) {
    return { client: supabaseAdmin, isAdmin: true }
  }

  // Using regular client as fallback
  return { client: supabase, isAdmin: false }
}

// Generar nombre único para el archivo
function generateFileName(originalName: string, productCode?: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'

  // Si hay código de producto, usarlo como prefijo
  if (productCode) {
    return `${productCode}_${timestamp}_${randomString}.${extension}`
  }

  // Sino, usar timestamp y random string
  return `product_${timestamp}_${randomString}.${extension}`
}

export async function POST(request: NextRequest) {
  // Verificar autenticación
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { client, isAdmin } = getSupabaseClient()

    if (!client) {
      return NextResponse.json({ error: 'Database client not available' }, { status: 500 })
    }

    // Obtener el FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'otros'
    const productCode = formData.get('productCode') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }


    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Only JPEG, PNG and WebP are allowed.'
      }, { status: 400 })
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 5MB.'
      }, { status: 400 })
    }

    // Convertir File a ArrayBuffer y luego a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generar nombre único para el archivo
    const fileName = generateFileName(file.name, productCode || undefined)
    const filePath = `${category}/${fileName}`


    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await client.storage
      .from('joyas-jp-ecommerce')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      // Si el archivo ya existe, intentar con un nombre diferente
      if (uploadError.message?.includes('already exists')) {
        const altFileName = generateFileName(file.name)
        const altFilePath = `${category}/${altFileName}`

        const { data: retryData, error: retryError } = await client.storage
          .from('joyas-jp-ecommerce')
          .upload(altFilePath, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          })

        if (retryError) {
          throw retryError
        }

        // Obtener URL pública del archivo subido (intento alternativo)
        const { data: publicUrlData } = client.storage
          .from('joyas-jp-ecommerce')
          .getPublicUrl(altFilePath)


        return NextResponse.json({
          success: true,
          fileName: altFileName,
          filePath: altFilePath,
          publicUrl: publicUrlData.publicUrl,
          fileSize: file.size
        })
      }

      throw uploadError
    }

    // Obtener URL pública del archivo subido
    const { data: publicUrlData } = client.storage
      .from('joyas-jp-ecommerce')
      .getPublicUrl(filePath)


    return NextResponse.json({
      success: true,
      fileName,
      filePath,
      publicUrl: publicUrlData.publicUrl,
      fileSize: file.size
    })

  } catch (error) {
    // console.error('💥 Upload error:', error)
    return NextResponse.json({
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}