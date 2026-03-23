
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { authRoute } from "./Routes/authRoutes.js";
import productRoutes from "./Routes/productRoutes.js";
import cartRoutes from "./Routes/cartRoutes.js";
import orderRoutes from "./Routes/orderRoutes.js";
import reviewRoutes from "./Routes/reviewRoutes.js";
import { adminRoute } from "./Routes/adminRoutes.js";

const app = express();
app.use(cors());
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
    await mongoose.connect("mongodb://localhost:27017/Shopzo");
    console.log("DB is connected");

    app.listen(8080, () =>
      console.log("Server listening on port 8080")
    );
  } catch (err) {
    console.error("Error in DB connection", err);
  }
}

connectDBandStartServer();
