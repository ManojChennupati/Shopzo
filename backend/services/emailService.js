import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Brevo HTTP API — uses port 443 (HTTPS), works on all cloud hosts including Render free tier
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is not set! Add it to your Render environment variables.');
} else {
    console.log('✓ BREVO_API_KEY loaded, length:', process.env.BREVO_API_KEY.trim().length);
}

console.log('✓ Email service initialized (Brevo HTTP API)');

// Order status email templates
const getOrderStatusTemplate = (order, status) => {
    const statusInfo = {
        PLACED: {
            emoji: '📦',
            title: 'Order Placed Successfully',
            message: 'Your order has been received and is being processed.',
            color: '#3B82F6'
        },
        SHIPPED: {
            emoji: '🚚',
            title: 'Order Shipped',
            message: 'Your order is on its way! Track your package for delivery updates.',
            color: '#F59E0B'
        },
        DELIVERED: {
            emoji: '✅',
            title: 'Order Delivered',
            message: 'Your order has been delivered successfully. Enjoy your purchase!',
            color: '#10B981'
        },
        CANCELLED: {
            emoji: '❌',
            title: 'Order Cancelled',
            message: 'Your order has been cancelled. If you have any questions, please contact support.',
            color: '#EF4444'
        }
    };

    const info = statusInfo[status] || statusInfo.PLACED;
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, ${info.color} 0%, ${info.color}dd 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header .emoji {
            font-size: 64px;
            margin-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
        }
        .message {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            text-align: center;
        }
        .order-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 24px;
            margin: 20px 0;
        }
        .order-info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .order-info-row:last-child {
            border-bottom: none;
        }
        .order-info-label {
            font-weight: 600;
            color: #555;
        }
        .order-info-value {
            color: #333;
            font-weight: 700;
        }
        .order-id {
            color: ${info.color};
            font-size: 18px;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: ${info.color};
            color: white;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }
        .items-section {
            margin: 30px 0;
        }
        .items-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #333;
        }
        .item {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 6px;
            margin-bottom: 8px;
        }
        .item-name {
            font-weight: 600;
            color: #555;
        }
        .item-details {
            color: #888;
            font-size: 14px;
        }
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 2px solid #e0e0e0;
        }
        .footer-text {
            color: #888;
            font-size: 14px;
            margin: 5px 0;
        }
        .brand {
            font-size: 24px;
            font-weight: 800;
            color: #FF6B35;
            margin-bottom: 10px;
        }
        .support-link {
            color: ${info.color};
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">${info.emoji}</div>
            <h1>${info.title}</h1>
        </div>
        
        <div class="content">
            <p class="message">${info.message}</p>
            
            <div class="order-info">
                <div class="order-info-row">
                    <span class="order-info-label">Order ID:</span>
                    <span class="order-info-value order-id">#${order._id.toString().slice(-8).toUpperCase()}</span>
                </div>
                <div class="order-info-row">
                    <span class="order-info-label">Order Date:</span>
                    <span class="order-info-value">${orderDate}</span>
                </div>
                <div class="order-info-row">
                    <span class="order-info-label">Status:</span>
                    <span class="status-badge">${status}</span>
                </div>
                <div class="order-info-row">
                    <span class="order-info-label">Total Amount:</span>
                    <span class="order-info-value">₹${order.totalAmount.toFixed(2)}</span>
                </div>
            </div>

            <div class="items-section">
                <div class="items-title">📦 Order Items (${order.items.length})</div>
                ${order.items.map(item => `
                    <div class="item">
                        <div>
                            <div class="item-name">${item.titleSnapshot}</div>
                            <div class="item-details">Quantity: ${item.quantity}</div>
                        </div>
                        <div class="order-info-value">₹${(item.priceSnapshot * item.quantity).toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>

            ${order.ShippingAddress ? `
            <div class="order-info">
                <div class="items-title">📍 Shipping Address</div>
                <p style="margin: 10px 0; color: #666;">
                    ${order.ShippingAddress.street}<br>
                    ${order.ShippingAddress.city}, ${order.ShippingAddress.state} ${order.ShippingAddress.zipCode}<br>
                    ${order.ShippingAddress.country}
                </p>
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <div class="brand">🛒 Shopzo</div>
            <p class="footer-text">Thank you for shopping with us!</p>
            <p class="footer-text">Need help? <a href="mailto:${process.env.BREVO_SENDER_EMAIL}" class="support-link">Contact Support</a></p>
            <p class="footer-text" style="margin-top: 20px; font-size: 12px; color: #aaa;">
                This is an automated email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

// Core send function using Brevo HTTP API
const sendViaBrevo = async (to, toName, subject, htmlContent, senderName) => {
    const apiKey = (process.env.BREVO_API_KEY || '').trim();

    const payload = {
        sender: {
            name: senderName,
            email: process.env.BREVO_SENDER_EMAIL
        },
        to: [{ email: to, name: toName }],
        subject,
        htmlContent
    };

    const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey
    };

    const response = await axios.post(BREVO_API_URL, payload, { headers });
    return response.data.messageId;
};

// Send order status update email
export const sendOrderStatusEmail = async (userEmail, userName, order, newStatus) => {
    try {
        const messageId = await sendViaBrevo(
            userEmail,
            userName,
            `Order #${order._id.toString().slice(-8).toUpperCase()} - ${newStatus}`,
            getOrderStatusTemplate(order, newStatus),
            'Shopzo Order Updates'
        );
        console.log(`✓ Status email sent to ${userEmail}: ${messageId}`);
        return { success: true, messageId };
    } catch (error) {
        const errMsg = error?.response?.data?.message || error.message;
        console.error('Brevo HTTP error (status):', errMsg);
        return { success: false, error: errMsg };
    }
};

// Send order confirmation email immediately after order is placed
export const sendOrderConfirmationEmail = async (userEmail, userName, order) => {
    try {
        const messageId = await sendViaBrevo(
            userEmail,
            userName,
            `✅ Order Confirmed! #${order._id.toString().slice(-8).toUpperCase()} — Thank you, ${userName}!`,
            getOrderStatusTemplate(order, 'PLACED'),
            'Shopzo'
        );
        console.log(`✓ Confirmation email sent to ${userEmail}: ${messageId}`);
        return { success: true, messageId };
    } catch (error) {
        const errMsg = error?.response?.data?.message || error.message;
        console.error('Brevo HTTP error (confirmation):', errMsg);
        return { success: false, error: errMsg };
    }
};

export default { sendOrderStatusEmail, sendOrderConfirmationEmail };
