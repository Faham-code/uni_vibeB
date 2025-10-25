import jwt from 'jsonwebtoken';
// Ensure 'jwt' is imported in this file

export const authMiddleware = (req, res, next) => {
    // 1. CRITICAL FIX: Safely check for the Authorization header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // If header is missing or improperly formatted, send 401 immediately
        return res.status(401).json({ message: "Authorization failed: Missing or invalid token format." });
    }

    // Safely extract the token
    const token = authHeader.replace('Bearer ', '');

    try {
        // 2. Verify the token and decode the payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach the user ID and username to the request object
        // NOTE: This ensures 'req.user.id' is available for the controller
        req.user = { 
            id: decoded.id, 
            username: decoded.username 
        };
        
        // 4. Continue to the next middleware or controller function
        next(); 
        
    } catch (error) {
        // 5. Robust Error Handling (Token Expired or Invalid Signature)
        let message = "Unauthorized: Invalid token.";
        if (error.name === 'TokenExpiredError') {
             message = "Session expired. Please log in again.";
        }
        
        return res.status(401).json({ message: message });
    }
};