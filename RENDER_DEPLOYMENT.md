# Render.com Deployment Configuration

## Manual Settings in Render Dashboard:

1. **Build Command:**
   ```
   npm install --legacy-peer-deps && npx prisma generate && npm run build
   ```

2. **Start Command:**
   ```
   npm start
   ```

3. **Environment Variables:**
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `postgresql://iceboxdb_user:eiV1gm2ffXwJ3l9lZ6FnPGI7KkSRLZOw@dpg-d3dc8n0dl3ps73bv3f50-a.oregon-postgres.render.com/icebox_db`
   - `NEXTAUTH_URL` = `https://[your-render-service-name].onrender.com`
   - `NEXTAUTH_SECRET` = `[generate-random-32-char-string]`

## Key Changes Made:

1. **Dependencies Fix:** Moved `tailwindcss`, `tailwind-merge`, `tailwindcss-animate`, and `postcss` from devDependencies to dependencies
2. **Build Configuration:** Using npm instead of yarn with legacy peer deps support
3. **Prisma Generation:** Explicit prisma generate step in build process

## Important Notes:

- The service uses npm with `--legacy-peer-deps` to resolve dependency conflicts
- Tailwind CSS dependencies must be in production dependencies for build to succeed
- Environment variables must be configured in Render dashboard