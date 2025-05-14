/**
 * Helper script to install optional dependencies for CV parsing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing optional dependencies for CV parsing...');

try {
  // Check if package.json exists
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('Error: package.json not found. Please run this script from the Backend directory.');
    process.exit(1);
  }

  // Install pdf-parse for PDF extraction
  console.log('Installing pdf-parse...');
  execSync('npm install pdf-parse', { stdio: 'inherit' });
  
  console.log('\n✅ Optional dependencies installed successfully!');
  console.log('\nYou can now use the CV parsing feature with PDF files.');
  console.log('Restart your server to apply these changes.');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  console.error('\nPlease try installing them manually:');
  console.error('npm install pdf-parse');
  process.exit(1);
} 