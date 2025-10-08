import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Generic API key for mobile access
const MOBILE_API_KEY = 'icebox-mobile-2024';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || '';
        const all = searchParams.get('all') === 'true';
        const search = searchParams.get('search') || searchParams.get('q') || '';
        const apiKey = request.headers.get('x-api-key') || searchParams.get('api_key');

        console.log('🍔 Mobile API: Getting products for category:', category, 'all:', all, 'search:', search);
        console.log('🔑 API Key provided:', !!apiKey);

        // Validate API key if provided (optional but recommended)
        if (apiKey && apiKey !== MOBILE_API_KEY) {
            console.log('❌ Invalid API key provided');
            return NextResponse.json({
                error: 'Invalid API key'
            }, { status: 401 });
        }

        let whereClause: any = {
            isActive: true
        };

        // Handle search functionality
        if (search && search.trim().length > 0) {
            const searchQuery = search.trim();
            whereClause.OR = [
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
            ];
        } else if (!all) {
            // If not searching and not getting all, filter by category
            if (!category) {
                return NextResponse.json({
                    error: 'Category parameter is required (or use ?all=true for all products, or ?search=query for search)'
                }, { status: 400 });
            }

            whereClause.category = {
                name: {
                    equals: category,
                    mode: 'insensitive'
                }
            };
        }

        // Get products by category name, search query, or all products
        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                category: true
            },
            orderBy: { name: 'asc' },
            take: search ? 50 : undefined // Limit search results
        });

        console.log(`📱 Found ${products.length} products${search ? ` for search: "${search}"` : all ? ' (all)' : ` for category: ${category}`}`);

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
            products: formattedProducts, // Also include as 'products' for search compatibility
            count: formattedProducts.length,
            query: search || undefined
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