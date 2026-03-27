
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
        name: 'Main Courses',
        description: 'Popular main course meals',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
        isActive: true,
      },
      {
        name: 'Appetizers',
        description: 'Healthy appetizer options',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        isActive: true,
      },
      {
        name: 'Desserts',
        description: 'Assorted dessert dishes',
        image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400',
        isActive: true,
      },
      {
        name: 'Beverages',
        description: 'Refreshing drinks',
        image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400',
        isActive: true,
      },
      {
        name: 'Snacks',
        description: 'Quick snack options',
        image: 'https://images.unsplash.com/photo-1564298208969-f4a2b9133e9a?w=400',
        isActive: true,
      },
      {
        name: 'Meal Combos',
        description: 'Combo meals for special occasions',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        isActive: true,
      },
    ],
  });

  const categoryRecords = await prisma.category.findMany();
  console.log('📋 Created categories');

  // Create products
  const mainCoursesCat = categoryRecords.find(c => c.name === 'Main Courses')!;
  const appetizersCat = categoryRecords.find(c => c.name === 'Appetizers')!;
  const dessertsCat = categoryRecords.find(c => c.name === 'Desserts')!;
  const beveragesCat = categoryRecords.find(c => c.name === 'Beverages')!;
  const snacksCat = categoryRecords.find(c => c.name === 'Snacks')!;
  const mealCombosCat = categoryRecords.find(c => c.name === 'Meal Combos')!;

  await prisma.product.createMany({
    data: [
      // Main Courses
      {
        name: 'Grilled Chicken Platter',
        description: 'Seasoned grilled chicken with sides',
        price: 12.99,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400',
        categoryId: mainCoursesCat.id,
        isActive: true,
      },
      {
        name: 'Steak Chimichurri',
        description: 'Grilled steak with chimichurri sauce',
        price: 14.99,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
        categoryId: mainCoursesCat.id,
        isActive: true,
      },
      {
        name: 'Salmon Teriyaki',
        description: 'Teriyaki glazed salmon with vegetables',
        price: 16.99,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400',
        categoryId: mainCoursesCat.id,
        isActive: true,
      },
      {
        name: 'Pasta Primavera',
        description: 'Pasta with seasonal vegetables',
        price: 11.99,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400',
        categoryId: mainCoursesCat.id,
        isActive: true,
      },
      {
        name: 'Quinoa Bowl',
        description: 'Healthy quinoa bowl with vegetables',
        price: 10.49,
        stock: 42,
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
        categoryId: mainCoursesCat.id,
        isActive: true,
      },

      // Appetizers
      {
        name: 'Bruschetta',
        description: 'Toasted bread with tomato and basil',
        price: 7.99,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        categoryId: appetizersCat.id,
        isActive: true,
      },
      {
        name: 'Stuffed Mushrooms',
        description: 'Mushrooms stuffed with cheese and herbs',
        price: 8.49,
        stock: 28,
        image: 'https://www.dessertnowdinnerlater.com/wp-content/uploads/2021/06/Triple-Berry-Frozen-Yogurt-1.jpg',
        categoryId: appetizersCat.id,
        isActive: true,
      },
      {
        name: 'Crispy Spring Rolls',
        description: 'Vegetable spring rolls with dipping sauce',
        price: 8.99,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
        categoryId: appetizersCat.id,
        isActive: true,
      },
      {
        name: 'Bruschetta',
        description: 'Toasted bread with tomato and basil',
        price: 7.99,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        categoryId: appetizersCat.id,
        isActive: true,
      },
      {
        name: 'Caprese Skewers',
        description: 'Cherry tomatoes with mozzarella and basil',
        price: 8.49,
        stock: 28,
        image: 'https://www.dessertnowdinnerlater.com/wp-content/uploads/2021/06/Triple-Berry-Frozen-Yogurt-1.jpg',
        categoryId: appetizersCat.id,
        isActive: true,
      },
      {
        name: 'Garlic Butter Shrimp',
        description: 'Sautéed shrimp with garlic butter sauce',
        price: 8.99,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
        categoryId: appetizersCat.id,
        isActive: true,
      },

      // Desserts
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center',
        price: 12.99,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400',
        categoryId: dessertsCat.id,
        isActive: true,
      },
      {
        name: 'Tiramisu',
        description: 'Classic coffee-flavored dessert with mascarpone',
        price: 13.49,
        stock: 18,
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
        categoryId: dessertsCat.id,
        isActive: true,
      },
      {
        name: 'Lemon Cheesecake',
        description: 'Creamy lemon cheesecake',
        price: 11.99,
        stock: 22,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
        categoryId: dessertsCat.id,
        isActive: true,
      },

      // Beverages
      {
        name: 'Iced Tea',
        description: 'Freshly brewed iced tea',
        price: 3.99,
        stock: 100,
        image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400',
        categoryId: beveragesCat.id,
        isActive: true,
      },
      {
        name: 'Lemonade',
        description: 'Homemade lemonade',
        price: 3.49,
        stock: 100,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
        categoryId: beveragesCat.id,
        isActive: true,
      },
      {
        name: 'Mixed Berry Smoothie',
        description: 'Mixed berry smoothie with yogurt',
        price: 5.99,
        stock: 90,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
        categoryId: beveragesCat.id,
        isActive: true,
      },

      // Snacks
      {
        name: 'Nachos',
        description: 'Crispy nachos with cheese and salsa',
        price: 5.99,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        categoryId: snacksCat.id,
        isActive: true,
      },
      {
        name: 'Potato Wedges',
        description: 'Seasoned potato wedges with dip',
        price: 4.99,
        stock: 75,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
        categoryId: snacksCat.id,
        isActive: true,
      },
      {
        name: 'Chicken Wings',
        description: 'Spicy chicken wings with sauce',
        price: 8.99,
        stock: 48,
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
        categoryId: snacksCat.id,
        isActive: true,
      },

      // Meal Combos
      {
        name: 'Family Combo',
        description: 'Family meal combo with mains and sides',
        price: 29.99,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        categoryId: mealCombosCat.id,
        isActive: true,
      },
      {
        name: 'Party Combo',
        description: 'Large combo for parties and gatherings',
        price: 32.99,
        stock: 6,
        image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400',
        categoryId: mealCombosCat.id,
        isActive: true,
      }
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
