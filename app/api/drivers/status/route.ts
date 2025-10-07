import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function PUT(request: NextRequest) {
    try {
        // Obtener el token del header Authorization
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Authorization token required' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        // Verificar el token JWT
        let driverId: string;
        try {
            const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
            driverId = decoded.driverId;
        } catch (error) {
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { isOnline } = body;

        if (typeof isOnline !== 'boolean') {
            return NextResponse.json(
                { message: 'isOnline must be a boolean value' },
                { status: 400 }
            );
        }

        // Actualizar el estado online del driver
        const updatedDriver = await prisma.deliveryPerson.update({
            where: { id: driverId },
            data: { isOnline },
        });

        return NextResponse.json(
            {
                message: `Driver is now ${isOnline ? 'online' : 'offline'}`,
                isOnline: updatedDriver.isOnline,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Update online status error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}