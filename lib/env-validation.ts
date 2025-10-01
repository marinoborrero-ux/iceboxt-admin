// Environment validation for production deployment
export function validateEnvVars() {
    // Skip validation during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.log('⏭️ Skipping env validation during build phase');
        return;
    }

    const requiredEnvVars = [
        'DATABASE_URL',
        'NEXTAUTH_URL',
        'NEXTAUTH_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });

        console.error('\n🔧 Required variables for Render.com:');
        console.error('DATABASE_URL=postgresql://...');
        console.error('NEXTAUTH_URL=https://your-app.onrender.com');
        console.error('NEXTAUTH_SECRET=your-32-char-secret');

        // Only throw error in production runtime, not build time
        if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
            console.warn('⚠️ Missing environment variables in production runtime');
        }
    } else {
        console.log('✅ All required environment variables are configured');
    }
}

// Only validate in runtime, not during build
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    validateEnvVars();
}