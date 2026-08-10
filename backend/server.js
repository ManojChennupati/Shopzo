
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
import { sendOrderConfirmationEmail } from "./services/emailService.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
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

// ── Email diagnostic endpoint ──────────────────────────────────────────────
// Visit: GET /test-email  to verify email config on the deployed server
app.get("/test-email", async (req, res) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return res.status(500).json({
      success: false,
      message: "EMAIL_USER or EMAIL_PASS is missing from environment variables",
      EMAIL_USER: emailUser ? "✅ set" : "❌ missing",
      EMAIL_PASS: emailPass ? "✅ set" : "❌ missing"
    });
  }

  const mockOrder = {
    _id: { toString: () => "TESTDIAG00000001" },
    createdAt: new Date(),
    totalAmount: 999,
    paymentMethod: "cod",
    items: [{ titleSnapshot: "Test Product", quantity: 1, priceSnapshot: 999 }],
    ShippingAddress: { street: "Test Street", city: "Hyderabad", state: "TS", zipCode: "500001", country: "India" }
  };

  const result = await sendOrderConfirmationEmail(emailUser, "Manoj Kumar", mockOrder);

  res.json({
    success: result.success,
    message: result.success ? "Test email sent! Check your inbox." : "Email failed",
    EMAIL_USER: "✅ set",
    EMAIL_PASS: "✅ set",
    error: result.error || null,
    messageId: result.messageId || null
  });
});

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
