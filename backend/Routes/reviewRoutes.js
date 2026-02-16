import express from "express";
import { createReview, getProductReviews, approveReview } from "../controllers/reviewController.js";
import { authenticate, isAdmin } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, createReview);
router.get("/:productId", getProductReviews);
router.put("/:id/approve", authenticate, isAdmin, approveReview);

export default router;
