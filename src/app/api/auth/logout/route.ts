import { NextResponse } from 'next/server'
import { ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

function buildLogoutResponse() {
  const response = NextResponse.json({ success: true, message: 'Sesión administrativa cerrada' })
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function POST() {
  return buildLogoutResponse()
}

export async function DELETE() {
  return buildLogoutResponse()
}
