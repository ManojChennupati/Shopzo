# Quick Start Guide

## Prerequisites
- Node.js (v16+)
- MongoDB (running on localhost:27017)
- npm or yarn

## Installation & Setup

### 1. Backend Setup (5 minutes)

```bash
cd backend
npm install
npm start
```

Backend runs on: **http://localhost:8080**

### 2. Frontend Setup (5 minutes)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:3000**

## First Steps

### Create Admin Account

1. Register a new user at http://localhost:3000/register
2. Open MongoDB shell:
```bash
mongosh
use Shopzo
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

### Add Products (Admin)

1. Login with admin account
2. Go to http://localhost:3000/admin
3. Add products with title, description, price, stock

### Test User Flow

1. Register/Login as regular user
2. Browse products
3. Add items to cart
4. Checkout with shipping address
5. Process payment (90% success rate)
6. View orders

## API Testing

Use the included `req.http` file or test with curl:

```bash
# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123","phone":"1234567890","address":{"street":"123 St","city":"NYC","state":"NY","country":"USA","zipCode":"10001"}}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get Products
curl http://localhost:8080/products
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in server.js

### Port Already in Use
- Backend: Change port in server.js
- Frontend: Change port in vite.config.js

### CORS Errors
- Ensure backend has `app.use(cors())` enabled
- Check API proxy in vite.config.js

## Project Structure

```
Shopzo/
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/         # Database schemas
│   ├── Routes/         # API endpoints
│   ├── Middlewares/    # Auth middleware
│   └── utils/          # JWT utilities
├── frontend/
│   └── src/
│       ├── components/ # Reusable UI
│       ├── pages/      # Route pages
│       ├── context/    # State management
│       └── services/   # API calls
└── Documentation/
    ├── README.md
    ├── API_DOCUMENTATION.md
    └── ARCHITECTURE.md
```

## Next Steps

1. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details
3. Customize styling in frontend/src/index.css
4. Add environment variables for production
5. Implement additional features (see README.md)

## Common Tasks

### Reset Database
```bash
mongosh
use Shopzo
db.dropDatabase()
```

### View Logs
- Backend: Check terminal running `npm start`
- Frontend: Check browser console (F12)

### Stop Servers
- Press `Ctrl+C` in terminal running the server

## Support

For issues or questions:
1. Check API_DOCUMENTATION.md
2. Check ARCHITECTURE.md
3. Review error messages in terminal/console
4. Verify MongoDB is running
5. Ensure all dependencies are installed
