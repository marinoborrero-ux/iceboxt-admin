import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Generic API key for mobile access
const MOBILE_API_KEY = 'icebox-mobile-2024';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const apiKey = request.headers.get('x-api-key') || searchParams.get('api_key');
        const limit = parseInt(searchParams.get('limit') || '20');

        console.log('🔍 Search API: Searching for products with query:', query);
        console.log('🔑 API Key provided:', !!apiKey);

        // Validate API key if provided (optional but recommended)
        if (apiKey && apiKey !== MOBILE_API_KEY) {
            console.log('❌ Invalid API key provided');
            return NextResponse.json({
                success: false,
                error: 'Invalid API key'
            }, { status: 401 });
        }

        if (!query || query.trim().length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Search query parameter "q" is required'
            }, { status: 400 });
        }

        const searchQuery = query.trim();

        // Search products by name, description, or category name
        const products = await prisma.product.findMany({
            where: {
                AND: [
                    { isActive: true },
                    {
                        OR: [
                            {
                                name: {
                                    contains: searchQuery,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                description: {
                                    contains: searchQuery,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                category: {
                                    name: {
                                        contains: searchQuery,
                                        mode: 'insensitive'
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            include: {
                category: true
            },
            orderBy: [
                {
                    name: 'asc'
                }
            ],
            take: limit
        });

        console.log(`🔍 Found ${products.length} products for query: "${searchQuery}"`);

        if (products.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No products found',
                query: searchQuery,
                products: []
            }, { status: 404 });
        }

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
            categoryName: product.category.name,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }));

        return NextResponse.json({
            success: true,
            query: searchQuery,
            products: formattedProducts,
            count: formattedProducts.length
        });

    } catch (error) {
        console.error('❌ Error searching products:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to search products',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}