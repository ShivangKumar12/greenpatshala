// server/scripts/updatePasswords.js
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');
const { users } = require('../../shared/schema');
const { eq } = require('drizzle-orm');

async function updatePasswords() {
  try {
    console.log('🔐 Updating passwords with proper bcrypt hashes...');

    // Hash passwords with bcrypt (same rounds as registration: 12)
    const adminPassword = await bcrypt.hash('Admin@12345', 12);
    const instructorPassword = await bcrypt.hash('Instructor@123', 12);

    // Update Admin
    await db.update(users)
      .set({ password: adminPassword })
      .where(eq(users.email, 'admin@unchiudaan.com'));

    console.log('✅ Admin password updated');

    // Update Instructor
    await db.update(users)
      .set({ password: instructorPassword })
      .where(eq(users.email, 'instructor@unchiudaan.com'));

    console.log('✅ Instructor password updated');
    console.log('\n🎉 Passwords updated successfully!');
    console.log('\n📧 Test Credentials:');
    console.log('   Admin: admin@unchiudaan.com / Admin@12345');
    console.log('   Instructor: instructor@unchiudaan.com / Instructor@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updatePasswords();
