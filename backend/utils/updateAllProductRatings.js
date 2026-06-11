import Review from "../models/ReviewModel.js";
import Product from "../models/ProductModel.js";

// Utility function to recalculate ratings for all products
export const updateAllProductRatings = async () => {
    try {
        console.log('Starting to update all product ratings...');
        
        // Get all products
        const products = await Product.find({});
        
        for (const product of products) {
            // Get all approved reviews for this product
            const reviews = await Review.find({ 
                productId: product._id, 
                isApproved: true 
            });
            
            let averageRating = 0;
            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                averageRating = totalRating / reviews.length;
            }
            
            // Update product rating
            await Product.findByIdAndUpdate(product._id, { 
                rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
            });
            
            console.log(`Updated product "${product.title}" rating to ${averageRating} (${reviews.length} reviews)`);
        }
        
        console.log('Finished updating all product ratings');
    } catch (err) {
        console.error('Error updating all product ratings:', err);
    }
};

// Run this function if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    updateAllProductRatings().then(() => {
        process.exit(0);
    });
}