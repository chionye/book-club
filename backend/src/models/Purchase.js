const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  bookId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'books', key: 'id' },
  },
  buyerName: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  buyerEmail: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { isEmail: true },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'NGN',
  },
  paystackReference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },
  paystackAccessCode: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  downloadToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },
  downloadTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  maxDownloads: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'purchases',
  indexes: [
    { fields: ['buyerEmail'] },
    { fields: ['paystackReference'] },
    { fields: ['downloadToken'] },
    { fields: ['status'] },
  ],
});

module.exports = Purchase;
