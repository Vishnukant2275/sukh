const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // In real applications, passwords should be hashed (e.g., using bcrypt)
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});