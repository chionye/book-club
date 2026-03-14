const sequelize = require('../config/database');
const Admin = require('./Admin');
const Book = require('./Book');
const Purchase = require('./Purchase');

// Associations
Book.hasMany(Purchase, { foreignKey: 'bookId', as: 'purchases' });
Purchase.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

module.exports = { sequelize, Admin, Book, Purchase };
