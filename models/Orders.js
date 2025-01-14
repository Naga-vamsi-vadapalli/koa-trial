const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, min: 0 },
});

const orderLineSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  orderId: { type: String, unique: true, required: true },
  created: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Completed", "Cancelled"],
    default: "Pending",
  },
  orderLine: [orderLineSchema],
});

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

module.exports = { Product, Order };
