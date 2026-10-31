import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { adminImageUploadSchema } from '@/lib/validations/admin'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary credentials not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const parsedMeta = adminImageUploadSchema.safeParse({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category: String(formData.get('category') || 'otros'),
      productCode: String(formData.get('productCode') || ''),
    })

    if (!parsedMeta.success) {
      return NextResponse.json(
        { error: parsedMeta.error.issues[0]?.message || 'Archivo de imagen inválido' },
        { status: 400 }
      )
    }

    const category = parsedMeta.data.category.toLowerCase().trim() || 'otros'
    const productCode = parsedMeta.data.productCode

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`

    const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
    const cleanName = originalName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')

    const timestamp = Math.round(new Date().getTime() / 1000)
    const folder = `joyas-jp-ecommerce/${category}`
    const publicId = productCode ? `${productCode}_${cleanName}` : cleanName

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
      fileSize: file.size,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
