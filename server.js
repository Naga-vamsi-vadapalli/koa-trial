const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const mongoose = require("mongoose");
const orderRoutes = require("./routes/orderRoutes");
const { Product } = require("./models/Orders");
require("dotenv").config();

const app = new Koa();
app.use(bodyParser());
app.use(orderRoutes.routes()).use(orderRoutes.allowedMethods());

const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    seedProducts();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const seedProducts = async () => {
  try {
    const products = [
      { productId: "1", name: "Product A", price: 10, stock: 100 },
      { productId: "2", name: "Product B", price: 20, stock: 50 },
      { productId: "3", name: "Product C", price: 30, stock: 30 },
    ];

    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("Product collection seeded");
  } catch (error) {
    console.error("Error seeding products:", error);
  }
};

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
