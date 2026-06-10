import Order from "../models/OrderModel.js";
import Cart from "../models/cartModel.js";
import Product from "../models/ProductModel.js";
import Payment from "../models/PaymentModel.js";
import { sendOrderStatusEmail } from "../services/emailService.js";

export const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, items } = req.body;
        
        // Validate shipping address
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
            !shippingAddress.state || !shippingAddress.country || !shippingAddress.zipCode) {
            return res.status(400).json({ message: "Complete shipping address is required" });
        }
        
        // Handle Buy Now (direct items) or Cart checkout
        if (items && items.length > 0) {
            // Buy Now flow - items provided directly
            const orderItems = [];
            let totalAmount = 0;

            for (const item of items) {
                const product = await Product.findById(item.productId);
                if (!product || !product.isActive) {
                    return res.status(400).json({ message: `Product not available` });
                }
                if (product.stock < item.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${product.title}. Available: ${product.stock}` });
                }

                orderItems.push({
                    productId: product._id,
                    titleSnapshot: product.title,
                    thumbnailSnapshot: product.thumbnail || '',
                    quantity: item.quantity,
                    priceSnapshot: item.priceAtAddTime
                });
                totalAmount += item.priceAtAddTime * item.quantity;

                product.stock -= item.quantity;
                await product.save();
            }

            const order = await Order.create({
                userId: req.user.id,
                items: orderItems,
                totalAmount,
                orderStatus: "PLACED",
                paymentStatus: "PENDING",
                paymentMethod,
                ShippingAddress: shippingAddress
            });

            return res.status(201).json({ message: "Order created", order });
        }
        
        // Cart checkout flow
        const cart = await Cart.findOne({ userID: req.user.id }).populate("items.productId");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const orderItems = [];
        let totalAmount = 0;

        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            if (!product || !product.isActive) {
                return res.status(400).json({ message: `Product ${item.productId} not available` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.title}. Available: ${product.stock}` });
            }

            const price = product.price * (1 - product.discountPercentage / 100);
            orderItems.push({
                productId: product._id,
                titleSnapshot: product.title,
                thumbnailSnapshot: product.thumbnail || '',
                quantity: item.quantity,
                priceSnapshot: price
            });
            totalAmount += price * item.quantity;

            product.stock -= item.quantity;
            await product.save();
        }

        const order = await Order.create({
            userId: req.user.id,
            items: orderItems,
            totalAmount,
            orderStatus: "PLACED",
            paymentStatus: "PENDING",
            paymentMethod,
            ShippingAddress: shippingAddress
        });

        await Cart.findOneAndDelete({ userID: req.user.id });

        res.status(201).json({ message: "Order created", order });
    } catch (err) {
        console.error('Create Order Error:', err);
        res.status(500).json({ message: "Failed to create order", error: err.message });
    }
};

export const processPayment = async (req, res) => {
    try {
        const { orderId, provider } = req.body;
        
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        
        // COD always succeeds, card/debit have 95% success rate (more realistic)
        const paymentSuccess = provider === 'cod' ? true : Math.random() > 0.05;

        const payment = await Payment.create({
            orderId: order._id,
            amount: order.totalAmount,
            provider: provider || "cod",
            status: paymentSuccess ? "success" : "failed",
            transactionId
        });

        if (paymentSuccess) {
            order.paymentStatus = "PAID";
            await order.save();
            res.json({ message: "Payment successful", payment, order });
        } else {
            res.status(400).json({ message: "Payment failed. Please try again or use a different payment method.", payment });
        }
    } catch (err) {
        res.status(500).json({ message: "Payment processing failed", error: err.message });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate({
                path: 'items.productId',
                select: 'thumbnail title'
            })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch orders", error: err.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate({
            path: 'items.productId',
            select: 'thumbnail title'
        });
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.userId.toString() !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch order", error: err.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'userId',
                select: 'name email phone'
            })
            .populate({
                path: 'items.productId',
                select: 'thumbnail title'
            })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch orders", error: err.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus },
            { new: true }
        ).populate('userId', 'name email');
        
        if (!order) return res.status(404).json({ message: "Order not found" });
        
        // Send email notification to user
        if (order.userId && order.userId.email) {
            console.log(`Sending email to: ${order.userId.email}`);
            const emailResult = await sendOrderStatusEmail(
                order.userId.email,
                order.userId.name,
                order,
                orderStatus
            );
            console.log('Email result:', emailResult);
        } else {
            console.log('No user email found, skipping email notification');
        }
        
        res.json({ message: "Order status updated and email sent", order });
    } catch (err) {
        res.status(500).json({ message: "Failed to update order", error: err.message });
    }
};
