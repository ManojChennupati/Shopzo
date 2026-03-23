import mongoose from "mongoose";

async function fixIsActive() {
  try {
    await mongoose.connect("mongodb://localhost:27017/Shopzo");
    console.log("Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const collection = db.collection('products');
    
    const result = await collection.updateMany(
      {},
      { $set: { isActive: true } }
    );

    console.log(`✅ Updated ${result.modifiedCount} products`);
    
    const activeCount = await collection.countDocuments({ isActive: true });
    console.log(`Active products now: ${activeCount}`);

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

fixIsActive();
