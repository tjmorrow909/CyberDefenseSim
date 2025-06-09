#!/usr/bin/env node

/**
 * Generate secure environment variables for production deployment
 * This script helps create the required environment variables for Render deployment
 */

import crypto from 'crypto';

function generateSecureSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateEnvVars() {
  const jwtSecret = generateSecureSecret(32);
  const sessionSecret = generateSecureSecret(32);
  
  console.log('='.repeat(60));
  console.log('🔐 SECURE ENVIRONMENT VARIABLES FOR PRODUCTION');
  console.log('='.repeat(60));
  console.log('');
  console.log('Copy these values to your Render dashboard:');
  console.log('');
  console.log('📋 REQUIRED ENVIRONMENT VARIABLES:');
  console.log('');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`SESSION_SECRET=${sessionSecret}`);
  console.log('NODE_ENV=production');
  console.log('PORT=5000');
  console.log('ALLOWED_ORIGINS=https://cyberdefensesim.onrender.com');
  console.log('');
  console.log('📋 DATABASE CONFIGURATION:');
  console.log('');
  console.log('DATABASE_URL=<your-postgresql-connection-string>');
  console.log('');
  console.log('💡 NOTES:');
  console.log('- DATABASE_URL will be automatically set if you use render.yaml');
  console.log('- JWT_SECRET and SESSION_SECRET are randomly generated secure values');
  console.log('- Keep these secrets secure and never commit them to version control');
  console.log('- Update ALLOWED_ORIGINS if you use a custom domain');
  console.log('');
  console.log('🚀 RENDER DEPLOYMENT STEPS:');
  console.log('');
  console.log('1. Go to your Render dashboard');
  console.log('2. Navigate to your service settings');
  console.log('3. Go to Environment Variables section');
  console.log('4. Add each variable above (except DATABASE_URL if using render.yaml)');
  console.log('5. Save and redeploy your service');
  console.log('');
  console.log('='.repeat(60));
}

function generateRenderYamlEnvVars() {
  console.log('');
  console.log('📄 FOR render.yaml DEPLOYMENT:');
  console.log('');
  console.log('If you\'re using the render.yaml file, it will automatically:');
  console.log('- Create a PostgreSQL database and set DATABASE_URL');
  console.log('- Generate JWT_SECRET and SESSION_SECRET');
  console.log('- Set other required environment variables');
  console.log('');
  console.log('Simply push the render.yaml file to your repository and Render will handle the rest!');
  console.log('');
}

// Run the functions
generateEnvVars();
generateRenderYamlEnvVars();

export { generateSecureSecret, generateEnvVars };
