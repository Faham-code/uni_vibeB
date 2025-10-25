import jwt from 'jsonwebtoken';
// Ensure 'jwt' is imported in this file

export const authMiddleware = (req, res, next) => {
    // 1. Safely check for the Authorization header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authorization failed: Missing or invalid token format." });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        // 2. Verify the token and decode the payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. CRITICAL ATTACHMENT FIX: Safely assign the user ID and data.
        
        if (!decoded.id) {
             // If the token is valid but doesn't contain an 'id', something is wrong with your login token creation
             return res.status(401).json({ message: "Invalid token payload: User ID missing." });
        }
        
        // 🟢 FIX 1: Ensure ID is always a String, which Mongoose's findById can handle reliably.
        // 🟢 FIX 2: Safely access username, using the ID as a fallback if the username field isn't in the token.
        req.user = { 
            id: String(decoded.id), 
            username: String(decoded.username || decoded.id),
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