import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { path, tag } = await request.json()

    if (path) {
      // Revalidar una ruta específica
      revalidatePath(path)
      return NextResponse.json({ revalidated: true, path })
    }

    if (tag) {
      // Revalidar por tag
      revalidateTag(tag)
      return NextResponse.json({ revalidated: true, tag })
    }

    // Revalidar todas las páginas de productos
    revalidatePath('/productos', 'page')
    revalidatePath('/productos/[id]', 'page')

    return NextResponse.json({ revalidated: true, message: 'All product pages revalidated' })
  } catch (error) {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 })
  }
}