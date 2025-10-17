import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Health check started');

        // Test database connection
        let dbStatus = 'unknown';
        let dbError = null;
        let orderCount = 0;

        try {
            await prisma.$connect();
            orderCount = await prisma.order.count();
            dbStatus = 'connected';
            console.log('✅ Database connection successful');
        } catch (error) {
            dbStatus = 'error';
            dbError = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Database connection failed:', error);
        }

        // Test session
        let sessionStatus = 'unknown';
        let sessionError = null;
        let userRole = null;

        try {
            const session = await getServerSession(authOptions);
            if (session) {
                sessionStatus = 'valid';
                userRole = session.user?.role || 'unknown';
            } else {
                sessionStatus = 'invalid';
                sessionError = 'No active session';
            }
        } catch (error) {
            sessionStatus = 'error';
            sessionError = error instanceof Error ? error.message : 'Unknown error';
        }

        // Environment check
        const envVars = {
            nodeEnv: process.env.NODE_ENV,
            databaseUrl: process.env.DATABASE_URL ? 'set' : 'missing',
            nextauthUrl: process.env.NEXTAUTH_URL ? 'set' : 'missing',
            nextauthSecret: process.env.NEXTAUTH_SECRET ? 'set' : 'missing',
        };

        const healthData = {
            timestamp: new Date().toISOString(),
            status: dbStatus === 'connected' && sessionStatus !== 'error' ? 'healthy' : 'unhealthy',
            database: {
                status: dbStatus,
                error: dbError,
                orderCount: orderCount,
            },
            session: {
                status: sessionStatus,
                error: sessionError,
                userRole: userRole,
            },
            environment: envVars,
        };

        console.log('🏥 Health check completed:', healthData);

        return NextResponse.json(healthData);
    } catch (error) {
        console.error('❌ Health check failed:', error);
        return NextResponse.json(
            {
                timestamp: new Date().toISOString(),
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}