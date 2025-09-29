// Environment validation for production deployment
export function validateEnvVars() {
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
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables in production');
    }
  } else {
    console.log('✅ All required environment variables are configured');
  }
}

// Validate on import
if (process.env.NODE_ENV === 'production') {
  validateEnvVars();
}