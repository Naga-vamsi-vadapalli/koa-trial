const Router = require("koa-router");
const { Order, Product } = require("../models/Orders");

const router = new Router();

router.post("/orders", async (ctx) => {
  try {
    const { customerId, orderId, orderLine } = ctx.request.body;

    if (!customerId || !orderId || !orderLine || !Array.isArray(orderLine)) {
      ctx.throw(400, "Invalid request payload");
    }

    const updatedOrderLine = await Promise.all(
      orderLine.map(async (line) => {
        const product = await Product.findOne({ productId: line.productId });
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
  } catch (error) {
    console.error("Error creating order:", error);
    ctx.status = error.status || 500;
    ctx.body = { error: error.message || "Internal Server Error" };
  }
});

router.get("/orders", async (ctx) => {
  const orders = await Order.find().populate("orderLine.productId");
  ctx.body = { orders };
});

router.put("/orders/:orderId", async (ctx) => {
  const { orderId } = ctx.params;
  const { orderLine } = ctx.request.body;

  const order = await Order.findOne({ orderId });

  if (!order) {
    ctx.throw(404, `Order with ID ${orderId} not found`);
  }

  const updatedOrderLine = await Promise.all(
    orderLine.map(async (line) => {
      const product = await Product.findOne({ productId: line.productId });
      if (!product) {
        ctx.throw(400, `Product with ID ${line.productId} not found`);
      }

      return {
        ...line,
        subtotal: product.price * line.quantity,
      };
    })
  );

  order.orderLine = updatedOrderLine;

  await order.save();

  ctx.body = { message: "Order updated successfully", order };
});

router.get("/orders/:orderId", async (ctx) => {
  const { orderId } = ctx.params;
  const order = await Order.findOne({ orderId }).populate(
    "orderLine.productId"
  );
  if (!order) {
    ctx.throw(404, `Order with ID ${orderId} not found`);
  }
  ctx.body = { order };
});

router.delete("/orders/:orderId", async (ctx) => {
  const { orderId } = ctx.params;
  const deletedOrder = await Order.findOneAndDelete({ orderId });
  if (!deletedOrder) {
    ctx.throw(404, `Order with ID ${orderId} not found`);
  }
  ctx.body = { message: "Order deleted successfully", order: deletedOrder };
});

module.exports = router;
