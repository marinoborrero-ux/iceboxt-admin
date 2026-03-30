import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products/[id]/subs
 * Obtiene todos los subproductos (publix_sub) para un producto específico
 * Respuesta: { success: boolean, data: SubProduct[] }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // Validar que el ID del producto no esté vacío
    if (!productId || productId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Obtener todos los subproductos para este producto
    const subs = await prisma.publixSub.findMany({
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
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Si no hay subproductos, devolver array vacío
    if (!subs || subs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No subs found for this product',
      });
    }

    // Devolver los subproductos en el formato esperado
    return NextResponse.json({
      success: true,
      data: subs.map((sub) => ({
        id: sub.id,
        id_products: sub.idProducts,
        name: sub.name,
        image_url: sub.imageUrl,
        is_active: sub.isActive,
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
