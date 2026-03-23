import mongoose from "mongoose";
import Product from "./models/ProductModel.js";

async function diagnose() {
  try {
    await mongoose.connect("mongodb://localhost:27017/Shopzo");
    console.log("Connected to MongoDB\n");

    const allProducts = await Product.find({});
    console.log(`Total products: ${allProducts.length}`);
    
    const activeProducts = await Product.find({ isActive: true });
    console.log(`Active products: ${activeProducts.length}\n`);

    if (allProducts.length > 0) {
      console.log("First product structure:");
      console.log(JSON.stringify(allProducts[0], null, 2));
    } else {
      console.log("No products found in database!");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

diagnose();
