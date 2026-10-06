const { execSync } = require('child_process');

console.log('🚀 Running build pipeline...');

if (process.env.VERCEL || process.env.CI) {
  console.log('📦 Production deployment environment detected (VERCEL/CI).');
  console.log('🔄 Running prisma db push to ensure production database schema is up-to-date...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Production database schema synchronized successfully!');
  } catch (err) {
    console.error('⚠️ Warning: prisma db push failed:', err.message);
    // Don't fail the build immediately if db push encounters non-fatal network issues
  }
} else {
  console.log('💻 Local environment detected. Skipping remote db push during local build.');
}

console.log('🔨 Building Next.js application...');
execSync('next build', { stdio: 'inherit' });
