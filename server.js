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
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const seedProducts = async () => {
  const products = [
    { name: "Product A", price: 10 },
    { name: "Product B", price: 20 },
    { name: "Product C", price: 30 },
  ];

  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log("Product collection seeded");
};

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
