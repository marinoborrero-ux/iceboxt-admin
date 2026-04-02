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
      },
      orderBy: {
        name: 'asc',
      },
    })) as Array<{
      id: string;
      idProducts: string;
      name: string;
      imageUrl: string | null;
      isActive: boolean;
    }>;

    // Si no hay subproductos, devolver array vacío
    if (!subs || subs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No subs found for this product',
      });
    }

    // Obtener producto padre para fallback de precio
    const parentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, categoryId: true, price: true },
    });

    // Intentar obtener precio real por subproducto (match por nombre dentro de la misma categoría)
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
      pricedSubProducts.map((p) => [p.name.trim().toLowerCase(), Number(p.price)])
    );

    const fallbackParentPrice = parentProduct ? Number(parentProduct.price) : null;

    // Devolver los subproductos en el formato esperado
    return NextResponse.json({
      success: true,
      data: subs.map((sub) => ({
        // precio: primero el precio real del subproducto (si existe), luego fallback al padre
        // Si ambos faltan, devolver 0 para mantener compatibilidad con la app móvil
        // y permitir que la UI decida cómo mostrarlo.
        id: sub.id,
        id_products: sub.idProducts,
        name: sub.name,
        image_url: sub.imageUrl,
        is_active: sub.isActive,
        price:
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
