import express from "express";
import { createReview, getProductReviews, getAllProductReviews, approveReview, deleteReview } from "../controllers/reviewController.js";
import { authenticate, isAdmin } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, createReview);
router.get("/:productId", getProductReviews);
router.get("/admin/:productId", authenticate, isAdmin, getAllProductReviews);
router.put("/:id/approve", authenticate, isAdmin, approveReview);
router.delete("/:id", authenticate, deleteReview);

export default router;
