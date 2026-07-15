import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    // Express normalizes all header keys to lowercase automatically
    const token = req.headers.token || req.headers['authorization'];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not Authorized. Please log in again.'
        });
    }

    try {
        // Strip out "Bearer " prefix if it gets passed from Postman or systems by accident
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        // This attaches { id, role } directly onto req.user
        req.user = decoded; 
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Session expired or invalid token.',
            error: error.message
        });
    }
};

export default authMiddleware;