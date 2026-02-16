# Shopzo System Architecture

## Overview
Full-stack e-commerce platform with clean separation of concerns, RESTful API design, and simple payment processing.

---

## Backend Architecture

### Layer Structure

```
┌─────────────────────────────────────┐
│         Routes Layer                │  ← API Endpoints
├─────────────────────────────────────┤
│      Middleware Layer               │  ← Auth, Validation
├─────────────────────────────────────┤
│      Controllers Layer              │  ← Business Logic
├─────────────────────────────────────┤
│         Models Layer                │  ← Data Schema
├─────────────────────────────────────┤
│        Database (MongoDB)           │  ← Data Storage
└─────────────────────────────────────┘
```

### Components

#### 1. Models (Data Layer)
- **User**: Authentication and profile data
- **Product**: Product catalog
- **Cart**: Shopping cart management
- **Order**: Order processing and history
- **Payment**: Payment transaction records
- **Review**: Product reviews and ratings

#### 2. Controllers (Business Logic)
- **authController**: Registration, login, JWT generation
- **productController**: CRUD operations, search, filtering
- **cartController**: Add/update/remove items, cart management
- **orderController**: Order creation, payment processing, status updates
- **reviewController**: Review submission, approval

#### 3. Middleware
- **authMiddleware**: JWT verification, role-based access control

#### 4. Routes
- `/auth` - Authentication endpoints
- `/products` - Product management
- `/cart` - Cart operations
- `/orders` - Order processing
- `/reviews` - Review management

#### 5. Utilities
- **jwt.js**: Token generation and validation

---

## Frontend Architecture

### Component Structure

```
App (Router)
├── AuthProvider (Context)
│   └── CartProvider (Context)
│       ├── Navbar
│       └── Routes
│           ├── Login
│           ├── Register
│           ├── Products (Public)
│           ├── ProductDetail (Public)
│           ├── Cart (Protected)
│           ├── Checkout (Protected)
│           ├── Orders (Protected)
│           └── AdminDashboard (Admin Only)
```

### State Management

#### Context API
1. **AuthContext**: User authentication state, login/logout
2. **CartContext**: Cart item count, updates

#### Local State
- Component-level state for forms, loading, errors

### Services Layer
- **api.js**: Centralized API calls with Axios
  - Automatic token injection
  - Request/response interceptors
  - Organized by domain (auth, product, cart, order, review)

---

## Data Flow

### User Registration/Login Flow
```
User Input → authAPI.register/login
           → Backend validates
           → JWT generated
           → Token + User data returned
           → Stored in localStorage
           → AuthContext updated
           → User redirected
```

### Shopping Flow
```
Browse Products → Add to Cart → View Cart → Checkout → Payment → Order Confirmation
     ↓               ↓             ↓           ↓          ↓            ↓
  GET /products  POST /cart   GET /cart  POST /orders  POST /payment  GET /orders
```

### Admin Flow
```
Admin Login → Dashboard → Manage Products/Orders
     ↓            ↓              ↓
  JWT Token   GET /orders   PUT /orders/:id/status
              GET /products POST /products
```

---

## Payment Processing Logic

### Simple Arithmetic Flow

```javascript
// 1. Calculate cart total
total = sum(item.price × item.quantity)

// 2. Create order
order = {
  items: [...],
  totalAmount: total,
  paymentStatus: "PENDING"
}

// 3. Simulate payment
transactionId = generate_unique_id()
success = random() > 0.1  // 90% success rate

// 4. Update order
if (success) {
  order.paymentStatus = "PAID"
  payment = { status: "success", transactionId }
} else {
  payment = { status: "failed" }
}
```

### No External Dependencies
- No Stripe, PayPal, Razorpay integration
- No webhooks or callbacks
- No PCI compliance requirements
- Simple database transactions

---

## Security

### Authentication
- Passwords hashed with bcryptjs (12 rounds)
- JWT tokens with 7-day expiration
- Token stored in localStorage
- Authorization header: `Bearer <token>`

### Authorization
- Role-based access control (USER, ADMIN)
- Protected routes with middleware
- Frontend route guards

### Data Validation
- Required fields enforced at schema level
- Stock validation before order creation
- Purchase verification for reviews

---

## API Design Principles

### RESTful Conventions
- `GET` - Retrieve resources
- `POST` - Create resources
- `PUT` - Update resources
- `DELETE` - Remove resources

### Response Format
```json
{
  "message": "Success message",
  "data": { ... },
  "error": "Error message (if applicable)"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Database Schema Relationships

```
User ──┬─→ Cart (1:1)
       ├─→ Order (1:N)
       └─→ Review (1:N)

Product ──┬─→ Cart.items (1:N)
          ├─→ Order.items (1:N)
          └─→ Review (1:N)

Order ──→ Payment (1:1)
```

---

## Scalability Considerations

### Current Implementation
- Monolithic architecture
- Single database
- Synchronous processing

### Future Enhancements
- Microservices separation
- Redis caching for products/cart
- Message queue for order processing
- CDN for product images
- Database indexing optimization
- Load balancing

---

## Development Workflow

### Backend Development
1. Define model schema
2. Create controller with business logic
3. Set up routes with middleware
4. Test with REST client

### Frontend Development
1. Create API service functions
2. Build page components
3. Implement state management
4. Connect to backend APIs

### Testing Flow
1. Start MongoDB
2. Start backend server (port 8080)
3. Start frontend dev server (port 3000)
4. Test user flows end-to-end

---

## Key Features Implementation

### Product Search
- Text search on title field
- Price range filtering
- Pagination support

### Cart Management
- Price snapshot at add time
- Quantity updates
- Stock validation

### Order Processing
1. Validate cart items
2. Check stock availability
3. Create order with snapshots
4. Reduce product stock
5. Clear cart
6. Process payment
7. Update order status

### Admin Dashboard
- Product CRUD operations
- Order status management
- Review approval system

---

## Error Handling

### Backend
- Try-catch blocks in all controllers
- Meaningful error messages
- Proper HTTP status codes

### Frontend
- API error catching
- User-friendly error messages
- Loading states
- Form validation

---

## Performance Optimizations

### Backend
- Mongoose query optimization
- Selective field population
- Pagination for large datasets

### Frontend
- Component lazy loading potential
- Minimal re-renders with proper state management
- Axios request cancellation support

---

## Deployment Considerations

### Backend
- Environment variables for secrets
- MongoDB connection string
- JWT secret key
- Port configuration

### Frontend
- Build optimization with Vite
- API proxy configuration
- Environment-specific API URLs

### Production Checklist
- [ ] Change JWT secret
- [ ] Set up MongoDB Atlas
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Set up logging
- [ ] Add rate limiting
- [ ] Implement input sanitization
- [ ] Add monitoring
