const Koa = require("koa");
const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  priority: { type: String, enum: ["Low", "Medium", "High"], required: true },
});

const Task = mongoose.model("Task", taskSchema);

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(bodyParser());

router.get("/api/tasks", async (ctx) => {
  try {
    const tasks = await Task.find();
    ctx.status = 200;
    ctx.body = tasks;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: "Failed to fetch tasks", error };
  }
});

router.post("/api/tasks", async (ctx) => {
  try {
    const task = new Task(ctx.request.body);
    await task.save();
    ctx.status = 201;
    ctx.body = task;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { message: "Failed to add task", error };
  }
});

router.patch("/api/tasks/:id", async (ctx) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body,
      { new: true }
    );
    ctx.status = 200;
    ctx.body = updatedTask;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { message: "Failed to update task", error };
  }
});

router.delete("/api/tasks/:id", async (ctx) => {
  try {
    await Task.findByIdAndDelete(ctx.params.id);
    ctx.status = 200;
    ctx.body = { message: "Task deleted successfully" };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { message: "Failed to delete task", error };
  }
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
