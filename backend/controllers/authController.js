import User from "../models/userModel.js";
import { hash, compare } from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import axios from "axios";

export const register = async (req, res) => {
    try {
        const { email, password, name, phone, address, role } = req.body;
        
        // Block admin email from registration
        if (email === "chennupatimanojkumar2@gmail.com") {
            return res.status(403).json({ message: "This email is reserved" });
        }
        
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
            role: "USER" // Force all registrations to be USER role
        });

        const token = generateToken(newUser);
        res.status(201).json({ 
            message: "User created successfully",
            token,
            user: { 
                id: newUser._id, 
                name: newUser.name, 
                email: newUser.email, 
                phone: newUser.phone,
                address: newUser.address,
                role: newUser.role 
            }
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
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                phone: user.phone,
                address: user.address,
                role: user.role 
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch profile", error: err.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, phone, address },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({ message: "Profile updated successfully", user });
    } catch (err) {
        res.status(500).json({ message: "Failed to update profile", error: err.message });
    }
};

export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        
        console.log('Google Auth Request received');
        
        if (!credential) {
            console.log('No credential provided');
            return res.status(400).json({ message: "No credential provided" });
        }
        
        console.log('Decoding credential...');
        
        // Decode JWT token
        const parts = credential.split('.');
        if (parts.length !== 3) {
            console.log('Invalid token format');
            return res.status(400).json({ message: "Invalid token format" });
        }
        
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
        const googleUser = JSON.parse(jsonPayload);
        
        console.log('Google user:', googleUser.email);
        
        if (!googleUser.email) {
            console.log('No email in token');
            return res.status(400).json({ message: "Invalid Google token" });
        }
        
        // Check if user exists
        let user = await User.findOne({ email: googleUser.email });
        
        if (!user) {
            console.log('Creating new user:', googleUser.email);
            user = await User.create({
                name: googleUser.name,
                email: googleUser.email,
                password: await hash(Math.random().toString(36), 12),
                phone: '',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    country: '',
                    zipCode: ''
                },
                role: "USER",
                isActive: true
            });
        } else {
            console.log('User exists:', googleUser.email);
        }
        
        const token = generateToken(user);
        console.log('Login successful for:', googleUser.email);
        
        res.json({ 
            message: "Google login successful",
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                phone: user.phone,
                address: user.address,
                role: user.role 
            }
        });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ message: "Google authentication failed", error: err.message });
    }
};
