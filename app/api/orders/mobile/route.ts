import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Generic API key for mobile access
const MOBILE_API_KEY = 'icebox-mobile-2024';

// Add CORS headers to all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-User-Email, X-API-Key',
};

export async function GET(request: NextRequest) {
  console.log('📱 Mobile API GET - fetching orders from database');

  // Validate API key if provided (optional but recommended)
  const apiKey = request.headers.get('x-api-key');
  if (apiKey && apiKey !== MOBILE_API_KEY) {
    console.log('❌ Invalid API key provided for orders');
    return NextResponse.json({
      error: 'Invalid API key'
    }, { status: 401, headers: corsHeaders });
  }

  try {
    // Get all orders from the database with related data
    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            address: true,
            city: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${orders.length} orders in database`);

    return NextResponse.json({
      success: true,
      message: `Found ${orders.length} orders in database`,
      endpoint: '/api/orders/mobile',
      timestamp: new Date().toISOString(),
      data: {
        totalOrders: orders.length,
        orders: orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: Number(order.total),
          deliveryAddress: order.deliveryAddress,
          notes: order.notes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          customer: {
            id: order.customer.id,
            name: `${order.customer.firstName} ${order.customer.lastName}`,
            email: order.customer.email,
            address: order.customer.address,
            city: order.customer.city,
          },
          items: order.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: Number(item.price),
            product: {
              id: item.product.id,
              name: item.product.name,
              description: item.product.description,
              price: Number(item.product.price),
              category: item.product.category?.name
            }
          }))
        }))
      },
      apiInfo: {
        postUrl: 'http://10.0.2.2:3000/api/orders/mobile (for Android emulator)',
        postUrlLocal: 'http://localhost:3000/api/orders/mobile (for browser)',
        requiredFields: ['orderNumber', 'customerEmail', 'orderItems']
      }
    }, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('📱 Error fetching orders from database:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching orders from database',
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint: '/api/orders/mobile',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: corsHeaders
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('📱 Mobile order received');

    // Validate API key if provided (optional but recommended)
    const apiKey = request.headers.get('x-api-key');
    if (apiKey && apiKey !== MOBILE_API_KEY) {
      console.log('❌ Invalid API key provided for order creation');
      return NextResponse.json({
        error: 'Invalid API key'
      }, { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    console.log('📱 Mobile order data:', JSON.stringify(body, null, 2));

    const {
      orderNumber,
      customerEmail,
      totalAmount,
      deliveryAddress,
      deliveryCity,
      customerNotes,
      adminNotes,
      orderItems
    } = body;

    // Basic validation
    if (!orderNumber || !customerEmail || !orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: orderNumber, customerEmail, orderItems' },
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Find or create customer by email
    let customer = await prisma.customer.findUnique({
      where: { email: customerEmail }
    });

    if (!customer) {
      // Create a new customer from mobile order
      const nameParts = customerEmail.split('@')[0].split('.');
      const firstName = nameParts[0] || 'Mobile';
      const lastName = nameParts[1] || 'Customer';

      customer = await prisma.customer.create({
        data: {
          firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
          lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
          email: customerEmail,
          address: deliveryAddress || 'Mobile Order - Address TBD',
          city: deliveryCity || 'City TBD',
          isActive: true,
        }
      });

      console.log('📱 Created new customer:', customer.id);
    }

    // For mobile orders, we'll create simplified products or find existing ones
    const orderItemsToCreate = [];
    let calculatedTotal = 0;

    for (const item of orderItems) {
      // Try to find existing product by name
      let product = await prisma.product.findFirst({
        where: {
          name: {
            contains: item.productName,
            mode: 'insensitive'
          }
        }
      });

      // If product doesn't exist, create a basic one
      if (!product) {
        // First, make sure we have a default category
        let mobileCategory = await prisma.category.findUnique({
          where: { name: 'Mobile Orders' }
        });

        if (!mobileCategory) {
          mobileCategory = await prisma.category.create({
            data: {
              name: 'Mobile Orders',
              description: 'Products ordered through mobile app',
              isActive: true,
            }
          });
        }

        product = await prisma.product.create({
          data: {
            name: item.productName,
            description: `Mobile order item: ${item.productName}`,
            price: item.price || 0,
            stock: 1000, // High stock for mobile items
            categoryId: mobileCategory.id,
            isActive: true,
          }
        });

        console.log('📱 Created new product:', product.id, product.name);
      }

      const itemTotal = (item.price || Number(product.price)) * item.quantity;
      calculatedTotal += itemTotal;

      orderItemsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        price: item.price || Number(product.price),
      });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        deliveryAddress: deliveryAddress || customer.address || 'Mobile Order - Address TBD',
        notes: [customerNotes, adminNotes].filter(Boolean).join('. ') || null,
        total: totalAmount || calculatedTotal,
        status: 'PENDING',
        items: {
          create: orderItemsToCreate,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              }
            }
          }
        },
      },
    });

    console.log('📱 Mobile order created successfully:', order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customer: order.customer,
      total: Number(order.total),
      message: 'Mobile order created successfully'
    }, {
      status: 201,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('📱 Mobile order creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create mobile order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}