import mongoose from "mongoose";
import { hash } from "bcryptjs";
import User from "./models/userModel.js";

const updateAdmin = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Shopzo");
    console.log("Connected to database");

    // Hash the password
    const hashedPassword = await hash("Suhana", 12);

    // Update admin user
    const admin = await User.findOneAndUpdate(
      { email: "chennupatimanojkumar2@gmail.com" },
      {
        name: "Admin",
        password: hashedPassword,
        role: "ADMIN",
        phone: "1234567890",
        address: {
          street: "Admin Street",
          city: "Admin City", 
          state: "Admin State",
          country: "India",
          zipCode: "123456"
        }
      },
      { new: true, upsert: true }
    );

    console.log("Admin user updated successfully:", admin.email);
    console.log("Role:", admin.role);
    process.exit(0);
  } catch (error) {
    console.error("Error updating admin:", error);
    process.exit(1);
  }
};

updateAdmin();