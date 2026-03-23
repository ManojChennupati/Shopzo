# Product Schema Migration

## Overview
This migration updates the product schema to match the standardized product data model.

## Changes Made

### Database Schema (ProductModel.js)
- **Added**: `discountPercentage` (Number, default: 0) - Replaces `discountPrice`
- **Added**: `rating` (Number, default: 0, min: 0, max: 5)
- **Added**: `brand` (String, default: "")
- **Added**: `category` (String, default: "")
- **Added**: `thumbnail` (String, default: "")
- **Removed**: `discountPrice` (migrated to `discountPercentage`)

### Standard Product Model
```javascript
{
  "id": number,
  "title": string,
  "description": string,
  "price": number,
  "discountPercentage": number,
  "rating": number,
  "stock": number,
  "brand": string,
  "category": string,
  "thumbnail": string,
  "images": string[]
}
```

## Running the Migration

To update existing products in the database:

```bash
cd backend
node migrations/updateProductSchema.js
```

This will:
1. Convert `discountPrice` to `discountPercentage`
2. Add missing fields with default values
3. Set `thumbnail` to first image if available

## Updated Files

### Backend
- `models/ProductModel.js` - Updated schema
- `controllers/productController.js` - Updated create/update logic
- `controllers/cartController.js` - Updated price calculation
- `controllers/orderController.js` - Updated price calculation

### Frontend
- `pages/Products.jsx` - Updated to use discountPercentage and thumbnail
- `pages/ProductDetail.jsx` - Updated price calculations and image display
- `pages/AdminDashboard.jsx` - Updated form to include all fields

## Notes
- All existing functionality is preserved
- Price calculations now use: `price * (1 - discountPercentage / 100)`
- Thumbnail defaults to first image in images array if not set
- All new fields have sensible defaults to prevent breaking changes
