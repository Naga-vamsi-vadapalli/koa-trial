const Router = require("koa-router"); // Import Koa Router
const { Order, Product } = require("../models/Orders"); // Adjust the path if needed

const router = new Router(); // Create a new Router instance

router.post("/orders", async (ctx) => {
  const { customerId, orderId, orderLine } = ctx.request.body;

  // Calculate subtotal for each order line
  const updatedOrderLine = await Promise.all(
    orderLine.map(async (line) => {
      const product = await Product.findById(line.productId);
      if (!product) {
        ctx.throw(400, `Product with ID ${line.productId} not found`);
      }
      return {
        ...line,
        subtotal: product.price * line.quantity,
      };
    })
  );

  // Create and save the order
  const newOrder = new Order({
    customerId,
    orderId,
    orderLine: updatedOrderLine,
  });
  await newOrder.save();

  ctx.body = { message: "Order created successfully", order: newOrder };
});

// Export the router instance
module.exports = router;
