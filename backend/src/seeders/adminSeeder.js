require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, Admin } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const existing = await Admin.findOne({ where: { email: process.env.ADMIN_EMAIL } });
    if (existing) {
      console.log('Admin already exists:', process.env.ADMIN_EMAIL);
      process.exit(0);
    }

    await Admin.create({
      name: 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@mattybokks.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'super_admin',
    });

    console.log('✅ Admin created successfully');
    console.log('   Email:', process.env.ADMIN_EMAIL);
    console.log('   Password:', process.env.ADMIN_PASSWORD);
    process.exit(0);
  } catch (error) {
    console.error('Seeder error:', error);
    process.exit(1);
  }
}

seed();
