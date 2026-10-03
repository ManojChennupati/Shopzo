import Review from "../models/ReviewModel.js";
import Order from "../models/OrderModel.js";
import Product from "../models/ProductModel.js";
import User from "../models/userModel.js";

// Helper function to update product rating based on reviews
const updateProductRating = async (productId) => {
    try {
        const reviews = await Review.find({ productId, isApproved: true });
        
        let averageRating = 0;
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = totalRating / reviews.length;
        }
        
        await Product.findByIdAndUpdate(productId, { 
            rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
        });
        
        console.log(`Updated product ${productId} rating to ${averageRating}`);
    } catch (err) {
        console.error('Error updating product rating:', err);
    }
};

export const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        
        if (!productId || !rating || !comment) {
            return res.status(400).json({ message: "Missing required fields: productId, rating, comment" });
        }
        
        // Fetch user name from DB to store in review
        const reviewer = await User.findById(req.user.id).select('name');
        const userName = reviewer ? reviewer.name : 'User';
        
        // Allow multiple reviews from the same user - no duplicate check
        const review = await Review.create({
            userId: req.user.id,
            productId,
            rating,
            comment,
            isApproved: true, // Auto-approve reviews
            userName
        });

        // Populate user info for immediate response
        await review.populate('userId', 'name email');
        
        // Update product rating based on all reviews
        await updateProductRating(productId);

        res.status(201).json({ message: "Review submitted successfully", review });
    } catch (err) {
        console.error('Error creating review:', err);
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

export const getAllProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ 
            productId: req.params.productId
        }).populate("userId", "name email").sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        
        // Store productId before deletion
        const productId = review.productId;
        
        // Allow deletion if user is admin or the review owner
        if (req.user.role !== "ADMIN" && review.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }
        
        await Review.findByIdAndDelete(reviewId);
        
        // Update product rating after deletion
        await updateProductRating(productId);
        
        res.json({ message: "Review deleted successfully" });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ message: "Failed to delete review", error: err.message });
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
        
        // Update product rating after approval
        await updateProductRating(review.productId);
        
        res.json({ message: "Review approved", review });
    } catch (err) {
        res.status(500).json({ message: "Failed to approve review", error: err.message });
    }
};
