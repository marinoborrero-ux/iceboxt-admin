import { NextRequest, NextResponse } from 'next/server';

// Force no cache for testing
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
    const timestamp = new Date().toISOString();
    
    console.log(`🧪 [${timestamp}] Cache test endpoint called`);
    
    const response = NextResponse.json({
        message: 'Cache test endpoint',
        timestamp: timestamp,
        requestId: Math.random().toString(36).substring(7),
        serverTime: Date.now(),
        headers: {
            userAgent: request.headers.get('user-agent'),
            cacheControl: request.headers.get('cache-control'),
            pragma: request.headers.get('pragma')
        }
    });
    
    // Set comprehensive anti-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-Accel-Expires', '0');
    response.headers.set('Vary', '*');
    response.headers.set('Last-Modified', new Date().toUTCString());
    response.headers.set('ETag', `"test-${Date.now()}"`);
    response.headers.set('X-Fresh-Data', 'true');
    response.headers.set('X-Timestamp', timestamp);
    response.headers.set('X-Test-Mode', 'no-cache');
    
    return response;
}