import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()
        const expectedPassword = process.env.ADMIN_API_KEY || 'joyasjp2024'

        // Fail secure if no key configured (should not happen with fallback)
        if (!expectedPassword) {
            console.error('❌ ADMIN_API_KEY missing in environment')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        if (password === expectedPassword) {
            // Return success. In a real app, we'd return a JWT here.
            // For now, confirming the password is valid is enough for the client to store it as a "token"
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
