const Router = require("koa-router");
const { Order, Product } = require("../models/Orders");

const router = new Router();

router.post("/orders", async (ctx) => {
  const { customerId, orderId, orderLine } = ctx.request.body;

  // Validate request body
  if (!customerId || !orderId || !orderLine || !Array.isArray(orderLine)) {
    ctx.throw(400, "Invalid request body");
  }

  const updatedOrderLine = await Promise.all(
    orderLine.map(async (line) => {
      const product = await Product.findOne({ productId: line.productId });
      if (!product) {
        ctx.throw(404, `Product with ID ${line.productId} not found`);
      }
      if (line.quantity <= 0) {
        ctx.throw(400, "Quantity must be greater than 0");
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

  ctx.status = 201;
  ctx.body = { message: "Order created successfully", order: newOrder };
});

module.exports = router;
