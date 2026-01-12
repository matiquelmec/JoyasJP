import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()
        const adminPassword = process.env.ADMIN_API_KEY || 'joyasjp2024'

        if (password === adminPassword) {
            // En un entorno real, aquí se generaría un JWT o sesión persistente.
            // Por ahora, validamos en el servidor para evitar credenciales en el cliente.
            return NextResponse.json({
                success: true,
                message: 'Authenticated successfully'
            })
        }

        return NextResponse.json({
            error: 'Invalid password'
        }, { status: 401 })
    } catch (error) {
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 })
    }
}
