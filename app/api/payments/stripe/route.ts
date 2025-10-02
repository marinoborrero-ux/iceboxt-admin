import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

// Generic API key for mobile access
const MOBILE_API_KEY = 'icebox-mobile-2024';

// Add CORS headers to all responses
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Email, X-API-Key',
};

export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, {
        status: 200,
        headers: corsHeaders
    });
}

export async function POST(request: NextRequest) {
    try {
        console.log('💳 Creating Stripe PaymentIntent...');

        // Validate API key if provided (optional but recommended)
        const apiKey = request.headers.get('x-api-key');
        if (apiKey && apiKey !== MOBILE_API_KEY) {
            console.log('❌ Invalid API key provided for payment');
            return NextResponse.json({
                error: 'Invalid API key'
            }, { status: 401, headers: corsHeaders });
        }

        const body = await request.json();
        console.log('💳 Payment request data:', JSON.stringify(body, null, 2));

        const {
            amount,
            currency = 'usd',
            customerEmail,
            orderNumber,
            customerName,
            items = []
        } = body;

        // Basic validation
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount provided' },
                { status: 400, headers: corsHeaders }
            );
        }

        if (!customerEmail) {
            return NextResponse.json(
                { error: 'Customer email is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Convert amount to cents (Stripe requires amounts in smallest currency unit)
        const amountInCents = Math.round(amount * 100);

        console.log(`💰 Creating PaymentIntent for $${amount} (${amountInCents} cents)`);

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: currency.toLowerCase(),
            payment_method_types: ['card'],
            receipt_email: customerEmail,
            metadata: {
                orderNumber: orderNumber || 'N/A',
                customerEmail: customerEmail,
                customerName: customerName || 'Mobile Customer',
                itemCount: items.length.toString(),
                source: 'mobile_app'
            },
            description: `IceBoxT Order ${orderNumber || 'Mobile Order'} - ${items.length} items`,
        });

        console.log('✅ PaymentIntent created successfully:', paymentIntent.id);

        return NextResponse.json({
            success: true,
            paymentIntent: {
                id: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
            },
            publishableKey: STRIPE_CONFIG.publishableKey,
            message: 'PaymentIntent created successfully'
        }, {
            status: 200,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('💳 Payment intent creation error:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to create payment intent',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500,
            headers: corsHeaders
        });
    }
}

export async function GET(request: NextRequest) {
    try {
        // Return Stripe configuration for mobile app
        return NextResponse.json({
            success: true,
            config: {
                publishableKey: STRIPE_CONFIG.publishableKey,
                currency: STRIPE_CONFIG.currency,
                paymentMethodTypes: STRIPE_CONFIG.paymentMethodTypes,
            },
            message: 'Stripe configuration retrieved successfully'
        }, {
            status: 200,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('💳 Error getting Stripe config:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to get Stripe configuration',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500,
            headers: corsHeaders
        });
    }
}