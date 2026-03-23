import { authenticate } from './authMiddleware.js';

export const adminOnly = (req, res, next) => {
  authenticate(req, res, (err) => {
    if (err) return next(err);
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    next();
  });
};