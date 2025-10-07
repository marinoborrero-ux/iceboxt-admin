-- Script para crear órdenes de prueba DISPONIBLES para drivers
-- Estas órdenes están en estado PENDING y sin driver asignado

-- 1. Crear un customer de prueba si no existe
INSERT INTO customers (id, first_name, last_name, email, phone, address, city, zip_code, is_active, created_at, updated_at)
VALUES (
  'test-customer-pending-001',
  'Available',
  'Order Customer',
  'available.order@test.com',
  '+1555-TEST-001',
  '123 Pending Street',
  'Available City',
  '12345',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 2. Crear órdenes PENDING sin driver asignado
INSERT INTO orders (id, order_number, status, total, delivery_address, notes, customer_id, delivery_person_id, created_at, updated_at)
VALUES 
(
  'test-order-pending-001',
  'AVAIL-001-' || EXTRACT(EPOCH FROM NOW()),
  'PENDING',
  15.99,
  '123 Pending Street, Available City, AC 12345',
  'Test order available for drivers - Pizza delivery',
  'test-customer-pending-001',
  NULL,  -- ⭐ Sin driver asignado
  NOW(),
  NOW()
),
(
  'test-order-pending-002', 
  'AVAIL-002-' || EXTRACT(EPOCH FROM NOW()),
  'PENDING',
  22.50,
  '456 Available Avenue, Driver Town, DT 67890',
  'Test order available for drivers - Sandwich and drinks',
  'test-customer-pending-001',
  NULL,  -- ⭐ Sin driver asignado
  NOW(),
  NOW()
),
(
  'test-order-pending-003',
  'AVAIL-003-' || EXTRACT(EPOCH FROM NOW()),
  'PENDING',
  8.75,
  '789 Ready Road, Pickup Plaza, PP 54321',
  'Test order available for drivers - Quick snack',
  'test-customer-pending-001', 
  NULL,  -- ⭐ Sin driver asignado
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar las órdenes creadas
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total,
  o.delivery_address,
  o.delivery_person_id,
  c.first_name,
  c.last_name,
  o.created_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'PENDING' 
  AND o.delivery_person_id IS NULL
ORDER BY o.created_at DESC;