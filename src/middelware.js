export const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 🚨 CRITICAL FIX: Ensure the payload is attached with the correct property name
        req.user = { id: decoded.id, username: decoded.username }; // Adjust properties as needed
        
        next(); // Proceed to the controller
    } catch (error) {
        // 🚨 IMPORTANT: Send a proper 401 response instead of letting the server crash
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token." });
    }
};