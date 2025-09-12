const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: { type: Number, unique: true },
  address: String,
  password: String, // ⚠️ real project me hashed store karna chahiye (bcrypt)
  createdAt: { type: Date, default: Date.now },
  role: { type: String, enum: ["User", "Admin"], default: "User" },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }],
  sells: [{ type: mongoose.Schema.Types.ObjectId, ref: "sell" }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
});

module.exports = mongoose.model("User", userSchema);
