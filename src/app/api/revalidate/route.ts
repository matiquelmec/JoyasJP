import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { path, tag } = await request.json()

    if (path) {
      revalidatePath(path)
      return NextResponse.json({ revalidated: true, path })
    }

    if (tag) {
      revalidateTag(tag)
      return NextResponse.json({ revalidated: true, tag })
    }

    revalidatePath('/', 'layout')
    revalidatePath('/productos', 'page')
    revalidatePath('/productos/[id]', 'page')

    return NextResponse.json({ revalidated: true, message: 'All product pages revalidated' })
  } catch (error) {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 })
  }
}
