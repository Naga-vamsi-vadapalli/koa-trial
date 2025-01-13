const router = require("koa-router")();
const { Order, Product } = require("./models/order");

router.post("/orders", async (ctx) => {
  const { customerId, orderId, orderLine } = ctx.request.body;

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

  const newOrder = new Order({
    customerId,
    orderId,
    orderLine: updatedOrderLine,
  });
  await newOrder.save();

  ctx.body = { message: "Order created successfully", order: newOrder };
});
