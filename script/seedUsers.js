// server/scripts/seedUsers.js
const bcrypt = require('bcryptjs');
const { db } = require('../server/config/db');
const { users } = require('../shared/schema');

async function seedUsers() {
  try {
    console.log('🌱 Seeding admin and instructor users...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin@12345', 12);
    const instructorPassword = await bcrypt.hash('Instructor@123', 12);

    // Insert Admin
    await db.insert(users).values({
      name: 'Admin User',
      email: 'admin@unchiudaan.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      emailVerificationToken: null,
    });

    console.log('✅ Admin created: admin@unchiudaan.com');

    // Insert Instructor
    await db.insert(users).values({
      name: 'Instructor User',
      email: 'instructor@unchiudaan.com',
      password: instructorPassword,
      role: 'instructor',
      isVerified: true,
      emailVerificationToken: null,
    });

    console.log('✅ Instructor created: instructor@unchiudaan.com');
    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📧 Test Credentials:');
    console.log('   Admin: admin@unchiudaan.com / Admin@12345');
    console.log('   Instructor: instructor@unchiudaan.com / Instructor@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedUsers();
