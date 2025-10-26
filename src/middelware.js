import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        console.error("CRITICAL ERROR: JWT_SECRET environment variable is not defined.");
        return res.status(500).json({ message: "Server configuration error." });
    }

    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authorization failed: Missing or invalid token format." });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded.id) {
             return res.status(401).json({ message: "Invalid token payload: User ID missing." });
        }
        
        req.user = { 
             id: String(decoded.id), 
             username: String(decoded.username || 'unknown'),
        };
        
        next(); 
        
    } catch (error) {
        let message = "Unauthorized: Invalid token.";
        
        if (error.name === 'TokenExpiredError') {
             message = "Session expired. Please log in again.";
        } else if (error.name === 'JsonWebTokenError') {
             message = "Authorization failed: Token is invalid.";
        }
        
        return res.status(401).json({ message: message });
    }
};