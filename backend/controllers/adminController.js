import Product from "../models/ProductModel.js";
import Order from "../models/OrderModel.js";

// Update single product stock
export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json({ message: "Stock updated successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to update stock", error: err.message });
  }
};

// Update single product price
export const updatePrice = async (req, res) => {
  try {
    const { price } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { price },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json({ message: "Price updated successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to update price", error: err.message });
  }
};

// Update single product discount
export const updateDiscount = async (req, res) => {
  try {
    const { discountPercentage } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { discountPercentage },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json({ message: "Discount updated successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to update discount", error: err.message });
  }
};

// Bulk price update with percentage change
export const bulkPriceUpdate = async (req, res) => {
  try {
    const { percentage, operation, filter = {} } = req.body;
    
    const products = await Product.find(filter);
    const bulkOps = products.map(product => ({
      updateOne: {
        filter: { _id: product._id },
        update: {
          price: operation === 'increase' 
            ? Math.round(product.price * (1 + percentage / 100) * 100) / 100
            : Math.round(product.price * (1 - percentage / 100) * 100) / 100
        }
      }
    }));
    
    const result = await Product.bulkWrite(bulkOps);
    
    res.json({
      message: `Bulk price ${operation} of ${percentage}% completed`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to bulk update prices", error: err.message });
  }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const products = await Product.find({ 
      stock: { $lte: threshold },
      isActive: true 
    }).sort({ stock: 1 });
    
    res.json({ products, count: products.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch low stock products", error: err.message });
  }
};

// Get products with active discounts
export const getDiscountedProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      discountPercentage: { $gt: 0 },
      isActive: true 
    }).sort({ discountPercentage: -1 });
    
    res.json({ products, count: products.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch discounted products", error: err.message });
  }
};