import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Email',
};

export async function POST(request: NextRequest) {
    console.log('🧪 Testing complete mobile order flow...');

    try {
        // Simulate a complete mobile order
        const testOrderData = {
            orderNumber: `TEST-MOBILE-${Date.now()}`,
            customerEmail: 'mobile.test@iceboxt.com',
            totalAmount: 25.50,
            deliveryAddress: '123 Mobile Test Street',
            deliveryCity: 'Test City',
            customerNotes: 'This is a complete test of mobile order flow',
            adminNotes: 'Test order created to verify mobile-to-database integration',
            orderItems: [
                {
                    productName: 'Corona Beer (Test)',
                    quantity: 2,
                    price: 5.50,
                    imageUrl: 'assets/beers/corona.jpg'
                },
                {
                    productName: 'Pizza Margherita (Test)',
                    quantity: 1,
                    price: 14.50,
                    imageUrl: 'assets/foods/pizza.jpg'
                }
            ]
        };

        console.log('📱 Creating test mobile order with data:', JSON.stringify(testOrderData, null, 2));

        // Call the actual mobile order endpoint
        const mobileOrderResponse = await fetch(`${request.nextUrl.origin}/api/orders/mobile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Email': testOrderData.customerEmail,
            },
            body: JSON.stringify(testOrderData),
        });

        const mobileOrderResult = await mobileOrderResponse.json();

        if (!mobileOrderResponse.ok) {
            throw new Error(`Mobile order creation failed: ${mobileOrderResult.error}`);
        }

        console.log('✅ Mobile order created successfully:', mobileOrderResult);

        // Verify the order was actually inserted into the database
        const createdOrder = await prisma.order.findUnique({
            where: {
                orderNumber: testOrderData.orderNumber
            },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        }) as any;

        if (!createdOrder) {
            throw new Error('Order was not found in database after creation');
        }

        console.log('✅ Order verified in database:', createdOrder.id);

        // Get all orders to show the test order exists
        const allOrders = await prisma.order.findMany({
            where: {
                orderNumber: {
                    startsWith: 'TEST-MOBILE-'
                }
            },
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        });

        return NextResponse.json({
            success: true,
            message: 'Complete mobile order flow test successful!',
            testData: {
                orderCreated: {
                    id: createdOrder.id,
                    orderNumber: createdOrder.orderNumber,
                    status: createdOrder.status,
                    total: Number(createdOrder.total),
                    customer: `${(createdOrder as any).customer.firstName} ${(createdOrder as any).customer.lastName}`,
                    itemCount: (createdOrder as any).items.length
                },
                mobileApiResponse: mobileOrderResult,
                recentTestOrders: allOrders.map(order => ({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    total: Number(order.total),
                    customer: `${order.customer.firstName} ${order.customer.lastName}`,
                    createdAt: order.createdAt
                }))
            },
            instructions: {
                mobileAppFlow: [
                    '1. User adds items to cart in mobile app',
                    '2. User clicks "Proceed to checkout"',
                    '3. Mobile app calls Orders().createOrderWithApiSync()',
                    '4. API creates customer if not exists',
                    '5. API creates products if not exist',
                    '6. API creates order with items in PostgreSQL',
                    '7. API returns success response',
                    '8. Mobile app shows success message'
                ],
                testUrls: {
                    createOrder: `${request.nextUrl.origin}/api/orders/mobile`,
                    viewOrders: `${request.nextUrl.origin}/api/orders/mobile`,
                    viewStats: `${request.nextUrl.origin}/api/orders/mobile/stats`
                }
            }
        }, {
            status: 200,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('🚫 Complete flow test failed:', error);
        return NextResponse.json({
            success: false,
            message: 'Complete mobile order flow test failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, {
            status: 500,
            headers: corsHeaders
        });
    }
}

export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, {
        status: 200,
        headers: corsHeaders
    });
}