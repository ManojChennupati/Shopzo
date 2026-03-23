import mongoose from 'mongoose';
import Product from './models/ProductModel.js';

async function restoreProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Shopzo');
    
    const products = [
      { id: 1, title: "Essence Mascara Lash Princess", price: 399, currency: "INR", isActive: true },
      { id: 2, title: "Eyeshadow Palette with Mirror", price: 799, currency: "INR", isActive: true },
      { id: 3, title: "Powder Canister", price: 650, currency: "INR", isActive: true },
      { id: 4, title: "Red Lipstick", price: 400, currency: "INR", isActive: true },
      { id: 5, title: "Red Nail Polish", price: 150, currency: "INR", isActive: true },
      { id: 6, title: "Calvin Klein CK One", price: 2499, currency: "INR", isActive: true },
      { id: 7, title: "Chanel Coco Noir Eau De", price: 6499, currency: "INR", isActive: true },
      { id: 8, title: "Dior J'adore", price: 4499, currency: "INR", isActive: true },
      { id: 9, title: "Dolce Shine Eau de", price: 3499, currency: "INR", isActive: true },
      { id: 10, title: "Gucci Bloom Eau de", price: 3999, currency: "INR", isActive: true },
      { id: 11, title: "Annibale Colombo Bed", price: 120000, currency: "INR", isActive: true },
      { id: 12, title: "Annibale Colombo Sofa", price: 180000, currency: "INR", isActive: true },
      { id: 13, title: "Bedside Table African Cherry", price: 6500, currency: "INR", isActive: true },
      { id: 14, title: "Knoll Saarinen Executive Conference Chair", price: 25000, currency: "INR", isActive: true },
      { id: 15, title: "Wooden Bathroom Sink With Mirror", price: 35000, currency: "INR", isActive: true },
      { id: 16, title: "Apple", price: 120, currency: "INR", isActive: true },
      { id: 17, title: "Beef Steak", price: 900, currency: "INR", isActive: true },
      { id: 18, title: "Cat Food", price: 450, currency: "INR", isActive: true },
      { id: 19, title: "Chicken Meat", price: 320, currency: "INR", isActive: true },
      { id: 20, title: "Cooking Oil", price: 180, currency: "INR", isActive: true },
      { id: 21, title: "Cucumber", price: 40, currency: "INR", isActive: true },
      { id: 22, title: "Dog Food", price: 550, currency: "INR", isActive: true },
      { id: 23, title: "Eggs", price: 90, currency: "INR", isActive: true },
      { id: 24, title: "Fish Steak", price: 700, currency: "INR", isActive: true },
      { id: 25, title: "Green Bell Pepper", price: 80, currency: "INR", isActive: true },
      { id: 26, title: "Green Chili Pepper", price: 40, currency: "INR", isActive: true },
      { id: 27, title: "Honey Jar", price: 350, currency: "INR", isActive: true },
      { id: 28, title: "Ice Cream", price: 250, currency: "INR", isActive: true },
      { id: 29, title: "Juice", price: 120, currency: "INR", isActive: true },
      { id: 30, title: "Kiwi", price: 250, currency: "INR", isActive: true }
    ];
    
    await Product.insertMany(products);
    console.log(`Restored ${products.length} products`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

restoreProducts();