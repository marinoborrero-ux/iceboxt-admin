# 🧪 API de Cancelación GET - Para Testing

## ⚠️ **IMPORTANTE: SOLO PARA TESTING**
Esta versión GET **NO TIENE VALIDACIONES DE SEGURIDAD** y está diseñada únicamente para pruebas fáciles. **NO usar en producción**.

---

## 🎯 **Endpoint GET para Testing**

### **GET `/api/orders/{id}/cancel`**

Permite cancelar órdenes fácilmente desde el navegador sin autenticación ni validaciones de seguridad.

---

## 📋 **Información del Endpoint**

- **URL**: `/api/orders/{id}/cancel`
- **Método**: `GET` (para testing) + `POST` (para producción)
- **Acceso**: Público (sin autenticación)
- **Seguridad**: ⚠️ **NINGUNA** - Solo para testing
- **CORS**: Habilitado

---

## 🌐 **Ejemplos de Uso GET (Testing)**

### **1. Cancelar desde Navegador**
```
https://tu-app.render.com/api/orders/XXX/cancel
```

### **2. Cancelar con Razón Personalizada**
```
https://tu-app.render.com/api/orders/XXX/cancel?reason=Test de cancelación desde navegador
```

### **3. Ejemplo con ID Real**
```
https://localhost:3000/api/orders/cm2abc123xyz/cancel?reason=Prueba de funcionalidad
```

---

## 📥 **Respuesta GET (Testing)**

### **✅ Éxito (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully (TEST MODE)",
  "testNote": "This was cancelled using the GET endpoint for testing. In production, use POST method with proper authentication.",
  "order": {
    "id": "XXX",
    "orderNumber": "ORD-000123",
    "status": "CANCELLED",
    "total": 25.50,
    "deliveryAddress": "123 Main St",
    "notes": "CANCELLED VIA GET TEST: Prueba de funcionalidad",
    "customer": {
      "id": "customer_123",
      "name": "Juan Pérez", 
      "email": "cliente@email.com"
    },
    "items": [...]
  },
  "testUrls": {
    "testThisOrder": "https://localhost:3000/api/orders/XXX/cancel?reason=Test cancellation",
    "createTestOrder": "https://localhost:3000/api/test/create-test-order",
    "viewAllOrders": "https://localhost:3000/api/orders/mobile"
  }
}
```

### **❌ Errores:**

#### **404 - Orden No Encontrada**
```json
{
  "success": false,
  "error": "Order not found", 
  "testNote": "Use a valid order ID"
}
```

#### **400 - Ya Entregada**
```json
{
  "success": false,
  "error": "Cannot cancel order: Order has already been delivered",
  "testNote": "Try with an order in PENDING or IN_PROGRESS status"
}
```

#### **400 - Ya Cancelada**
```json
{
  "success": false,
  "error": "Order is already cancelled",
  "testNote": "This order was already cancelled"
}
```

---

## 🔧 **Pasos para Testing**

### **1. Obtener ID de una Orden**
```bash
# Ver todas las órdenes
curl https://localhost:3000/api/orders/mobile

# O crear una orden de prueba
curl -X POST https://localhost:3000/api/test/create-test-order
```

### **2. Cancelar la Orden (GET)**
```bash
# Método 1: Navegador (más fácil)
https://localhost:3000/api/orders/ORDEN_ID/cancel

# Método 2: cURL
curl "https://localhost:3000/api/orders/ORDEN_ID/cancel?reason=Test"
```

### **3. Verificar Cancelación**
```bash
# Ver la orden cancelada
curl https://localhost:3000/api/orders/mobile
```

---

## 📱 **Diferencias GET vs POST**

| Aspecto | GET (Testing) | POST (Producción) |
|---------|---------------|-------------------|
| **Seguridad** | ❌ Ninguna | ✅ Validación de email |
| **Uso** | 🧪 Solo testing | 📱 Apps móviles |
| **Parámetros** | Query string | JSON body |
| **Facilidad** | 🟢 Muy fácil | 🟡 Requiere cliente HTTP |
| **Navegador** | ✅ Directo | ❌ Requiere JavaScript |

---

## 🚨 **URLs de Testing Disponibles**

### **Local (Desarrollo)**
```
GET http://localhost:3000/api/orders/{ORDER_ID}/cancel
```

### **Producción (Render)**
```  
GET https://tu-app.render.com/api/orders/{ORDER_ID}/cancel
```

---

## 📝 **Ejemplos Reales de Testing**

### **Ejemplo 1: Testing Básico**
```javascript
// Abrir en navegador o fetch desde consola
fetch('http://localhost:3000/api/orders/cm2abc123xyz/cancel')
  .then(res => res.json())
  .then(data => console.log(data));
```

### **Ejemplo 2: Con Razón Personalizada**
```javascript
fetch('http://localhost:3000/api/orders/cm2abc123xyz/cancel?reason=Prueba desde JavaScript')
  .then(res => res.json()) 
  .then(data => console.log(data));
```

### **Ejemplo 3: Verificar Estado**
```javascript
// Después de cancelar, verificar que cambió el estado
fetch('http://localhost:3000/api/orders/mobile')
  .then(res => res.json())
  .then(data => {
    const order = data.data.orders.find(o => o.id === 'cm2abc123xyz');
    console.log('Estado de la orden:', order.status); // Debería ser 'CANCELLED'
  });
```

---

## ⚡ **Flujo de Testing Completo**

### **Paso 1: Crear Orden de Prueba**
```bash
curl -X POST http://localhost:3000/api/test/create-test-order
# Respuesta: { "orderId": "cm2abc123xyz" }
```

### **Paso 2: Ver la Orden Creada** 
```bash
curl http://localhost:3000/api/orders/mobile
# Buscar la orden con status: "PENDING"
```

### **Paso 3: Cancelar con GET**
```bash
# Desde navegador:
http://localhost:3000/api/orders/cm2abc123xyz/cancel?reason=Testing
```

### **Paso 4: Verificar Cancelación**
```bash
curl http://localhost:3000/api/orders/mobile
# La orden debería tener status: "CANCELLED"
```

---

## 🔒 **Para Producción (Usar POST)**

Una vez que compruebes que funciona con GET, usa el método POST seguro:

```javascript
fetch('/api/orders/ORDER_ID/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerEmail: 'cliente@email.com',
    reason: 'Razón real'
  })
})
```

---

## ⚠️ **Notas de Seguridad**

1. **GET es solo para testing** - No expone emails ni datos sensibles
2. **POST es para producción** - Requiere validación del propietario
3. **Ambos restauran el inventario** automáticamente
4. **Logs completos** en ambas versiones para debugging

¡Perfecto para testing rápido y desarrollo! 🚀