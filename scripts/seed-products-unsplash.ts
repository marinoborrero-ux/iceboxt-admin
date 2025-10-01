import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategoriesAndProducts() {
    console.log('🌱 Starting to seed categories and products with Unsplash images...');

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

        // 2. Crear los productos con imágenes de Unsplash
        const products = [
            // Foods
            { name: 'BLT', description: 'White bread, bacon, tomato', price: 8.99, category: 'Foods', image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=800' },
            { name: 'Chicken Caesar Wrap', description: 'Romaine, Caesar dressing', price: 9.99, category: 'Foods', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800' },
            { name: 'Chicken Salad', description: 'Herbed mayo with mixed greens', price: 8.49, category: 'Foods', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' },
            { name: 'Fried Chicken Sandwich', description: 'Crispy chicken, pickles', price: 10.99, category: 'Foods', image: 'https://images.unsplash.com/photo-1606755456206-1c77803aaf2c?w=800' },
            { name: 'Ham & Cheese', description: 'Classic deli ham', price: 7.99, category: 'Foods', image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=800' },
            { name: 'Tuna Salad', description: 'Tuna, mayo, celery', price: 8.49, category: 'Foods', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800' },
            { name: 'Turkey & Swiss', description: 'Smoked turkey with Swiss', price: 9.49, category: 'Foods', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800' },

            // Snacks
            { name: 'Apples', description: '5 apples', price: 3.99, category: 'Snacks', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800' },
            { name: 'Chips Ahoy', description: '14.3 ounces', price: 4.49, category: 'Snacks', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800' },
            { name: 'Doritos', description: 'Cool Ranch', price: 3.99, category: 'Snacks', image: 'https://images.unsplash.com/photo-1606755456206-1c77803aaf2c?w=800' },
            { name: 'Oranges', description: '5 oranges', price: 4.99, category: 'Snacks', image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800' },

            // Drinks
            { name: 'Coca-Cola', description: '12oz can', price: 1.99, category: 'Drinks/Mixer', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800' },
            { name: 'Pepsi', description: '12oz can', price: 1.99, category: 'Drinks/Mixer', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=800' },
            { name: 'Dr Pepper', description: '12oz can', price: 1.99, category: 'Drinks/Mixer', image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=800' },
            { name: 'Mountain Dew', description: '12oz can', price: 1.99, category: 'Drinks/Mixer', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800' },
            { name: 'Sprite', description: '12oz can', price: 1.99, category: 'Drinks/Mixer', image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800' },

            // Beers
            { name: 'Budweiser', description: '12oz', price: 3.99, category: 'Beers', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800' },
            { name: 'Bud Light', description: '12oz', price: 3.99, category: 'Beers', image: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=800' },
            { name: 'Coors Light', description: '12oz', price: 3.99, category: 'Beers', image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800' },
            { name: 'Corona', description: '12oz', price: 4.49, category: 'Beers', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800' },

            // Wines/Spirits
            { name: 'Margaritas', description: '750ml', price: 15.99, category: 'Wine/Spirits', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800' },
            { name: 'Red Wine - Cabernet', description: '750ml', price: 18.99, category: 'Wine/Spirits', image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800' },
            { name: 'Red Wine - Merlot', description: '750ml', price: 17.99, category: 'Wine/Spirits', image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800' },
            { name: "Tito's vodka", description: '750ml', price: 24.99, category: 'Wine/Spirits', image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800' },
            { name: 'Truly', description: '24 Pk', price: 19.99, category: 'Wine/Spirits', image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800' },
            { name: 'White Claw', description: '6 Pk Blackcherry', price: 12.99, category: 'Wine/Spirits', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800' },
            { name: 'White Wine - Sauvignon', description: '750ml', price: 16.99, category: 'Wine/Spirits', image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800' },

            // Salads
            { name: 'Caesar Salad', description: 'Romaine, parmesan', price: 7.99, category: 'Salads', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' },
            { name: 'Greek Salad', description: 'Feta, olives', price: 8.99, category: 'Salads', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800' },
            { name: 'Garden Salad', description: 'Mixed greens', price: 6.99, category: 'Salads', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' }
        ];

        console.log('🛍️ Updating products with Unsplash images...');
        for (const product of products) {
            const categoryId = createdCategories[product.category].id;
            const { category, ...productData } = product;

            // Check if product exists first
            const existingProduct = await prisma.product.findFirst({
                where: { name: product.name }
            });

            if (existingProduct) {
                // Update existing product
                await prisma.product.update({
                    where: { id: existingProduct.id },
                    data: { ...productData, categoryId, stock: 100 }
                });
            } else {
                // Create new product
                await prisma.product.create({
                    data: { ...productData, categoryId, stock: 100 }
                });
            }
            console.log(`✅ Product updated: ${product.name} - $${product.price}`);
        }

        console.log('🎉 Seeding completed successfully with Unsplash images!');
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