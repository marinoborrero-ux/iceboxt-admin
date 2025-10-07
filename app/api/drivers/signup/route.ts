import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, vehicleType, licensePlate } = body;

    // Validación básica
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { message: 'Email, password, name, and phone are required' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un driver con este email
    const existingDriver = await prisma.deliveryPerson.findUnique({
      where: { email }
    });

    if (existingDriver) {
      return NextResponse.json(
        { message: 'A driver with this email already exists' },
        { status: 409 }
      );
    }

    // Separar nombre en firstName y lastName
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear el driver en la base de datos
    const newDriver = await prisma.deliveryPerson.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        vehicleType: vehicleType || null,
        licensePlate: licensePlate || null,
        isActive: true,
        isVerified: true,
        isOnline: false,
        rating: 5.0,
      }
    });

    // Crear un token JWT para el driver
    const token = jwt.sign(
      {
        driverId: newDriver.id,
        email: newDriver.email
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    // Preparar respuesta del driver (sin incluir datos sensibles)
    const driverResponse = {
      id: newDriver.id,
      name: `${newDriver.firstName} ${newDriver.lastName}`,
      email: newDriver.email,
      phone: newDriver.phone,
      vehicleType: newDriver.vehicleType,
      licensePlate: newDriver.licensePlate,
      vehicleColor: newDriver.vehicleColor,
      isOnline: newDriver.isOnline,
      isVerified: newDriver.isVerified,
      rating: parseFloat(newDriver.rating.toString()),
      totalDeliveries: 0,
      createdAt: newDriver.createdAt,
    };

    return NextResponse.json(
      {
        message: 'Driver account created successfully',
        driver: driverResponse,
        token
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}