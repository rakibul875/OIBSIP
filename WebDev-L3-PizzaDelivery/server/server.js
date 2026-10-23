require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const seedDatabase = require("./utils/seedData");
const { initInventoryCronJob } = require("./cron/inventoryAlertCron");

const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const pizzaRoutes = require("./routes/pizzaRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const io = new Server(server, {
  cors: {
    origin: [clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

app.use(
  cors({
    origin: [clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/pizzas", pizzaRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "SliceCraft Pizza Delivery Engine",
  });
});

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on("joinOrderRoom", (orderId) => {
    if (orderId) {
      socket.join(`order_${orderId}`);
      console.log(
        `[Socket.io] Socket ${socket.id} joined room: order_${orderId}`,
      );
    }
  });

  socket.on("leaveOrderRoom", (orderId) => {
    if (orderId) {
      socket.leave(`order_${orderId}`);
      console.log(
        `[Socket.io] Socket ${socket.id} left room: order_${orderId}`,
      );
    }
  });

  socket.on("joinAdminRoom", () => {
    socket.join("admin_dashboard");
    console.log(`[Socket.io] Admin socket ${socket.id} joined admin_dashboard`);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

app.use((err, req, res, next) => {
  console.error(`[Unhandled Error]: ${err.stack}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();
    initInventoryCronJob();

    server.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`   SliceCraft Pizza API Server running on port: ${PORT}`);
      console.log(`   Frontend Expected: ${clientUrl}`);
      console.log(`   Socket.io real-time engine initialized`);
      console.log(`   Node-Cron sentinel active`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
