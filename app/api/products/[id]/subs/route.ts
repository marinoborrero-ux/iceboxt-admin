import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products/[id]/subs
 * Retrieves all sub-products (publix_sub) for a specific product
 * Response: { success: boolean, data: SubProduct[] }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // Validate that the product ID is not empty
    if (!productId || productId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Retrieve all sub-products for this product
    const subs = (await prisma.publixSub.findMany({
      where: {
        idProducts: productId,
        isActive: true,
      },
      select: {
        id: true,
        idProducts: true,
        name: true,
        imageUrl: true,
        isActive: true,
        price: true, // Attempt to get price directly from sub-product
      },
      orderBy: {
        name: 'asc',
      },
    })) as Array<{
      id: number;
      idProducts: string;
      name: string;
      imageUrl: string | null;
      isActive: boolean;
      price: number | null; // Price from sub-product, may be null  
    }>;

    // If no sub-products exist, return empty array
    if (!subs || subs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No subs found for this product',
      });
    }

    // Retrieve parent product for price fallback
    const parentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, categoryId: true, price: true },
    });

    // Attempt to get real price per sub-product (match by name within same category)
    const subNames = Array.from(
      new Set(subs.map((sub) => sub.name.trim()).filter((name) => name.length > 0))
    );

    const pricedSubProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        name: { in: subNames },
        ...(parentProduct?.categoryId ? { categoryId: parentProduct.categoryId } : {}),
      },
      select: { name: true, price: true },
      orderBy: { updatedAt: 'desc' },
    });

    const subPriceByName = new Map<string, number>(
      pricedSubProducts.map((p: { name: string; price: number }) => [p.name.trim().toLowerCase(), Number(p.price)])
    );

    const fallbackParentPrice = parentProduct ? Number(parentProduct.price) : null;

    // Return sub-products in expected format
    return NextResponse.json({
      success: true,
      data: subs.map((sub) => ({
        // price: first try real sub-product price (if exists), then fallback to parent price
        // If both are missing, return 0 to maintain compatibility with mobile app
        // and allow UI to decide how to display it
        id: sub.id,
        id_products: sub.idProducts,
        name: sub.name,
        image_url: sub.imageUrl,
        is_active: sub.isActive,
        // price priority: direct from publix_sub → name lookup in product table → parent price → 0
        price:
          (sub.price != null && sub.price > 0 ? sub.price : null) ??
          subPriceByName.get(sub.name.trim().toLowerCase()) ??
          fallbackParentPrice ??
          0,
      })),
      count: subs.length,
    });
  } catch (error) {
    console.error('Error fetching subs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subs for product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
