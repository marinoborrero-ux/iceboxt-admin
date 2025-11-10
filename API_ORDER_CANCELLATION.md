# 📱 API de Cancelación de Órdenes - Documentación

## 🎯 Endpoint para Cancelar Órdenes

### **POST `/api/orders/{id}/cancel`**

Permite a los clientes cancelar sus propias órdenes desde la aplicación móvil.

---

## 📋 **Información del Endpoint**

- **URL**: `/api/orders/{id}/cancel`
- **Método**: `POST`
- **Acceso**: Público (sin autenticación admin)
- **CORS**: Habilitado para apps móviles
- **Validación**: Solo el propietario puede cancelar su orden

---

## 📤 **Request (Petición)**

### **Headers**
```http
Content-Type: application/json
X-User-Email: cliente@email.com (opcional)
```

### **URL Parameters**
- `id` (string, required): ID único de la orden a cancelar

### **Body**
```json
{
  "customerEmail": "cliente@email.com",
  "reason": "Cambié de opinión" // opcional
}
```

### **Campos del Body**
- `customerEmail` (string, required): Email del cliente propietario de la orden
- `reason` (string, optional): Motivo de la cancelación

---

## 📥 **Response (Respuesta)**

### **✅ Éxito (200)**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "id": "order_123",
    "orderNumber": "ORD-000001",
    "status": "CANCELLED",
    "total": 25.50,
    "deliveryAddress": "123 Main St",
    "notes": "Entrega rápida\n\nCANCELLED BY CUSTOMER: Cambié de opinión",
    "createdAt": "2025-11-10T10:30:00Z",
    "updatedAt": "2025-11-10T11:15:00Z",
    "customer": {
      "id": "customer_123",
      "name": "Juan Pérez",
      "email": "juan@email.com"
    },
    "items": [
      {
        "id": "item_1",
        "quantity": 2,
        "price": 12.75,
        "product": {
          "id": "product_1",
          "name": "Vanilla Ice Cream",
          "description": "Premium vanilla ice cream"
        }
      }
    ]
  }
}
```

### **❌ Errores Comunes**

#### **400 - Bad Request**
```json
{
  "success": false,
  "error": "Customer email is required"
}
```

```json
{
  "success": false,
  "error": "Cannot cancel order: Order has already been delivered"
}
```

```json
{
  "success": false,
  "error": "Order is already cancelled"
}
```

#### **403 - Forbidden**
```json
{
  "success": false,
  "error": "Unauthorized: You can only cancel your own orders"
}
```

#### **404 - Not Found**
```json
{
  "success": false,
  "error": "Order not found"
}
```

---

## 🔒 **Validaciones de Seguridad**

### **1. Propiedad de la Orden**
- Solo el cliente propietario puede cancelar la orden
- Se valida que el `customerEmail` coincida con el email del cliente de la orden

### **2. Estado de la Orden**
- ✅ **PENDING**: Se puede cancelar
- ✅ **IN_PROGRESS**: Se puede cancelar 
- ❌ **DELIVERED**: NO se puede cancelar
- ❌ **CANCELLED**: Ya cancelada

### **3. Restauración de Inventario**
- Al cancelar, se restaura automáticamente el stock de productos
- Se actualiza el inventario usando transacciones de base de datos

---

## 📱 **Ejemplos de Uso**

### **React Native / Flutter**
```javascript
// Cancelar orden
const cancelOrder = async (orderId, customerEmail, reason) => {
  try {
    const response = await fetch(`https://tu-app.com/api/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerEmail: customerEmail,
        reason: reason
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('Orden cancelada:', result.order);
      // Actualizar UI
    } else {
      console.error('Error:', result.error);
      // Mostrar error al usuario
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Uso
cancelOrder('order_123', 'cliente@email.com', 'Cambié de opinión');
```

### **cURL**
```bash
curl -X POST https://tu-app.com/api/orders/order_123/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "cliente@email.com",
    "reason": "Cambié de opinión"
  }'
```

---

## 🚀 **URLs de Producción**

- **Render**: `https://tu-app.render.com/api/orders/{id}/cancel`
- **Local**: `http://localhost:3000/api/orders/{id}/cancel`

---

## 📝 **Notas Importantes**

1. **Transacciones**: La cancelación se procesa en una transacción de base de datos para garantizar consistencia
2. **Inventario**: El stock se restaura automáticamente al cancelar
3. **Historial**: El motivo de cancelación se guarda en las notas de la orden
4. **CORS**: Habilitado para permitir llamadas desde apps móviles
5. **Logging**: Todas las cancelaciones se registran en los logs del servidor

---

## 🔄 **Estados de Orden**

| Estado | Descripción | ¿Se puede cancelar? |
|--------|-------------|-------------------|
| `PENDING` | Orden creada, esperando procesamiento | ✅ Sí |
| `IN_PROGRESS` | Orden siendo preparada o en camino | ✅ Sí |
| `DELIVERED` | Orden entregada | ❌ No |
| `CANCELLED` | Orden cancelada | ❌ Ya cancelada |

---

## 🛠️ **Testing**

Para probar el endpoint, puedes usar el dashboard de administración o crear órdenes de prueba y luego cancelarlas usando esta API.

**Recomendación**: Implementar confirmación en la app móvil antes de cancelar una orden.