import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const authenticate = (req, res, next) => {
    console.log('=== AUTHENTICATION MIDDLEWARE ===');
    console.log('Headers:', req.headers.authorization);
    
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token decoded successfully:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.log('Token verification failed:', err.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};
