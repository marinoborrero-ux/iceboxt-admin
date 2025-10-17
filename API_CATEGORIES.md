# 📋 API de Categorías - Documentación

## 🌐 Acceso Público (Sin Autenticación)

La API `/api/categories` ahora permite acceso público para obtener categorías sin necesidad de autenticación.

### 📡 **Endpoints Públicos**

#### **1. Obtener todas las categorías (paginado)**
```http
GET /api/categories
```

**Parámetros opcionales:**
- `page` - Número de página (default: 1)
- `limit` - Elementos por página (default: 10) 
- `search` - Buscar en nombre o descripción
- `all=true` - Obtener todas las categorías activas sin paginación

**Ejemplos:**
```http
GET /api/categories
GET /api/categories?page=2&limit=20
GET /api/categories?search=ice cream
GET /api/categories?all=true
```

**Respuesta:**
```json
{
  "categories": [
    {
      "id": "cat_123",
      "name": "Ice Cream",
      "description": "Premium ice cream varieties",
      "image": "https://images.unsplash.com/photo-123.jpg",
      "isActive": true,
      "createdAt": "2025-10-17T...",
      "updatedAt": "2025-10-17T...",
      "productCount": 15
    }
  ],
  "total": 6,
  "pages": 1,
  "currentPage": 1
}
```

## 🔐 Acceso Administrativo (Requiere Autenticación)

### **2. Funciones administrativas**
```http
GET /api/categories?admin=true
POST /api/categories
```

**Requiere:**
- Autenticación de usuario
- Rol de administrador
- Cookies de sesión válidas

### **3. Crear nueva categoría**
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Nueva Categoría",
  "description": "Descripción opcional",
  "image": "https://example.com/image.jpg",
  "isActive": true
}
```

## 🎯 **Casos de Uso**

### **Para Apps Móviles (Sin Auth)**
```javascript
// Obtener todas las categorías
const response = await fetch('/api/categories?all=true');
const categories = await response.json();

// Buscar categorías
const response = await fetch('/api/categories?search=helado');
const result = await response.json();
```

### **Para Dashboard Admin (Con Auth)**
```javascript
// Acceso administrativo
const response = await fetch('/api/categories?admin=true', {
  credentials: 'include'
});
```

## ✅ **Beneficios**

1. **🌍 Acceso público**: Apps móviles pueden obtener categorías sin autenticación
2. **🔒 Seguridad mantenida**: Funciones admin siguen protegidas
3. **⚡ Performance**: Sin verificación de sesión para consultas públicas
4. **🔄 Compatibilidad**: Dashboard admin sigue funcionando igual

## 📱 **URL de Ejemplo**

```
Producción: https://tu-app.render.com/api/categories
Local: http://localhost:3000/api/categories
```