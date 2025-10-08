import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Debug: Fetching all drivers with location data');

        // Obtener todos los drivers con sus coordenadas
        const drivers = await prisma.deliveryPerson.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                isOnline: true,
                currentLatitude: true,
                currentLongitude: true,
                lastLocationUpdate: true,
                updatedAt: true,
            }
        });

        console.log(`📊 Found ${drivers.length} drivers in database`);

        const driversWithLocation = drivers.filter(
            driver => driver.currentLatitude !== null && driver.currentLongitude !== null
        );

        console.log(`📍 ${driversWithLocation.length} drivers have location data`);

        return NextResponse.json({
            success: true,
            totalDrivers: drivers.length,
            driversWithLocation: driversWithLocation.length,
            drivers: drivers.map(driver => ({
                id: driver.id,
                name: `${driver.firstName} ${driver.lastName}`,
                email: driver.email,
                phone: driver.phone,
                isOnline: driver.isOnline,
                location: {
                    latitude: driver.currentLatitude,
                    longitude: driver.currentLongitude,
                    lastUpdate: driver.lastLocationUpdate,
                    hasLocation: driver.currentLatitude !== null && driver.currentLongitude !== null
                },
                lastUpdated: driver.updatedAt
            }))
        });

    } catch (error) {
        console.error('❌ Error fetching driver locations:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch driver locations',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}