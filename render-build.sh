#!/bin/bash

# Render.com build script with environment setup
echo "🚀 Starting Render.com build process..."

# Set default values for build if not provided
export NEXTAUTH_URL=${NEXTAUTH_URL:-"https://iceboxt-admin.onrender.com"}
export NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-"build-time-placeholder-secret-key"}
export DATABASE_URL=${DATABASE_URL:-"postgresql://placeholder:placeholder@localhost:5432/placeholder"}

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
echo "🔄 App will start with: npm start"