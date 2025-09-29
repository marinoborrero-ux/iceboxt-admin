# 🚨 Error de Configuración NextAuth - Solución

## Problema
Error: `Configuration` en `https://iceboxt-admin.onrender.com/api/auth/error?error=Configuration`

## Causa
NextAuth requiere configuración específica de variables de entorno en producción.

## 🔧 Solución: Variables de Entorno en Render.com

Accede a tu **Web Service** en Render.com y configura estas variables:

### 1. Variables Requeridas

```bash
DATABASE_URL=postgresql://iceboxdb_user:eiV1gm2ffXwJ3l9lZ6FnPGI7KkSRLZOw@dpg-d3dc8n0dl3ps73bv3f50-a/icebox_db

NEXTAUTH_URL=https://iceboxt-admin.onrender.com

NEXTAUTH_SECRET=tu-clave-super-secreta-de-32-caracteres-minimo-aqui-ejemplo-abc123

NODE_ENV=production
```

### 2. Generar NEXTAUTH_SECRET

Usa uno de estos métodos para generar una clave segura:

**Opción A - Online:**
- Ve a: https://generate-secret.vercel.app/32
- Copia la clave generada

**Opción B - Comando:**
```bash
openssl rand -base64 32
```

**Opción C - Manual:**
Usa una cadena aleatoria de 32+ caracteres como:
```
a7f8d9e2b3c4f6g8h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9
```

### 3. Configuración Paso a Paso en Render.com

1. **Ve a tu Web Service Dashboard**
2. **Click en "Environment"**
3. **Agrega cada variable:**
   - Key: `DATABASE_URL` | Value: `postgresql://iceboxdb_user...`
   - Key: `NEXTAUTH_URL` | Value: `https://iceboxt-admin.onrender.com`
   - Key: `NEXTAUTH_SECRET` | Value: `tu-clave-generada`
   - Key: `NODE_ENV` | Value: `production`

4. **Click "Save Changes"**
5. **Espera el redeploy automático**

### 4. Verificación

Después del deploy, verifica:
- ✅ `https://iceboxt-admin.onrender.com` - Página principal
- ✅ `https://iceboxt-admin.onrender.com/auth/signin` - Login
- ✅ `https://iceboxt-admin.onrender.com/api/orders/mobile` - API móvil

### 🚨 Importante

- La `NEXTAUTH_URL` debe ser **exactamente** tu URL de Render
- El `NEXTAUTH_SECRET` debe ser único y seguro
- No uses espacios en las variables de entorno

### 🔄 Si persiste el error

1. Verifica que todas las variables estén configuradas
2. Fuerza un redeploy desde Render dashboard
3. Revisa los logs en Render para más detalles