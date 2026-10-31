import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { revalidatePayloadSchema } from '@/lib/validations/admin'
import { purgeStorefrontCache } from '@/services/order.service'

export async function POST(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await request.json().catch(() => ({}))
    const parsed = revalidatePayloadSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Payload de revalidación inválido' },
        { status: 400 }
      )
    }

    const { path, tag } = parsed.data

    if (path) {
      revalidatePath(path)
      return NextResponse.json({ revalidated: true, path })
    }

    if (tag) {
      revalidateTag(tag)
      return NextResponse.json({ revalidated: true, tag })
    }

    purgeStorefrontCache()

    return NextResponse.json({ revalidated: true, message: 'All product pages revalidated' })
  } catch (error) {
    console.error('Error revalidating:', error)
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 })
  }
}
