# Deployment Guide for Render.com

## 🚀 Pasos para Deploy en Render.com

### 1. Preparar el Repositorio Git

```bash
cd c:\icebox_admin_v3\iceboxt_admin_local\app
git init
git add .
git commit -m "Initial commit - IceBoxT Admin System"
```

### 2. Subir a GitHub

1. Crea un repositorio en GitHub llamado `iceboxt-admin`
2. Conecta tu repositorio local:

```bash
git remote add origin https://github.com/tu-usuario/iceboxt-admin.git
git branch -M main
git push -u origin main
```

### 3. Configurar en Render.com

#### A. Crear PostgreSQL Database

1. Ve a [Render.com](https://render.com)
2. Crea una nueva **PostgreSQL Database**
3. Nombre: `iceboxt-db`
4. Plan: Free
5. Copia la **Internal Database URL**

#### B. Crear Web Service

1. Crea un nuevo **Web Service**
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Name**: `iceboxt-admin`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`

#### C. Variables de Entorno

Configura estas variables en Render.com:

```bash
NODE_ENV=production
DATABASE_URL=[Tu Database URL de Render]
NEXTAUTH_URL=https://iceboxt-admin.onrender.com
NEXTAUTH_SECRET=[Genera una clave secura de 32+ caracteres]
```

### 4. Configurar Base de Datos

Después del primer deploy, ejecuta las migraciones:

1. Ve a tu PostgreSQL database en Render
2. Usa el **psql** console o conecta desde tu aplicación
3. Las tablas se crearán automáticamente con Prisma

### 5. Configurar App Móvil

Actualiza la URL en tu app Flutter:

```dart
// En api_service.dart
static const String defaultBaseUrl = kDebugMode
    ? 'http://10.0.2.2:3001' // Local development
    : 'https://iceboxt-admin.onrender.com'; // Production
```

### 6. Verificar Deployment

Tu aplicación estará disponible en:
- **Admin Panel**: `https://iceboxt-admin.onrender.com`
- **API Endpoints**: `https://iceboxt-admin.onrender.com/api/*`

### 🔗 URLs de la API para la App Móvil

- `POST /api/orders/mobile` - Crear pedidos
- `GET /api/orders/mobile/user?email=` - Obtener pedidos del usuario
- `GET /api/orders/mobile/stats` - Estadísticas
- `GET /api/orders/mobile/test` - Endpoint de prueba

### ⚠️ Consideraciones Importantes

1. **Free Tier Limitations**:
   - La aplicación se "duerme" después de 15 min de inactividad
   - Primer request puede tardar 30+ segundos
   - 750 horas/mes de tiempo activo

2. **Database**:
   - PostgreSQL free tier: 1GB de almacenamiento
   - Conexiones limitadas

3. **Monitoreo**:
   - Usa Render dashboard para logs
   - Configura health checks si es necesario

### 🔄 Updates

Para actualizar la aplicación:

```bash
git add .
git commit -m "Update description"
git push origin main
```

Render detectará los cambios y realizará el deploy automáticamente.

---

## 📱 Configuración Final para App Móvil

Una vez que tengas la URL de producción, actualiza:

1. **ApiService** con la URL de producción
2. **Rebuild** la app Flutter
3. **Test** la conexión con el servidor en producción

¡Tu sistema completo estará funcionando en la nube! 🎉