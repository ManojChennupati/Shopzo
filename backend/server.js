
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { authRoute } from "./Routes/authRoutes.js";
import productRoutes from "./Routes/productRoutes.js";
import cartRoutes from "./Routes/cartRoutes.js";
import orderRoutes from "./Routes/orderRoutes.js";
import reviewRoutes from "./Routes/reviewRoutes.js";
import { adminRoute } from "./Routes/adminRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:8080",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

app.use("/auth", authRoute);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/reviews", reviewRoutes);
app.use("/admin", adminRoute);

// Test route
app.get("/test", (req, res) => res.json({ message: "Server is running" }));

// Test review route
app.post("/test-review", (req, res) => {
  console.log('Test review route hit');
  console.log('Body:', req.body);
  res.json({ message: "Test review endpoint working", body: req.body });
});

async function connectDBandStartServer() {
  try {
    // Use MongoDB Atlas or local MongoDB
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/shopzo";
    await mongoose.connect(MONGO_URI);
    console.log("DB is connected");

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () =>
      console.log(`Server listening on port ${PORT}`)
    );
  } catch (err) {
    console.error("Error in DB connection", err);
  }
}

connectDBandStartServer();
