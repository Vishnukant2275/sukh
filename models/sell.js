const mongoose = require('mongoose');
const sellSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },



  quantity: { type: Number, required: true },
  ContactNumber: { type: Number, required: true },
  location: { type: String, required: true },
  RawMaterialType: { type: String, required: true },
  additionalDetails: { type: String },});

module.exports = mongoose.model('Sell', sellSchema);
