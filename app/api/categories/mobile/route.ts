import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Generic API key for mobile access
const MOBILE_API_KEY = 'icebox-mobile-2024';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const apiKey = request.headers.get('x-api-key') || searchParams.get('api_key');

        console.log('📱 Mobile Categories API: Getting all categories');
        console.log('🔑 API Key provided:', !!apiKey);

        // Validate API key if provided (optional but recommended)
        if (apiKey && apiKey !== MOBILE_API_KEY) {
            console.log('❌ Invalid API key provided');
            return NextResponse.json({
                success: false,
                error: 'Invalid API key'
            }, { status: 401 });
        }

        // Get all active categories with product count
        const categories = await prisma.category.findMany({
            where: {
                isActive: true
            },
            include: {
                _count: {
                    select: {
                        products: {
                            where: {
                                isActive: true
                            }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        console.log(`📱 Found ${categories.length} categories`);

        // Format categories for mobile app
        const formattedCategories = categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            isActive: category.isActive,
            productCount: category._count.products,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        }));

        return NextResponse.json({
            success: true,
            data: formattedCategories,
            count: formattedCategories.length
        });

    } catch (error) {
        console.error('❌ Error fetching mobile categories:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch categories',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}