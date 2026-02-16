import User from "../models/userModel.js";
import { hash, compare } from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => {
    try {
        const { email, password, name, phone, address, role } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await hash(password, 12);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            role: role || "USER"
        });

        const token = generateToken(newUser);
        res.status(201).json({ 
            message: "User created successfully",
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (err) {
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account is deactivated" });
        }

        const token = generateToken(user);
        res.json({ 
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
};
