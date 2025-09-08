const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } 
  // 300 seconds = 5 minutes (auto delete after expiry)
});

module.exports = mongoose.model("Otp", otpSchema);
