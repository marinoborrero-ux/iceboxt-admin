-- Script para crear datos de prueba para órdenes disponibles

-- Crear algunos clientes de prueba
INSERT INTO customers (id, first_name, last_name, email, phone, address, city, zip_code, is_active, created_at, updated_at)
VALUES 
  ('test_customer_1', 'Juan', 'Pérez', 'juan.perez@email.com', '+1234567890', '123 Main Street', 'Downtown', '12345', true, NOW(), NOW()),
  ('test_customer_2', 'María', 'García', 'maria.garcia@email.com', '+1234567891', '456 Oak Avenue', 'Uptown', '12346', true, NOW(), NOW()),
  ('test_customer_3', 'Carlos', 'López', 'carlos.lopez@email.com', '+1234567892', '789 Pine Street', 'Midtown', '12347', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Crear algunas categorías de productos
INSERT INTO categories (id, name, description, is_active, created_at, updated_at)
VALUES 
  ('cat_beverages', 'Beverages', 'Cold drinks and beverages', true, NOW(), NOW()),
  ('cat_snacks', 'Snacks', 'Snacks and quick bites', true, NOW(), NOW()),
  ('cat_ice_cream', 'Ice Cream', 'Frozen treats and ice cream', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Crear algunos productos de prueba
INSERT INTO products (id, name, description, price, stock, is_active, category_id, created_at, updated_at)
VALUES 
  ('prod_coke', 'Coca Cola', 'Classic Coca Cola 350ml', 2.50, 100, true, 'cat_beverages', NOW(), NOW()),
  ('prod_water', 'Water Bottle', 'Purified water 500ml', 1.00, 200, true, 'cat_beverages', NOW(), NOW()),
  ('prod_chips', 'Potato Chips', 'Crispy potato chips', 3.00, 50, true, 'cat_snacks', NOW(), NOW()),
  ('prod_cookies', 'Chocolate Cookies', 'Delicious chocolate cookies', 4.50, 30, true, 'cat_snacks', NOW(), NOW()),
  ('prod_vanilla_ice', 'Vanilla Ice Cream', 'Premium vanilla ice cream', 6.00, 20, true, 'cat_ice_cream', NOW(), NOW()),
  ('prod_chocolate_ice', 'Chocolate Ice Cream', 'Rich chocolate ice cream', 6.50, 15, true, 'cat_ice_cream', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Crear algunas órdenes de prueba con estado PENDING
INSERT INTO orders (id, order_number, status, total, delivery_address, notes, customer_id, delivery_person_id, created_at, updated_at)
VALUES 
  ('order_test_1', 'ORD-001', 'PENDING', 8.00, '123 Main Street, Downtown', 'Please ring the doorbell twice', 'test_customer_1', NULL, NOW() - INTERVAL '5 minutes', NOW()),
  ('order_test_2', 'ORD-002', 'PENDING', 15.50, '456 Oak Avenue, Uptown', 'Leave at the front door if no answer', 'test_customer_2', NULL, NOW() - INTERVAL '10 minutes', NOW()),
  ('order_test_3', 'ORD-003', 'PENDING', 12.00, '789 Pine Street, Midtown', NULL, 'test_customer_3', NULL, NOW() - INTERVAL '15 minutes', NOW()),
  ('order_test_4', 'ORD-004', 'PENDING', 21.00, '321 Elm Street, Downtown', 'Call when you arrive', 'test_customer_1', NULL, NOW() - INTERVAL '20 minutes', NOW())
ON CONFLICT (id) DO NOTHING;

-- Crear items para las órdenes
INSERT INTO order_items (id, quantity, price, order_id, product_id)
VALUES 
  -- Orden 1: 2 Cokes + 1 Chips = $8.00
  ('item_1_1', 2, 2.50, 'order_test_1', 'prod_coke'),
  ('item_1_2', 1, 3.00, 'order_test_1', 'prod_chips'),
  
  -- Orden 2: 1 Water + 1 Cookies + 1 Vanilla Ice = $11.50 (pero total es 15.50, diferencia por delivery fee)
  ('item_2_1', 1, 1.00, 'order_test_2', 'prod_water'),
  ('item_2_2', 1, 4.50, 'order_test_2', 'prod_cookies'),
  ('item_2_3', 1, 6.00, 'order_test_2', 'prod_vanilla_ice'),
  
  -- Orden 3: 2 Waters + 2 Chips = $8.00 (pero total es 12.00, diferencia por delivery fee)
  ('item_3_1', 2, 1.00, 'order_test_3', 'prod_water'),
  ('item_3_2', 2, 3.00, 'order_test_3', 'prod_chips'),
  
  -- Orden 4: 1 Chocolate Ice + 1 Cookies + 2 Cokes = $16.50 (pero total es 21.00, diferencia por delivery fee)
  ('item_4_1', 1, 6.50, 'order_test_4', 'prod_chocolate_ice'),
  ('item_4_2', 1, 4.50, 'order_test_4', 'prod_cookies'),
  ('item_4_3', 2, 2.50, 'order_test_4', 'prod_coke')
ON CONFLICT (id) DO NOTHING;

-- Verificar que los datos se insertaron correctamente
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total,
  o.delivery_address,
  o.notes,
  c.first_name || ' ' || c.last_name as customer_name,
  c.phone as customer_phone,
  COUNT(oi.id) as item_count
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'PENDING'
GROUP BY o.id, o.order_number, o.status, o.total, o.delivery_address, o.notes, c.first_name, c.last_name, c.phone
ORDER BY o.created_at DESC;