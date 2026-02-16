# Shopzo API Documentation

## Base URL
```
http://localhost:8080
```

## Authentication
All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  }
}

Response: 201
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

---

## Product Endpoints

### Get All Products
```http
GET /products?search=laptop&minPrice=100&maxPrice=1000&page=1&limit=20

Response: 200
{
  "products": [...],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

### Get Product by ID
```http
GET /products/:id

Response: 200
{
  "_id": "product_id",
  "title": "Laptop",
  "description": "High performance laptop",
  "price": 999,
  "discountPrice": 899,
  "stock": 50,
  "images": [],
  "isActive": true
}
```

### Create Product (Admin Only)
```http
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Laptop",
  "description": "High performance laptop",
  "price": 999,
  "stock": 50
}

Response: 201
{
  "message": "Product created",
  "product": {...}
}
```

### Update Product (Admin Only)
```http
PUT /products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price": 899,
  "stock": 45
}

Response: 200
{
  "message": "Product updated",
  "product": {...}
}
```

### Delete Product (Admin Only)
```http
DELETE /products/:id
Authorization: Bearer <admin_token>

Response: 200
{
  "message": "Product deactivated"
}
```

---

## Cart Endpoints

### Get Cart
```http
GET /cart
Authorization: Bearer <token>

Response: 200
{
  "userID": "user_id",
  "items": [
    {
      "productId": {...},
      "quantity": 2,
      "priceAtAddTime": 899
    }
  ],
  "totalItems": 2
}
```

### Add to Cart
```http
POST /cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2
}

Response: 200
{
  "message": "Item added to cart",
  "cart": {...}
}
```

### Update Cart Item
```http
PUT /cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 3
}

Response: 200
{
  "message": "Cart updated",
  "cart": {...}
}
```

### Remove from Cart
```http
DELETE /cart/:productId
Authorization: Bearer <token>

Response: 200
{
  "message": "Item removed from cart",
  "cart": {...}
}
```

### Clear Cart
```http
DELETE /cart
Authorization: Bearer <token>

Response: 200
{
  "message": "Cart cleared"
}
```

---

## Order Endpoints

### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "paymentMethod": "cod"
}

Response: 201
{
  "message": "Order created",
  "order": {
    "_id": "order_id",
    "userId": "user_id",
    "items": [...],
    "totalAmount": 1798,
    "orderStatus": "PLACED",
    "paymentStatus": "PENDING"
  }
}
```

### Process Payment
```http
POST /orders/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_id",
  "provider": "cod"
}

Response: 200
{
  "message": "Payment successful",
  "payment": {
    "orderId": "order_id",
    "amount": 1798,
    "status": "success",
    "transactionId": "TXN123456"
  },
  "order": {...}
}
```

### Get User Orders
```http
GET /orders
Authorization: Bearer <token>

Response: 200
[
  {
    "_id": "order_id",
    "totalAmount": 1798,
    "orderStatus": "PLACED",
    "paymentStatus": "PAID",
    "items": [...]
  }
]
```

### Get Order by ID
```http
GET /orders/:id
Authorization: Bearer <token>

Response: 200
{
  "_id": "order_id",
  "userId": "user_id",
  "items": [...],
  "totalAmount": 1798,
  "orderStatus": "PLACED",
  "paymentStatus": "PAID"
}
```

### Get All Orders (Admin Only)
```http
GET /orders/all
Authorization: Bearer <admin_token>

Response: 200
[
  {
    "_id": "order_id",
    "userId": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "totalAmount": 1798,
    "orderStatus": "PLACED"
  }
]
```

### Update Order Status (Admin Only)
```http
PUT /orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "orderStatus": "SHIPPED"
}

Response: 200
{
  "message": "Order status updated",
  "order": {...}
}
```

---

## Review Endpoints

### Create Review
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "rating": 5,
  "comment": "Great product!"
}

Response: 201
{
  "message": "Review submitted",
  "review": {...}
}
```

### Get Product Reviews
```http
GET /reviews/:productId

Response: 200
[
  {
    "_id": "review_id",
    "userId": {
      "name": "John Doe"
    },
    "rating": 5,
    "comment": "Great product!",
    "isApproved": true
  }
]
```

### Approve Review (Admin Only)
```http
PUT /reviews/:id/approve
Authorization: Bearer <admin_token>

Response: 200
{
  "message": "Review approved",
  "review": {...}
}
```

---

## Payment Logic

The payment system uses simple arithmetic:

1. **Calculate Total**: `total = sum(item_price × quantity)`
2. **Simulate Payment**: 90% success rate (random)
3. **Generate Transaction ID**: `TXN{timestamp}{random}`
4. **Update Order**: Set paymentStatus to "PAID" or keep "PENDING"

No external payment gateways are used.
