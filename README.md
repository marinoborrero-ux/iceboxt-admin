# IceBoxT Admin - Sistema de Administración para Comidas

## 🚀 Deployment en Render.com

### Configuración de Variables de Entorno

En Render.com, configura estas variables de entorno:

```bash
DATABASE_URL=postgresql://username:password@hostname:port/database
NEXTAUTH_URL=https://tu-app.onrender.com
NEXTAUTH_SECRET=tu-clave-secreta-muy-segura-de-32-caracteres-minimo
```

### Build Commands

- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### Configuración de Base de Datos

1. Crea un PostgreSQL database en Render.com
2. Copia la DATABASE_URL desde el dashboard de Render
3. Configura las variables de entorno en tu web service

## 📱 Aplicación Móvil Flutter

La aplicación móvil Flutter se conecta a esta API a través de los endpoints:
- `/api/orders/mobile` - Crear órdenes
- `/api/orders/mobile/user` - Obtener órdenes del usuario
- `/api/orders/mobile/stats` - Estadísticas

## 🔧 Desarrollo Local

```bash
npm install
npm run dev
```

## 📊 Base de Datos

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```