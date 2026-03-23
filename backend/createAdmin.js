import mongoose from "mongoose";
import { hash } from "bcryptjs";
import User from "./models/userModel.js";

const createAdmin = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Shopzo");
    console.log("Connected to database");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "chennupatimanojkumar2@gmail.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await hash("Suhana", 12);

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "chennupatimanojkumar2@gmail.com",
      password: hashedPassword,
      phone: "1234567890",
      role: "ADMIN",
      address: {
        street: "Admin Street",
        city: "Admin City",
        state: "Admin State",
        country: "India",
        zipCode: "123456"
      }
    });

    console.log("Admin user created successfully:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();