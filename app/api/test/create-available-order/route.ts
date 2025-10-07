import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        console.log('Creating test order without driver assignment...');

        // Create or find a test customer
        let testCustomer = await prisma.customer.findFirst({
            where: { email: 'test-customer@example.com' }
        });

        if (!testCustomer) {
            testCustomer = await prisma.customer.create({
                data: {
                    firstName: 'Test',
                    lastName: 'Customer',
                    email: 'test-customer@example.com',
                    phone: '+1234567890',
                    address: '123 Test Street',
                    city: 'Test City',
                    zipCode: '12345'
                }
            });
        }

        // Get or create a test product
        let testProduct = await prisma.product.findFirst({
            where: { name: 'Test Sandwich' }
        });

        if (!testProduct) {
            // Get first category
            const category = await prisma.category.findFirst();
            if (!category) {
                return NextResponse.json({
                    success: false,
                    message: 'No categories found'
                }, { status: 400 });
            }

            testProduct = await prisma.product.create({
                data: {
                    name: 'Test Sandwich',
                    description: 'A delicious test sandwich',
                    price: 12.99,
                    stock: 100,
                    categoryId: category.id,
                    isActive: true
                }
            });
        }

        // Create a test order WITHOUT driver assignment
        const testOrder = await prisma.order.create({
            data: {
                orderNumber: `PENDING-${Date.now()}`,
                status: 'PENDING',  // ⭐ Estado PENDING
                total: 12.99,
                deliveryAddress: '456 Available Street, Driver City, DC 67890',
                notes: 'Test order available for drivers to accept',
                customerId: testCustomer.id,
                deliveryPersonId: null,  // ⭐ Sin driver asignado
            },
            include: {
                customer: true,
                deliveryPerson: true,
            }
        });

        // Create order item
        await prisma.orderItem.create({
            data: {
                orderId: testOrder.id,
                productId: testProduct.id,
                quantity: 1,
                price: testProduct.price
            }
        });

        console.log('Test order created successfully:', testOrder.orderNumber);

        return NextResponse.json({
            success: true,
            message: 'Test order created successfully',
            order: {
                id: testOrder.id,
                orderNumber: testOrder.orderNumber,
                status: testOrder.status,
                total: testOrder.total,
                deliveryAddress: testOrder.deliveryAddress,
                customer: testOrder.customer,
                deliveryPersonId: testOrder.deliveryPersonId
            }
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