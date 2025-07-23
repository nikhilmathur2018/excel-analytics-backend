// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure your User model path is correct

// Middleware to protect routes: verifies JWT and attaches user to req
exports.protect = async (req, res, next) => {
    let token;

    // Check if the token exists in headers and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from the "Bearer <token>" string
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the JWT_SECRET from environment variables
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by ID from the decoded token and attach to req.user
            // Exclude the password field for security
            req.user = await User.findById(decoded.id).select('-password');

            // If user is found and attached, proceed to the next middleware/route handler
            next();
        } catch (error) {
            // Log the specific error for debugging purposes
            console.error('Token verification error:', error.message);
            // Send a 401 Unauthorized response if token is invalid or expired
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token is found in the headers, send a 401 Unauthorized response
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to check if the authenticated user has an 'admin' role
exports.admin = (req, res, next) => {
    // The 'protect' middleware must run before 'admin' to ensure req.user exists
    // Check if req.user exists and if their role is 'admin'
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed to the next middleware/route handler
    } else {
        // If not an admin, send a 403 Forbidden response
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
};
