import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    console.log('🧪 Test endpoint hit');
    return NextResponse.json({
        success: true,
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
}

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 Test POST endpoint hit');
        const body = await request.json();
        console.log('📦 Request body:', body);

        return NextResponse.json({
            success: true,
            message: 'POST request received',
            receivedData: body,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Test endpoint error:', error);
        return NextResponse.json({
            success: false,
            message: 'Error processing request',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}