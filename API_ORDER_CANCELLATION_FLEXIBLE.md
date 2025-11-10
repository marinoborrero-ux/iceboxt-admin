# 🎯 API Cancelación de Órdenes - ID o Número de Orden

## ✨ **Nueva Funcionalidad: Cancelar por ID o Número de Orden**

El endpoint `/api/orders/{id}/cancel` ahora acepta **tanto el ID interno como el número de orden** para mayor flexibilidad.

---

## 📋 **Formatos Aceptados**

### **1. Por ID Interno** 
```
/api/orders/cm2abc123xyz456/cancel
```

### **2. Por Número de Orden**
```
/api/orders/ORD-000123/cancel
```

---

## 🌐 **Ejemplos de Uso**

### **GET (Testing) - Por ID**
```
https://tu-app.com/api/orders/cm2abc123xyz456/cancel?reason=Test por ID
```

### **GET (Testing) - Por Número de Orden**
```
https://tu-app.com/api/orders/ORD-000123/cancel?reason=Test por número de orden
```

### **POST (Producción) - Por ID**
```javascript
fetch('/api/orders/cm2abc123xyz456/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerEmail: 'cliente@email.com',
    reason: 'Cancelación por ID'
  })
});
```

### **POST (Producción) - Por Número de Orden**
```javascript
fetch('/api/orders/ORD-000123/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerEmail: 'cliente@email.com',
    reason: 'Cancelación por número de orden'
  })
});
```

---

## 📥 **Respuesta Mejorada**

La respuesta ahora incluye información sobre cómo se encontró la orden:

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "foundBy": "Order found by Order Number: ORD-000123",
  "order": {
    "id": "cm2abc123xyz456",
    "orderNumber": "ORD-000123",
    "status": "CANCELLED",
    "total": 25.50,
    "customer": { ... },
    "items": [ ... ]
  },
  "testUrls": {
    "testThisOrderById": "https://localhost:3000/api/orders/cm2abc123xyz456/cancel?reason=Test by ID",
    "testThisOrderByNumber": "https://localhost:3000/api/orders/ORD-000123/cancel?reason=Test by order number"
  }
}
```

---

## 🔍 **Lógica de Búsqueda**

1. **Primero**: Busca por ID interno
2. **Si no encuentra**: Busca por número de orden
3. **Si no encuentra**: Retorna error 404

---

## 📱 **Ejemplos por Tecnología**

### **React Native**
```javascript
// Cancelar por número de orden (más user-friendly)
const cancelOrderByNumber = async (orderNumber, customerEmail, reason) => {
  try {
    const response = await fetch(`https://tu-app.com/api/orders/${orderNumber}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerEmail: customerEmail,
        reason: reason
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Orden cancelada:', result.foundBy);
      console.log('Datos:', result.order);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Uso con número de orden
cancelOrderByNumber('ORD-000123', 'cliente@email.com', 'Cambié de opinión');

// Uso con ID interno (también funciona)
cancelOrderByNumber('cm2abc123xyz456', 'cliente@email.com', 'Error en pedido');
```

### **Flutter**
```dart
Future<void> cancelOrderByNumber(String orderNumber, String customerEmail, String reason) async {
  final url = Uri.parse('https://tu-app.com/api/orders/$orderNumber/cancel');
  
  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'customerEmail': customerEmail,
        'reason': reason,
      }),
    );

    final result = jsonDecode(response.body);
    
    if (result['success']) {
      print('✅ ${result['foundBy']}');
      print('Order: ${result['order']['orderNumber']}');
    }
  } catch (error) {
    print('❌ Error: $error');
  }
}

// Uso
cancelOrderByNumber('ORD-000123', 'cliente@email.com', 'Cancelar por número');
```

### **cURL Testing**
```bash
# Por número de orden
curl "https://tu-app.com/api/orders/ORD-000123/cancel?reason=Test por número"

# Por ID interno
curl "https://tu-app.com/api/orders/cm2abc123xyz456/cancel?reason=Test por ID"

# POST por número de orden
curl -X POST https://tu-app.com/api/orders/ORD-000123/cancel \
  -H "Content-Type: application/json" \
  -d '{"customerEmail": "cliente@email.com", "reason": "Test POST"}'
```

---

## 🎯 **Casos de Uso**

### **1. App Móvil del Cliente**
- Muestra **número de orden** al usuario (ej: "ORD-000123")
- Usa ese mismo número para cancelar
- Más intuitivo y user-friendly

### **2. Sistema Interno**
- Puede usar **ID interno** para operaciones técnicas
- Mantiene compatibilidad con sistemas existentes

### **3. Customer Support**
- El cliente dice "quiero cancelar la orden ORD-000123"
- Support puede usar directamente ese número
- No necesita buscar el ID interno

---

## ✅ **Ventajas de la Nueva Funcionalidad**

1. **🎨 User-Friendly**: Los usuarios ven números como "ORD-000123"
2. **🔄 Flexible**: Acepta ambos formatos automáticamente  
3. **📱 Mobile-First**: Perfecto para apps móviles
4. **🛠️ Developer-Friendly**: Mantiene compatibilidad existente
5. **📞 Support-Ready**: Facilita atención al cliente

---

## 🚀 **URLs de Testing**

### **Producción**
```
GET https://tu-app.render.com/api/orders/ORD-000123/cancel
POST https://tu-app.render.com/api/orders/ORD-000123/cancel
```

### **Local**
```
GET http://localhost:3000/api/orders/ORD-000123/cancel
POST http://localhost:3000/api/orders/ORD-000123/cancel
```

---

## 📝 **Notas Técnicas**

- ✅ **Backward Compatible**: Código existente sigue funcionando
- ✅ **Performance**: Solo una query adicional si no encuentra por ID
- ✅ **Security**: Mismas validaciones de seguridad
- ✅ **Logging**: Logs muestran cómo se encontró la orden
- ✅ **Testing**: GET endpoint actualizado para ambos formatos

¡Ahora es mucho más fácil cancelar órdenes usando el número que ven los usuarios! 🎉