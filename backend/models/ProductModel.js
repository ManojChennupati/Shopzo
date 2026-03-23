import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        discountPercentage: { type: Number, default: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        stock: { type: Number, required: true },
        brand: { type: String, default: "" },
        category: { type: String, default: "" },
        thumbnail: { type: String, default: "" },
        images: [{ type: String }],
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true, strict: false }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;