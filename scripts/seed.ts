
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up existing data
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.deliveryPerson.deleteMany({});
  await prisma.user.deleteMany({});

  // Create admin users
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);

  const defaultAdmin = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@iceboxt.com',
      name: 'IceBoxT Admin',
      password: hashedAdminPassword,
      role: 'admin',
    },
  });

  console.log('👤 Created admin users');

  // Create categories
  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'Ice Cream',
        description: 'Premium ice cream varieties',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
        isActive: true,
      },
      {
        name: 'Frozen Yogurt',
        description: 'Healthy frozen yogurt options',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        isActive: true,
      },
      {
        name: 'Gelato',
        description: 'Italian-style gelato',
        image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400',
        isActive: true,
      },
      {
        name: 'Sorbet',
        description: 'Dairy-free fruit sorbets',
        image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400',
        isActive: true,
      },
      {
        name: 'Frozen Treats',
        description: 'Popsicles and frozen snacks',
        image: 'https://images.unsplash.com/photo-1564298208969-f4a2b9133e9a?w=400',
        isActive: true,
      },
      {
        name: 'Ice Cream Cakes',
        description: 'Special occasion cakes',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        isActive: true,
      },
    ],
  });

  const categoryRecords = await prisma.category.findMany();
  console.log('📋 Created categories');

  // Create products
  const iceCreamCat = categoryRecords.find(c => c.name === 'Ice Cream')!;
  const frozenYogurtCat = categoryRecords.find(c => c.name === 'Frozen Yogurt')!;
  const gelatoCat = categoryRecords.find(c => c.name === 'Gelato')!;
  const sorbetCat = categoryRecords.find(c => c.name === 'Sorbet')!;
  const frozenTreatsCat = categoryRecords.find(c => c.name === 'Frozen Treats')!;
  const iceCreamCakesCat = categoryRecords.find(c => c.name === 'Ice Cream Cakes')!;

  await prisma.product.createMany({
    data: [
      // Ice Cream
      {
        name: 'Vanilla Bean Ice Cream',
        description: 'Classic vanilla with real vanilla bean specks',
        price: 8.99,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400',
        categoryId: iceCreamCat.id,
        isActive: true,
      },
      {
        name: 'Chocolate Fudge Ice Cream',
        description: 'Rich chocolate ice cream with fudge swirls',
        price: 9.49,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
        categoryId: iceCreamCat.id,
        isActive: true,
      },
      {
        name: 'Strawberry Cheesecake Ice Cream',
        description: 'Creamy strawberry ice cream with cheesecake chunks',
        price: 10.99,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400',
        categoryId: iceCreamCat.id,
        isActive: true,
      },
      {
        name: 'Mint Chocolate Chip Ice Cream',
        description: 'Refreshing mint ice cream with chocolate chips',
        price: 9.99,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400',
        categoryId: iceCreamCat.id,
        isActive: true,
      },
      {
        name: 'Cookies & Cream Ice Cream',
        description: 'Vanilla ice cream loaded with chocolate cookie pieces',
        price: 10.49,
        stock: 42,
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
        categoryId: iceCreamCat.id,
        isActive: true,
      },

      // Frozen Yogurt
      {
        name: 'Greek Honey Frozen Yogurt',
        description: 'Authentic Greek yogurt with natural honey',
        price: 7.99,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        categoryId: frozenYogurtCat.id,
        isActive: true,
      },
      {
        name: 'Berry Blast Frozen Yogurt',
        description: 'Mixed berry frozen yogurt with real fruit pieces',
        price: 8.49,
        stock: 28,
        image: 'https://www.dessertnowdinnerlater.com/wp-content/uploads/2021/06/Triple-Berry-Frozen-Yogurt-1.jpg',
        categoryId: frozenYogurtCat.id,
        isActive: true,
      },
      {
        name: 'Tropical Mango Frozen Yogurt',
        description: 'Creamy mango frozen yogurt with coconut flakes',
        price: 8.99,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
        categoryId: frozenYogurtCat.id,
        isActive: true,
      },

      // Gelato
      {
        name: 'Pistachio Gelato',
        description: 'Authentic Italian pistachio gelato',
        price: 12.99,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400',
        categoryId: gelatoCat.id,
        isActive: true,
      },
      {
        name: 'Tiramisu Gelato',
        description: 'Coffee-flavored gelato with mascarpone',
        price: 13.49,
        stock: 18,
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
        categoryId: gelatoCat.id,
        isActive: true,
      },
      {
        name: 'Lemon Ricotta Gelato',
        description: 'Fresh lemon gelato with ricotta cheese',
        price: 11.99,
        stock: 22,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
        categoryId: gelatoCat.id,
        isActive: true,
      },

      // Sorbet
      {
        name: 'Raspberry Sorbet',
        description: 'Pure raspberry sorbet, dairy-free and vegan',
        price: 6.99,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400',
        categoryId: sorbetCat.id,
        isActive: true,
      },
      {
        name: 'Lemon Lime Sorbet',
        description: 'Refreshing citrus sorbet',
        price: 6.49,
        stock: 38,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
        categoryId: sorbetCat.id,
        isActive: true,
      },
      {
        name: 'Watermelon Sorbet',
        description: 'Summer watermelon sorbet',
        price: 7.49,
        stock: 32,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
        categoryId: sorbetCat.id,
        isActive: true,
      },

      // Frozen Treats
      {
        name: 'Classic Fudge Popsicles',
        description: 'Chocolate fudge popsicles on a stick',
        price: 4.99,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        categoryId: frozenTreatsCat.id,
        isActive: true,
      },
      {
        name: 'Fruit Punch Popsicles',
        description: 'Colorful fruit punch frozen treats',
        price: 3.99,
        stock: 75,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
        categoryId: frozenTreatsCat.id,
        isActive: true,
      },
      {
        name: 'Ice Cream Sandwiches',
        description: 'Vanilla ice cream between chocolate wafers',
        price: 5.99,
        stock: 48,
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
        categoryId: frozenTreatsCat.id,
        isActive: true,
      },

      // Ice Cream Cakes
      {
        name: 'Birthday Celebration Cake',
        description: 'Vanilla and chocolate ice cream cake with decorations',
        price: 29.99,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        categoryId: iceCreamCakesCat.id,
        isActive: true,
      },
      {
        name: 'Chocolate Oreo Cake',
        description: 'Chocolate ice cream cake with Oreo cookies',
        price: 32.99,
        stock: 6,
        image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400',
        categoryId: iceCreamCakesCat.id,
        isActive: true,
      },
    ],
  });

  console.log('🍦 Created products');

  // Create customers
  await prisma.customer.createMany({
    data: [
      {
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.johnson@email.com',
        phone: '+1-555-0123',
        address: '123 Maple Street',
        city: 'Springfield',
        zipCode: '12345',
        isActive: true,
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@email.com',
        phone: '+1-555-0124',
        address: '456 Oak Avenue',
        city: 'Springfield',
        zipCode: '12346',
        isActive: true,
      },
      {
        firstName: 'Sarah',
        lastName: 'Davis',
        email: 'sarah.davis@email.com',
        phone: '+1-555-0125',
        address: '789 Pine Road',
        city: 'Springfield',
        zipCode: '12347',
        isActive: true,
      },
      {
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@email.com',
        phone: '+1-555-0126',
        address: '321 Elm Street',
        city: 'Springfield',
        zipCode: '12348',
        isActive: true,
      },
      {
        firstName: 'Jessica',
        lastName: 'Miller',
        email: 'jessica.miller@email.com',
        phone: '+1-555-0127',
        address: '654 Cedar Lane',
        city: 'Springfield',
        zipCode: '12349',
        isActive: true,
      },
      {
        firstName: 'David',
        lastName: 'Garcia',
        email: 'david.garcia@email.com',
        phone: '+1-555-0128',
        address: '987 Birch Boulevard',
        city: 'Springfield',
        zipCode: '12350',
        isActive: true,
      },
    ],
  });

  console.log('👥 Created customers');

  // Create delivery persons
  await prisma.deliveryPerson.createMany({
    data: [
      {
        firstName: 'Alex',
        lastName: 'Thompson',
        email: 'alex.thompson@iceboxt.com',
        phone: '+1-555-1001',
        isActive: true,
      },
      {
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.rodriguez@iceboxt.com',
        phone: '+1-555-1002',
        isActive: true,
      },
      {
        firstName: 'Kevin',
        lastName: 'Lee',
        email: 'kevin.lee@iceboxt.com',
        phone: '+1-555-1003',
        isActive: true,
      },
      {
        firstName: 'Amanda',
        lastName: 'White',
        email: 'amanda.white@iceboxt.com',
        phone: '+1-555-1004',
        isActive: true,
      },
      {
        firstName: 'Carlos',
        lastName: 'Martinez',
        email: 'carlos.martinez@iceboxt.com',
        phone: '+1-555-1005',
        isActive: true,
      },
    ],
  });

  console.log('🚚 Created delivery persons');

  // Get created records for orders
  const customers = await prisma.customer.findMany();
  const deliveryPersons = await prisma.deliveryPerson.findMany();
  const products = await prisma.product.findMany();

  // Create sample orders
  const orderData = [
    {
      orderNumber: 'ORD-2024-001',
      status: 'DELIVERED' as const,
      total: 18.98,
      deliveryAddress: '123 Maple Street, Springfield, 12345',
      notes: 'Leave at front door',
      customerId: customers[0]?.id!,
      deliveryPersonId: deliveryPersons[0]?.id!,
      items: [
        { productId: products[0]?.id!, quantity: 2, price: 8.99 },
        { productId: products[1]?.id!, quantity: 1, price: 9.49 },
      ],
    },
    {
      orderNumber: 'ORD-2024-002',
      status: 'IN_PROGRESS' as const,
      total: 43.97,
      deliveryAddress: '456 Oak Avenue, Springfield, 12346',
      notes: 'Ring doorbell',
      customerId: customers[1]?.id!,
      deliveryPersonId: deliveryPersons[1]?.id!,
      items: [
        { productId: products[17]?.id!, quantity: 1, price: 29.99 },
        { productId: products[5]?.id!, quantity: 1, price: 7.99 },
        { productId: products[14]?.id!, quantity: 1, price: 5.99 },
      ],
    },
    {
      orderNumber: 'ORD-2024-003',
      status: 'PENDING' as const,
      total: 27.47,
      deliveryAddress: '789 Pine Road, Springfield, 12347',
      notes: null,
      customerId: customers[2]?.id!,
      deliveryPersonId: null,
      items: [
        { productId: products[8]?.id!, quantity: 2, price: 12.99 },
        { productId: products[11]?.id!, quantity: 1, price: 6.99 },
      ],
    },
    {
      orderNumber: 'ORD-2024-004',
      status: 'DELIVERED' as const,
      total: 15.98,
      deliveryAddress: '321 Elm Street, Springfield, 12348',
      notes: 'Call when arrived',
      customerId: customers[3]?.id!,
      deliveryPersonId: deliveryPersons[2]?.id!,
      items: [
        { productId: products[6]?.id!, quantity: 1, price: 8.49 },
        { productId: products[13]?.id!, quantity: 1, price: 6.49 },
      ],
    },
    {
      orderNumber: 'ORD-2024-005',
      status: 'CANCELLED' as const,
      total: 22.98,
      deliveryAddress: '654 Cedar Lane, Springfield, 12349',
      notes: 'Customer requested cancellation',
      customerId: customers[4]?.id!,
      deliveryPersonId: null,
      items: [
        { productId: products[9]?.id!, quantity: 1, price: 13.49 },
        { productId: products[3]?.id!, quantity: 1, price: 9.99 },
      ],
    },
    {
      orderNumber: 'ORD-2024-006',
      status: 'IN_PROGRESS' as const,
      total: 35.96,
      deliveryAddress: '987 Birch Boulevard, Springfield, 12350',
      notes: null,
      customerId: customers[5]?.id!,
      deliveryPersonId: deliveryPersons[3]?.id!,
      items: [
        { productId: products[4]?.id!, quantity: 2, price: 10.49 },
        { productId: products[16]?.id!, quantity: 3, price: 4.99 },
      ],
    },
  ];

  // Create orders with items
  for (const orderInfo of orderData) {
    const order = await prisma.order.create({
      data: {
        orderNumber: orderInfo.orderNumber,
        status: orderInfo.status,
        total: orderInfo.total,
        deliveryAddress: orderInfo.deliveryAddress,
        notes: orderInfo.notes,
        customerId: orderInfo.customerId,
        deliveryPersonId: orderInfo.deliveryPersonId,
      },
    });

    await prisma.orderItem.createMany({
      data: orderInfo.items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  }

  console.log('📦 Created orders with items');
  console.log('✅ Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
