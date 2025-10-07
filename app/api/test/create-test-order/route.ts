import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        console.log('Creating test order...');

        // First, let's check if we have any drivers
        const drivers = await prisma.deliveryPerson.findMany();
        console.log('Available drivers:', drivers.length);

        if (drivers.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No drivers available for test order'
            }, { status: 400 });
        }

        const firstDriver = drivers[0];

        // Create or find a test customer
        let testCustomer = await prisma.customer.findFirst({
            where: { email: 'test@example.com' }
        });

        if (!testCustomer) {
            testCustomer = await prisma.customer.create({
                data: {
                    firstName: 'Test',
                    lastName: 'Customer',
                    email: 'test@example.com',
                    phone: '+1234567890',
                    address: '123 Test Street',
                    city: 'Test City',
                    zipCode: '12345'
                }
            });
        }

        // Create a test order
        const testOrder = await prisma.order.create({
            data: {
                orderNumber: `TEST-${Date.now()}`,
                status: 'DELIVERED',
                total: 25.99,
                deliveryAddress: '123 Test Street, Test City, TC 12345',
                notes: 'Test order for delivery workflow',
                customerId: testCustomer.id,
                deliveryPersonId: firstDriver.id
            },
            include: {
                customer: true,
                deliveryPerson: true
            }
        });

        console.log('Test order created:', testOrder.id);

        return NextResponse.json({
            success: true,
            message: 'Test order created successfully',
            order: testOrder
        });

    } catch (error) {
        console.error('Error creating test order:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to create test order',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}