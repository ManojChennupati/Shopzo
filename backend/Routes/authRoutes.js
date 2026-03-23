import express from "express";
import { register, login, getProfile, updateProfile, googleAuth } from "../controllers/authController.js";
import { authenticate } from "../Middlewares/authMiddleware.js";

export const authRoute = express.Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.post("/google", googleAuth);
authRoute.get("/profile", authenticate, getProfile);
authRoute.put("/profile", authenticate, updateProfile);
