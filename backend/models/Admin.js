// models/Admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  whatsappNumber: { type: String, unique: true },
  email: { type: String, unique: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Admin', adminSchema);