# 🚀 Render.com Configuration

## Database Configuration

**PostgreSQL URL**: 
```
postgresql://iceboxdb_user:eiV1gm2ffXwJ3l9lZ6FnPGI7KkSRLZOw@dpg-d3dc8n0dl3ps73bv3f50-a/icebox_db
```

## Environment Variables for Render.com

Configure these in your Render.com Web Service:

```bash
DATABASE_URL=postgresql://iceboxdb_user:eiV1gm2ffXwJ3l9lZ6FnPGI7KkSRLZOw@dpg-d3dc8n0dl3ps73bv3f50-a/icebox_db
NEXTAUTH_URL=https://your-app-name.onrender.com
NEXTAUTH_SECRET=generate-a-secure-random-32-character-string
NODE_ENV=production
```

## Build Settings

- **Build Command**: `npm run render-build`
- **Start Command**: `npm start`
- **Node Version**: 18.x

## Deployment Steps

1. ✅ Code uploaded to GitHub: `marinoborrero-ux/iceboxt-admin`
2. ✅ Database URL configured
3. 🔄 Configure Web Service in Render.com
4. 🔄 Set environment variables
5. 🔄 Deploy!

## API Endpoints for Mobile App

Once deployed, your mobile app should use:
- Base URL: `https://your-app-name.onrender.com`
- Mobile API: `https://your-app-name.onrender.com/api/orders/mobile`

## Mobile App Configuration

Update `api_service.dart`:
```dart
static const String defaultBaseUrl = kDebugMode
    ? 'http://10.0.2.2:3001' 
    : 'https://your-app-name.onrender.com'; // Your Render URL
```