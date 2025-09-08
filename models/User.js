const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: {type:Number, unique:true},
  address: String,
  password: String, // ⚠️ real project me hashed store karna chahiye (bcrypt)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
