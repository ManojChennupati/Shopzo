# Shopzo - E-Commerce Platform

Full-stack e-commerce application similar to Amazon with user authentication, product management, cart, orders, and simple payment processing.

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router v6
- Axios
- Vite

## Project Structure

```
Shopzo/
├── backend/
│   ├── controllers/        # Business logic
│   ├── models/            # Mongoose schemas
│   ├── Routes/            # API routes
│   ├── Middlewares/       # Auth middleware
│   ├── utils/             # JWT utilities
│   └── server.js          # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   └── App.jsx        # Main app
│   └── index.html
└── API_DOCUMENTATION.md
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start MongoDB (ensure MongoDB is running on localhost:27017)

4. Start the server:
```bash
npm start
```

Server runs on: http://localhost:8080

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on: http://localhost:3000

## Features

### User Features
- Register/Login with JWT authentication
- Browse products with search and filters
- View product details and reviews
- Add products to cart
- Manage cart (update quantity, remove items)
- Checkout with shipping address
- Simple payment processing (simulated)
- View order history

### Admin Features
- Create/Update/Delete products
- View all orders
- Update order status (PLACED → SHIPPED → DELIVERED)
- Approve product reviews

## API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Reference
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /products` - Get all products
- `POST /cart` - Add to cart
- `POST /orders` - Create order
- `POST /orders/payment` - Process payment

## Payment System

The payment system is intentionally simple:
- Uses basic arithmetic: `total = sum(price × quantity)`
- Simulates payment with 90% success rate
- Generates transaction IDs: `TXN{timestamp}{random}`
- No external payment gateways
- Supports: Cash on Delivery (COD), Card

## Database Models

1. **User** - name, email, password, role, phone, address
2. **Product** - title, description, price, discountPrice, stock, images
3. **Cart** - userID, items[], totalItems
4. **Order** - userId, items[], totalAmount, orderStatus, paymentStatus
5. **Payment** - orderId, amount, provider, status, transactionId
6. **Review** - userId, productId, rating, comment, isApproved

## Environment Variables

Create `.env` file in backend directory:
```
JWT_SECRET=your-secret-key-change-in-production
MONGODB_URI=mongodb://localhost:27017/Shopzo
PORT=8080
```

## Default Admin Account

To create an admin account, register normally and manually update the role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

## Future Enhancements

- Image upload for products
- Product categories
- Advanced search filters
- Order tracking
- Email notifications
- Wishlist functionality
- Multiple shipping addresses
- Discount coupons
- Analytics dashboard

## License

MIT
