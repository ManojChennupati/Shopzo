import express from "express";
import { adminOnly } from "../Middlewares/adminMiddleware.js";
import Product from "../models/ProductModel.js";
import Order from "../models/OrderModel.js";
import { updateAllProductRatings } from "../utils/updateAllProductRatings.js";
import { sendOrderStatusEmail } from "../services/emailService.js";
import { 
  updateStock, 
  updatePrice, 
  updateDiscount, 
  bulkPriceUpdate,
  getLowStockProducts,
  getDiscountedProducts 
} from "../controllers/adminController.js";

export const adminRoute = express.Router();

// Product management - Individual updates
adminRoute.put("/products/:id/stock", adminOnly, updateStock);
adminRoute.put("/products/:id/price", adminOnly, updatePrice);
adminRoute.put("/products/:id/discount", adminOnly, updateDiscount);

// Edit existing product - cost and discount
adminRoute.put("/products/:id/edit", adminOnly, async (req, res) => {
  try {
    const { price, discountPercentage, stock } = req.body;
    const updateData = {};
    
    if (price !== undefined) updateData.price = price;
    if (discountPercentage !== undefined) updateData.discountPercentage = discountPercentage;
    if (stock !== undefined) updateData.stock = stock;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

// Bulk operations
adminRoute.put("/products/bulk/price", adminOnly, bulkPriceUpdate);

// Utility endpoints
adminRoute.get("/products/low-stock", adminOnly, getLowStockProducts);
adminRoute.get("/products/discounted", adminOnly, getDiscountedProducts);

// Update multiple product fields at once
adminRoute.put("/products/:id", adminOnly, async (req, res) => {
  try {
    const { price, stock, discountPercentage } = req.body;
    const updateData = {};
    
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (discountPercentage !== undefined) updateData.discountPercentage = discountPercentage;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

// Bulk update products by category
adminRoute.put("/products/bulk/category/:category", adminOnly, async (req, res) => {
  try {
    const { category } = req.params;
    const { price, stock, discountPercentage } = req.body;
    const updateData = {};
    
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (discountPercentage !== undefined) updateData.discountPercentage = discountPercentage;
    
    const result = await Product.updateMany(
      { category: { $regex: category, $options: 'i' } },
      updateData
    );
    
    res.json({ 
      message: `Updated ${result.modifiedCount} products in category: ${category}`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to bulk update products", error: err.message });
  }
});

// Bulk update products by brand
adminRoute.put("/products/bulk/brand/:brand", adminOnly, async (req, res) => {
  try {
    const { brand } = req.params;
    const { price, stock, discountPercentage } = req.body;
    const updateData = {};
    
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (discountPercentage !== undefined) updateData.discountPercentage = discountPercentage;
    
    const result = await Product.updateMany(
      { brand: { $regex: brand, $options: 'i' } },
      updateData
    );
    
    res.json({ 
      message: `Updated ${result.modifiedCount} products for brand: ${brand}`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to bulk update products", error: err.message });
  }
});

// Get all products for admin management
adminRoute.get("/products", adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, brand, search } = req.query;
    const filter = {};
    
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await Product.countDocuments(filter);
    
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});

// Order management
adminRoute.get("/orders", adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .populate('items.productId', 'title thumbnail price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});

adminRoute.put("/orders/:id/status", adminOnly, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Send email notification to the user
    if (order.userId && order.userId.email) {
      console.log(`Sending order status email to: ${order.userId.email}`);
      const emailResult = await sendOrderStatusEmail(
        order.userId.email,
        order.userId.name,
        order,
        orderStatus
      );
      console.log('Email result:', emailResult);
    } else {
      console.log('No user email found for order, skipping email.');
    }
    
    res.json({ message: "Order status updated and email sent", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
});

// Dashboard stats
adminRoute.get("/stats", adminOnly, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

// Update all product ratings based on reviews
adminRoute.post("/products/update-ratings", adminOnly, async (req, res) => {
  try {
    await updateAllProductRatings();
    res.json({ message: "All product ratings updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product ratings", error: err.message });
  }
});