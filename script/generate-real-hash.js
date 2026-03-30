// generate-real-hash.js
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'Instructor@123';
  
  console.log('🔐 Generating hash for:', password);
  
  // Generate hash
  const hash = await bcrypt.hash(password, 12);
  
  console.log('\n✅ Hash generated successfully!\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('Hash length:', hash.length);
  
  // Verify the hash works
  const isValid = await bcrypt.compare(password, hash);
  console.log('\n🧪 Verification test:', isValid ? '✅ PASS' : '❌ FAIL');
  
  console.log('\n📋 Copy this SQL command:\n');
  console.log(`UPDATE users SET password = '${hash}' WHERE email = 'instructor@unchiudaan.com';`);
  console.log('\n');
}

generateHash();
