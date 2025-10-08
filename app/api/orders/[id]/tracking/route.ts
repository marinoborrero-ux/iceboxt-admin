import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for real-time data - NO CACHE
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        // Add timestamp for fresh data logging
        const requestTimestamp = new Date().toISOString();
        console.log(`🔍 [${requestTimestamp}] Fresh tracking request for order:`, id);

        if (!id) {
            return NextResponse.json(
                { message: 'Order ID is required' },
                {
                    status: 400,
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                        'Surrogate-Control': 'no-store',
                        'X-Accel-Expires': '0',
                        'Vary': '*',
                        'Last-Modified': new Date().toUTCString(),
                        'ETag': `"${Date.now()}"`,
                    }
                }
            );
        }

        // Force fresh data from database - no query caching
        console.log('📊 Executing fresh database query...');

        // Buscar la orden primero por ID, luego por número de orden
        let order = await prisma.order.findUnique({
            where: { id },
            select: {
                id: true,
                orderNumber: true,
                status: true,
                deliveryAddress: true,
                notes: true,
                createdAt: true,
                updatedAt: true, // Include updated timestamp
                deliveryPersonId: true,
                customerId: true
            }
        });

        // Si no se encuentra por ID, intentar por número de orden
        if (!order) {
            console.log('🔍 Order not found by ID, trying by orderNumber:', id);
            order = await prisma.order.findUnique({
                where: { orderNumber: id },
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    deliveryAddress: true,
                    notes: true,
                    createdAt: true,
                    updatedAt: true,
                    deliveryPersonId: true,
                    customerId: true
                }
            });
        }

        if (order) {
            console.log('✅ Order found:', {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                hasDriver: !!order.deliveryPersonId
            });
        }

        if (!order) {
            console.log('❌ Order not found with ID or orderNumber:', id);
            return NextResponse.json(
                { message: 'Order not found' },
                {
                    status: 404,
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                        'Surrogate-Control': 'no-store'
                    }
                }
            );
        }

        // Buscar el driver si está asignado - FRESH DATA
        let driver = null;
        if (order.deliveryPersonId) {
            console.log('🚗 Fetching fresh driver data for:', order.deliveryPersonId);

            const deliveryPerson = await prisma.deliveryPerson.findUnique({
                where: { id: order.deliveryPersonId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    vehicleType: true,
                    licensePlate: true,
                    vehicleColor: true,
                    rating: true,
                    isOnline: true,
                    currentLatitude: true,
                    currentLongitude: true,
                    lastLocationUpdate: true,
                    updatedAt: true // Include timestamp for freshness verification
                }
            });

            if (deliveryPerson) {
                console.log('📍 Driver data fetched at:', new Date().toISOString());
                console.log('📍 Driver last updated:', deliveryPerson.updatedAt);
                console.log('📍 Driver coordinates from DB:', {
                    latitude: deliveryPerson.currentLatitude,
                    longitude: deliveryPerson.currentLongitude,
                    lastLocationUpdate: deliveryPerson.lastLocationUpdate
                });

                driver = {
                    id: deliveryPerson.id,
                    name: `${deliveryPerson.firstName} ${deliveryPerson.lastName}`,
                    phone: deliveryPerson.phone,
                    vehicle: {
                        type: deliveryPerson.vehicleType,
                        licensePlate: deliveryPerson.licensePlate,
                        color: deliveryPerson.vehicleColor
                    },
                    rating: parseFloat(deliveryPerson.rating.toString()),
                    isOnline: deliveryPerson.isOnline,
                    location: {
                        latitude: deliveryPerson.currentLatitude,
                        longitude: deliveryPerson.currentLongitude,
                        lastUpdate: deliveryPerson.lastLocationUpdate || new Date()
                    }
                };
                console.log('📍 Driver info:', {
                    name: driver.name,
                    phone: driver.phone,
                    isOnline: driver.isOnline,
                    vehicle: driver.vehicle,
                    realLocation: driver.location
                });
            }
        }

        // Buscar información del cliente - FRESH DATA
        console.log('👤 Fetching fresh customer data for:', order.customerId);

        const customer = await prisma.customer.findUnique({
            where: { id: order.customerId },
            select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                updatedAt: true // Include timestamp for freshness verification
            }
        });

        // Formatear la respuesta con timestamp de frescura
        const responseTimestamp = new Date().toISOString();
        const trackingInfo = {
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                deliveryAddress: order.deliveryAddress,
                notes: order.notes,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                lastFetched: responseTimestamp // Add freshness indicator
            },
            driver: driver,
            customer: customer ? {
                name: `${customer.firstName} ${customer.lastName}`,
                phone: customer.phone,
                email: customer.email,
                lastUpdated: customer.updatedAt
            } : null,
            meta: {
                fetchedAt: responseTimestamp,
                source: 'database-direct',
                cacheStatus: 'no-cache'
            }
        };

        console.log(`✅ [${responseTimestamp}] Returning fresh tracking data for order:`, order.orderNumber);

        const response = NextResponse.json({
            success: true,
            ...trackingInfo
        });

        // Set comprehensive anti-cache headers
        const currentTime = new Date().toUTCString();
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');
        response.headers.set('X-Accel-Expires', '0');
        response.headers.set('Vary', '*');
        response.headers.set('Last-Modified', currentTime);
        response.headers.set('ETag', `"${Date.now()}-${order.id}"`);
        response.headers.set('X-Fresh-Data', 'true');
        response.headers.set('X-Timestamp', responseTimestamp);

        return response;

    } catch (error) {
        const errorTimestamp = new Date().toISOString();
        console.error(`❌ [${errorTimestamp}] Error fetching order tracking info:`, error);

        const errorResponse = NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: errorTimestamp
            },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'Surrogate-Control': 'no-store',
                    'X-Accel-Expires': '0',
                    'Vary': '*',
                    'Last-Modified': new Date().toUTCString(),
                    'ETag': `"error-${Date.now()}"`,
                    'X-Fresh-Data': 'true',
                    'X-Error-Timestamp': errorTimestamp
                }
            }
        );

        return errorResponse;
    }
}