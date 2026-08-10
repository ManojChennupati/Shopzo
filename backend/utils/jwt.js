import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};
