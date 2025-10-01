import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Generic API key for mobile access
const MOBILE_API_KEY = 'icebox-mobile-2024';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || '';
        const apiKey = request.headers.get('x-api-key') || searchParams.get('api_key');

        console.log('🍔 Mobile API: Getting products for category:', category);
        console.log('🔑 API Key provided:', !!apiKey);

        // Validate API key if provided (optional but recommended)
        if (apiKey && apiKey !== MOBILE_API_KEY) {
            console.log('❌ Invalid API key provided');
            return NextResponse.json({
                error: 'Invalid API key'
            }, { status: 401 });
        }

        if (!category) {
            return NextResponse.json({
                error: 'Category parameter is required'
            }, { status: 400 });
        }

        // Get products by category name
        const products = await prisma.product.findMany({
            where: {
                category: {
                    name: {
                        equals: category,
                        mode: 'insensitive'
                    }
                },
                isActive: true
            },
            include: {
                category: true
            },
            orderBy: { name: 'asc' }
        });

        console.log(`📱 Found ${products.length} products for category: ${category}`);

        // Format products for mobile app
        const formattedProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            stock: product.stock,
            isActive: product.isActive,
            categoryId: product.categoryId,
            categoryName: product.category.name
        }));

        return NextResponse.json({
            success: true,
            data: formattedProducts,
            count: formattedProducts.length
        });

    } catch (error) {
        console.error('❌ Error fetching mobile products:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch products',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}