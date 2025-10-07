import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        console.log('📍 Location update request received');

        const body = await request.json();
        const { latitude, longitude, orderId } = body;

        console.log('📊 Request body:', { latitude, longitude, orderId });

        // Validación básica
        if (!latitude || !longitude) {
            console.log('❌ Missing latitude or longitude');
            return NextResponse.json(
                { message: 'Latitude and longitude are required' },
                { status: 400 }
            );
        }

        // Obtener el token del header Authorization
        const authHeader = request.headers.get('authorization');
        console.log('🔑 Auth header:', authHeader ? 'Present' : 'Missing');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Invalid or missing authorization header');
            return NextResponse.json(
                { message: 'Authorization token required' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        console.log('🎫 Token extracted:', token.substring(0, 20) + '...');

        // Verificar el token
        let driverId;
        try {
            const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
            driverId = decoded.driverId;
            console.log('✅ Token verified, driver ID:', driverId);
        } catch (error) {
            console.log('❌ Token verification failed:', error);
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Verificar que el driver existe
        const driver = await prisma.deliveryPerson.findUnique({
            where: { id: driverId }
        });

        if (!driver) {
            return NextResponse.json(
                { message: 'Driver not found' },
                { status: 404 }
            );
        }

        // Actualizar la ubicación del driver
        const updatedDriver = await prisma.deliveryPerson.update({
            where: { id: driverId },
            data: {
                // Asumiendo que agregaremos estos campos al schema
                currentLatitude: parseFloat(latitude.toString()),
                currentLongitude: parseFloat(longitude.toString()),
                lastLocationUpdate: new Date(),
                updatedAt: new Date()
            }
        });

        console.log(`Driver ${driverId} location updated: ${latitude}, ${longitude}`);

        return NextResponse.json({
            success: true,
            message: 'Location updated successfully',
            driver: {
                id: updatedDriver.id,
                latitude: updatedDriver.currentLatitude,
                longitude: updatedDriver.currentLongitude,
                lastUpdate: updatedDriver.lastLocationUpdate
            }
        });

    } catch (error) {
        console.error('Error updating driver location:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}