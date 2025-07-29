const mongoose = require('mongoose');

const bookOrderSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  copies: Number,
  city: String,
}, { timestamps: true });

module.exports = mongoose.model('BookOrder', bookOrderSchema);
