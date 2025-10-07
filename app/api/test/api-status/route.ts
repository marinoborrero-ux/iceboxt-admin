import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    console.log('🔍 Test endpoint called');

    return NextResponse.json({
        success: true,
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
}

export async function POST(request: NextRequest) {
    console.log('🔍 Test POST endpoint called');

    const body = await request.json().catch(() => ({}));
    console.log('📝 Request body:', body);

    return NextResponse.json({
        success: true,
        message: 'POST API is working',
        receivedData: body,
        timestamp: new Date().toISOString()
    });
}