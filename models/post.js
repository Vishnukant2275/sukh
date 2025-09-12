const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: {
    data: Buffer,
    contentType: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now }, // ✅ default date
});
module.exports = mongoose.model("Post", postSchema);
