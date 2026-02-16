import express from "express";
import { createOrder, processPayment, getUserOrders, getOrderById, getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { authenticate, isAdmin } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, createOrder);
router.post("/payment", authenticate, processPayment);
router.get("/", authenticate, getUserOrders);
router.get("/all", authenticate, isAdmin, getAllOrders);
router.get("/:id", authenticate, getOrderById);
router.put("/:id/status", authenticate, isAdmin, updateOrderStatus);

export default router;
