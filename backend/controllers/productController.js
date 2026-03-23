import Product from "../models/ProductModel.js";

export const getAllProducts = async (req, res) => {
    try {
        const { search, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
        
        const query = { isActive: true };
        if (search) query.title = { $regex: search, $options: "i" };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ _id: -1 });

        const total = await Product.countDocuments(query);

        res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch products", error: err.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch product", error: err.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { title, description, price, discountPercentage = 0, rating = 0, stock, brand = "", category = "", thumbnail = "", images = [] } = req.body;
        
        const product = await Product.create({
            title,
            description,
            price,
            discountPercentage,
            rating,
            stock,
            brand,
            category,
            thumbnail,
            images
        });
        
        res.status(201).json({ message: "Product created", product });
    } catch (err) {
        res.status(500).json({ message: "Failed to create product", error: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product updated", product });
    } catch (err) {
        res.status(500).json({ message: "Failed to update product", error: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deactivated" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete product", error: err.message });
    }
};
