import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    console.log('🔥 Mobile API test endpoint hit');
    console.log('📱 User-Agent:', request.headers.get('user-agent') || 'Unknown');
    console.log('🌍 Origin:', request.headers.get('origin') || 'Unknown');

    return NextResponse.json({
        success: true,
        message: 'Mobile API is working! No authentication required.',
        timestamp: new Date().toISOString(),
        endpoint: '/api/orders/mobile/test',
        userAgent: request.headers.get('user-agent') || 'Unknown'
    }, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-User-Email',
        }
    });
}

export async function POST(request: NextRequest) {
    console.log('🔥 Mobile API test POST endpoint hit');

    try {
        const body = await request.json();
        console.log('📦 Test POST data:', JSON.stringify(body, null, 2));

        return NextResponse.json({
            success: true,
            message: 'Mobile API POST test successful!',
            receivedData: body,
            timestamp: new Date().toISOString()
        }, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Email',
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Invalid JSON in request body'
        }, { status: 400 });
    }
}

export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-User-Email',
        }
    });
}