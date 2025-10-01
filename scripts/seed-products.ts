import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategoriesAndProducts() {
    console.log('🌱 Starting to seed categories and products...');

    try {
        // 1. Crear las categorías
        const categories = [
            { name: 'Foods', description: 'Sandwiches and main dishes' },
            { name: 'Drinks/Mixer', description: 'Soft drinks and mixers' },
            { name: 'Beers', description: 'Beer selection' },
            { name: 'Wine/Spirits', description: 'Wine and alcoholic beverages' },
            { name: 'Snacks', description: 'Snacks and quick bites' },
            { name: 'Salads', description: 'Fresh salads' }
        ];

        console.log('📂 Creating categories...');
        const createdCategories: Record<string, any> = {};
        for (const category of categories) {
            const created = await prisma.category.upsert({
                where: { name: category.name },
                update: category,
                create: category
            });
            createdCategories[category.name] = created;
            console.log(`✅ Category created: ${created.name}`);
        }

        // 2. Crear los productos
        const products = [
            // Foods
            { name: 'BLT', description: 'White bread, bacon, tomato', price: 8.99, category: 'Foods', image: 'assets/foods/blt.jpg' },
            { name: 'Chicken Caesar Wrap', description: 'Romaine, Caesar dressing', price: 9.99, category: 'Foods', image: 'assets/foods/chicken_caesar.jpg' },
            { name: 'Chicken Salad', description: 'Herbed mayo with mixed greens', price: 8.49, category: 'Foods', image: 'assets/foods/chicken_salad.jpg' },
            { name: 'Fried Chicken Sandwich', description: 'Crispy chicken, pickles', price: 10.99, category: 'Foods', image: 'assets/foods/fried_chicken.jpg' },
            { name: 'Ham & Cheese', description: 'Classic deli ham', price: 7.99, category: 'Foods', image: 'assets/foods/ham_cheese.jpg' },
            { name: 'Tuna Salad', description: 'Tuna, mayo, celery', price: 8.49, category: 'Foods', image: 'assets/foods/tuna_salad.jpg' },
            { name: 'Turkey & Swiss', description: 'Smoked turkey with Swiss', price: 9.49, category: 'Foods', image: 'assets/foods/turkey_swiss.jpg' },

            // Snacks
            { name: 'Apples', description: '5 apples', price: 3.99, category: 'Snacks', image: 'assets/snacks/apples.jpg' },
            { name: 'Chips Ahoy', description: '14.3 ounces', price: 4.49, category: 'Snacks', image: 'assets/snacks/chips_ahoy.jpg' },
            { name: 'Doritos', description: 'Cool Ranch', price: 3.99, category: 'Snacks', image: 'assets/snacks/doritos.jpg' },
            { name: 'Oranges', description: '5 oranges', price: 4.99, category: 'Snacks', image: 'assets/snacks/oranges.jpg' },

            // Drinks
            { name: 'Coca-Cola', description: '12oz can', price: 1.99, category: 'Drinks/Mixer', image: 'assets/drinks/coca_cola.jpg' },
            { name: 'Pepsi', description: '12oz can', price: 1.99, category: 'Drinks/Mixer', image: 'assets/drinks/pepsi.jpg' },
            { name: 'Dr Pepper', description: '12oz can', price: 1.99, category: 'Drinks/Mixer', image: 'assets/drinks/dr_pepper.jpg' },
            { name: 'Mountain Dew', description: '12oz can', price: 1.99, category: 'Drinks/Mixer', image: 'assets/drinks/mountain_dew.jpg' },
            { name: 'Sprite', description: '12oz can', price: 1.99, category: 'Drinks/Mixer', image: 'assets/drinks/sprite.jpg' },

            // Beers
            { name: 'Budweiser', description: '12oz', price: 3.99, category: 'Beers', image: 'assets/beers/budweiser.jpg' },
            { name: 'Bud Light', description: '12oz', price: 3.99, category: 'Beers', image: 'assets/beers/bud_light.jpg' },
            { name: 'Coors Light', description: '12oz', price: 3.99, category: 'Beers', image: 'assets/beers/coors_light.jpg' },
            { name: 'Corona', description: '12oz', price: 4.49, category: 'Beers', image: 'assets/beers/corona.jpg' },

            // Wines/Spirits
            { name: 'Margaritas', description: '750ml', price: 15.99, category: 'Wine/Spirits', image: 'assets/wines/margaritas.jpg' },
            { name: 'Red Wine - Cabernet', description: '750ml', price: 18.99, category: 'Wine/Spirits', image: 'assets/wines/red_wine_cabernet.jpg' },
            { name: 'Red Wine - Merlot', description: '750ml', price: 17.99, category: 'Wine/Spirits', image: 'assets/wines/red_wines_merlot.jpg' },
            { name: "Tito's vodka", description: '750ml', price: 24.99, category: 'Wine/Spirits', image: 'assets/wines/titos_vodka.jpg' },
            { name: 'Truly', description: '24 Pk', price: 19.99, category: 'Wine/Spirits', image: 'assets/wines/truly.jpg' },
            { name: 'White Claw', description: '6 Pk Blackcherry', price: 12.99, category: 'Wine/Spirits', image: 'assets/wines/white_claw.jpg' },
            { name: 'White Wine - Sauvignon', description: '750ml', price: 16.99, category: 'Wine/Spirits', image: 'assets/wines/white_wine_sauvignon.jpg' },

            // Salads
            { name: 'Caesar Salad', description: 'Romaine, parmesan', price: 7.99, category: 'Salads', image: 'logo/icon_foreground.png' },
            { name: 'Greek Salad', description: 'Feta, olives', price: 8.99, category: 'Salads', image: 'logo/icon_foreground.png' },
            { name: 'Garden Salad', description: 'Mixed greens', price: 6.99, category: 'Salads', image: 'logo/icon_foreground.png' }
        ];

        console.log('🛍️ Creating products...');
        for (const product of products) {
            const categoryId = createdCategories[product.category].id;
            const { category, ...productData } = product;

            // Check if product already exists by name
            const existingProduct = await prisma.product.findFirst({
                where: { name: product.name }
            });

            if (existingProduct) {
                console.log(`⚠️ Product already exists: ${product.name}`);
                continue;
            }

            const created = await prisma.product.create({
                data: { ...productData, categoryId, stock: 100 } // Default stock
            });
            console.log(`✅ Product created: ${created.name} - $${created.price}`);
        }

        console.log('🎉 Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    seedCategoriesAndProducts()
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export default seedCategoriesAndProducts;