import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Email',
};

export async function POST(request: NextRequest) {
    console.log('🛒 Simulating mobile app checkout...');

    try {
        const body = await request.json();
        const { userEmail, cartItems } = body;

        // Simulate the exact data structure that the mobile app sends
        const orderNumber = `MOB-${Date.now()}`;
        const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0) + 2.50; // Add delivery fee

        const mobileOrderData = {
            orderNumber,
            customerEmail: userEmail || 'checkout.test@iceboxt.com',
            totalAmount: total,
            deliveryAddress: 'Customer address (to be collected)',
            deliveryCity: 'Customer city',
            customerNotes: `Mobile order - ${cartItems.length} items`,
            adminNotes: 'Order created from mobile app checkout simulation',
            orderItems: cartItems.map((item: any) => ({
                productName: item.name,
                quantity: item.qty,
                price: item.price,
                imageUrl: item.imageUrl || 'default-image.jpg'
            }))
        };

        console.log('📱 Mobile checkout data:', JSON.stringify(mobileOrderData, null, 2));

        // Call the mobile orders API (same as the mobile app does)
        const response = await fetch(`${request.nextUrl.origin}/api/orders/mobile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Email': mobileOrderData.customerEmail,
            },
            body: JSON.stringify(mobileOrderData),
        });

        const result = await response.json();

        console.log('📥 API Response:', result);

        if (response.ok) {
            return NextResponse.json({
                success: true,
                message: 'Mobile checkout simulation successful!',
                checkoutData: {
                    orderNumber,
                    customerEmail: mobileOrderData.customerEmail,
                    totalAmount: total,
                    itemCount: cartItems.length,
                    deliveryAddress: mobileOrderData.deliveryAddress
                },
                apiResponse: result,
                nextSteps: [
                    '✅ Order created in PostgreSQL database',
                    '✅ Customer created/found in database',
                    '✅ Products created/found in database',
                    '✅ Order items linked to products',
                    '📱 Mobile app would show success message',
                    '🛒 Mobile app would clear cart',
                    '📧 Email confirmation could be sent',
                    '🚚 Order ready for delivery assignment'
                ]
            }, {
                status: 200,
                headers: corsHeaders
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Mobile checkout simulation failed',
                error: result.error || 'Unknown API error',
                checkoutData: mobileOrderData
            }, {
                status: 400,
                headers: corsHeaders
            });
        }

    } catch (error) {
        console.error('🚫 Checkout simulation error:', error);
        return NextResponse.json({
            success: false,
            message: 'Checkout simulation failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500,
            headers: corsHeaders
        });
    }
}

export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: 'Mobile Checkout Simulation Endpoint',
        description: 'This endpoint simulates the exact checkout process from the mobile app',
        usage: {
            method: 'POST',
            url: `${request.nextUrl.origin}/api/orders/mobile/simulate-checkout`,
            body: {
                userEmail: 'user@example.com',
                cartItems: [
                    {
                        name: 'Corona Beer',
                        price: 5.50,
                        qty: 2,
                        imageUrl: 'assets/beers/corona.jpg'
                    },
                    {
                        name: 'Pizza Margherita',
                        price: 14.50,
                        qty: 1,
                        imageUrl: 'assets/foods/pizza.jpg'
                    }
                ]
            }
        },
        testFlow: [
            '1. Send POST request with cart data',
            '2. Endpoint simulates mobile app createOrderWithApiSync()',
            '3. Order gets inserted into PostgreSQL',
            '4. Response shows success/failure',
            '5. Check database to verify order exists'
        ]
    }, {
        status: 200,
        headers: corsHeaders
    });
}

export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, {
        status: 200,
        headers: corsHeaders
    });
}