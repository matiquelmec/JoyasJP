import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  // Verificar autenticación
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary credentials not configured' }, { status: 500 })
    }

    // Obtener el FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    const rawCategory = formData.get('category') as string || 'otros'
    const category = rawCategory.toLowerCase().trim()
    const productCode = formData.get('productCode') as string || ''

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

    // Convertir File a ArrayBuffer y luego a base64 para subir a Cloudinary
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`

    // 🏷️ GENERACIÓN DE NOMBRE DE ARCHIVO (public_id) ORDENADO
    const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
    const cleanName = originalName
      .toLowerCase()
      .normalize('NFD') // Eliminar acentos y diacríticos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/g, '_') // Caracteres especiales a guion bajo
      .replace(/_+/g, '_') // Evitar guiones bajos repetidos
      .replace(/^_+|_+$/g, '') // Quitar guiones al inicio o final

    const timestamp = Math.round((new Date()).getTime() / 1000)
    const folder = `joyas-jp-ecommerce/${category}`
    
    // Si viene código de producto (ej: PCP_31), lo usamos como prefijo para ordenar
    const publicId = productCode 
      ? `${productCode}_${cleanName}`
      : cleanName

    // Preparar firma y parámetros de Cloudinary
    const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex')

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

    const uploadFormData = new FormData()
    uploadFormData.append('file', base64Image)
    uploadFormData.append('api_key', apiKey)
    uploadFormData.append('timestamp', timestamp.toString())
    uploadFormData.append('signature', signature)
    uploadFormData.append('folder', folder)
    uploadFormData.append('public_id', publicId)

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: uploadFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary')
    }

    const uploadData = await response.json()

    return NextResponse.json({
      success: true,
      fileName: file.name,
      filePath: uploadData.public_id,
      publicUrl: uploadData.secure_url,
      fileSize: file.size
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}