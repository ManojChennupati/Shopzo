import Cart from "../models/cartModel.js";
import Product from "../models/ProductModel.js";

export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userID: req.user.id }).populate("items.productId");
        if (!cart) return res.json({ items: [], totalItems: 0 });
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch cart", error: err.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        const discountedPrice = product.price * (1 - product.discountPercentage / 100);

        let cart = await Cart.findOne({ userID: req.user.id });
        
        if (!cart) {
            cart = await Cart.create({
                userID: req.user.id,
                items: [{ productId, quantity, priceAtAddTime: discountedPrice }],
                totalItems: quantity
            });
        } else {
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity, priceAtAddTime: discountedPrice });
            }
            
            cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            await cart.save();
        }
        
        // Re-fetch with populated data
        cart = await Cart.findOne({ userID: req.user.id }).populate("items.productId");

        res.json({ message: "Item added to cart", cart });
    } catch (err) {
        res.status(500).json({ message: "Failed to add to cart", error: err.message });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        let cart = await Cart.findOne({ userID: req.user.id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ message: "Item not in cart" });

        // Validate stock
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({ message: "Product not available" });
        }
        if (quantity > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} items available` });
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        await cart.save();
        
        // Re-fetch with populated data
        cart = await Cart.findOne({ userID: req.user.id }).populate("items.productId");

        res.json({ message: "Cart updated", cart });
    } catch (err) {
        res.status(500).json({ message: "Failed to update cart", error: err.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        
        let cart = await Cart.findOne({ userID: req.user.id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        await cart.save();
        
        // Re-fetch with populated data
        cart = await Cart.findOne({ userID: req.user.id }).populate("items.productId");

        res.json({ message: "Item removed from cart", cart });
    } catch (err) {
        res.status(500).json({ message: "Failed to remove from cart", error: err.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userID: req.user.id });
        res.json({ message: "Cart cleared" });
    } catch (err) {
        res.status(500).json({ message: "Failed to clear cart", error: err.message });
    }
};
