require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize } = require('../models');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'books'
        AND COLUMN_NAME = 'isPremium'
    `);

    if (columns.length > 0) {
      console.log('✅ Column `isPremium` already exists, nothing to do.');
    } else {
      await sequelize.query(`
        ALTER TABLE books
        ADD COLUMN isPremium TINYINT(1) NOT NULL DEFAULT 0
      `);
      console.log('✅ Column `isPremium` added to books table.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
