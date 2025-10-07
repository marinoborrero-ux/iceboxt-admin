import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validación básica
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Buscar el driver por email
    const driver = await prisma.deliveryPerson.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!driver) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!driver.isActive) {
      return NextResponse.json(
        { message: 'Driver account is deactivated' },
        { status: 403 }
      );
    }

    // Verificar la contraseña
    if (!driver.password) {
      return NextResponse.json(
        { message: 'Account needs password setup' },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, driver.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        driverId: driver.id,
        email: driver.email
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    // Contar las órdenes entregadas por este driver
    const deliveredOrders = await prisma.order.count({
      where: {
        deliveryPersonId: driver.id,
        status: 'DELIVERED'
      }
    });

    // Preparar respuesta del driver
    const driverResponse = {
      id: driver.id,
      name: `${driver.firstName} ${driver.lastName}`,
      email: driver.email,
      phone: driver.phone,
      vehicleType: driver.vehicleType,
      licensePlate: driver.licensePlate,
      vehicleColor: driver.vehicleColor,
      isOnline: driver.isOnline,
      isVerified: driver.isVerified,
      rating: parseFloat(driver.rating.toString()),
      totalDeliveries: deliveredOrders,
      createdAt: driver.createdAt,
    };

    return NextResponse.json(
      {
        message: 'Sign in successful',
        driver: driverResponse,
        token
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}