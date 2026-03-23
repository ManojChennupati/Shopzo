import mongoose from "mongoose";
import Product from "../models/ProductModel.js";
import dotenv from "dotenv";

dotenv.config();

const migrateProducts = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/shopzo");
        console.log("Connected to MongoDB");

        const products = await Product.find({});
        console.log(`Found ${products.length} products to migrate`);

        for (const product of products) {
            const updates = {};

            // Migrate discountPrice to discountPercentage
            if (product.discountPrice !== undefined) {
                if (product.price > 0) {
                    updates.discountPercentage = ((product.price - product.discountPrice) / product.price) * 100;
                }
                updates.$unset = { discountPrice: "" };
            }

            // Add missing fields with defaults
            if (product.discountPercentage === undefined) {
                updates.discountPercentage = 0;
            }
            if (product.rating === undefined) {
                updates.rating = 0;
            }
            if (product.brand === undefined) {
                updates.brand = "";
            }
            if (product.category === undefined) {
                updates.category = "";
            }
            if (product.thumbnail === undefined) {
                updates.thumbnail = product.images && product.images.length > 0 ? product.images[0] : "";
            }
            if (!product.images || product.images.length === 0) {
                updates.images = [];
            }

            if (Object.keys(updates).length > 0) {
                await Product.findByIdAndUpdate(product._id, updates);
                console.log(`Updated product: ${product.title}`);
            }
        }

        console.log("Migration completed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateProducts();
