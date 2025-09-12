const mongoose = require("mongoose");


const contactUsSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  receivedOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContactUs", contactUsSchema);
