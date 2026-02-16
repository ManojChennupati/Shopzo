import Review from "../models/ReviewModel.js";
import Order from "../models/OrderModel.js";

export const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        
        const order = await Order.findOne({
            userId: req.user.id,
            "items.productId": productId,
            paymentStatus: "PAID"
        });
        
        if (!order) {
            return res.status(403).json({ message: "You can only review purchased products" });
        }

        const existingReview = await Review.findOne({ userId: req.user.id, productId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        const review = await Review.create({
            userId: req.user.id,
            productId,
            rating,
            comment
        });

        res.status(201).json({ message: "Review submitted", review });
    } catch (err) {
        res.status(500).json({ message: "Failed to create review", error: err.message });
    }
};

export const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ 
            productId: req.params.productId,
            isApproved: true 
        }).populate("userId", "name");
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
    }
};

export const approveReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );
        if (!review) return res.status(404).json({ message: "Review not found" });
        res.json({ message: "Review approved", review });
    } catch (err) {
        res.status(500).json({ message: "Failed to approve review", error: err.message });
    }
};
