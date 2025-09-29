#!/bin/bash

# Build script for Render.com
echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build Next.js application
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"