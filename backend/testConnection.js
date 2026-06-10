import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    console.log("Attempting to connect to MongoDB Atlas...");
    console.log("Connection string (password hidden):", MONGO_URI.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(MONGO_URI);
    console.log("✅ Successfully connected to MongoDB Atlas!");
    
    // List databases
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    console.log("\nAvailable databases:");
    databases.forEach(db => console.log(`  - ${db.name}`));
    
    await mongoose.connection.close();
    console.log("\n✅ Connection test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:");
    console.error(error.message);
    
    if (error.message.includes("bad auth")) {
      console.log("\n💡 Fix: Check your password in the connection string");
      console.log("   - Make sure special characters are URL-encoded");
      console.log("   - @ → %40, # → %23, etc.");
    }
    
    process.exit(1);
  }
};

testConnection();
