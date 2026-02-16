import express from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cartController.js";
import { authenticate } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, getCart);
router.post("/", authenticate, addToCart);
router.put("/", authenticate, updateCartItem);
router.delete("/:productId", authenticate, removeFromCart);
router.delete("/", authenticate, clearCart);

export default router;
