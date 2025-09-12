const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Product schema se reference
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/, // simple 10-digit validation
  },
  alternateMobile: {
    type: String,
    match: /^[0-9]{10}$/,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  address: {
    pin: { type: String, required: true, match: /^[0-9]{6}$/ }, // Indian PIN code
    locality: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    landmark: { type: String },
  },
  paymentMethod: {
    type: String,
    enum: ["UPI"], // sirf UPI allowed
    default: "UPI",
  },
  status: {
    type: String,
    enum: [
      "PendingPaymentStatus",
      "PaymentNotReceived",
      "PendingForShipment",
      "Shipped",
      "Completed",
    ],
    default: "PendingPaymentStatus",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
