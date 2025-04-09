import jwt from 'jsonwebtoken';

const auth = {
    verifyAdminToken: (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({ message: 'Authentication token is required' });
            }
            
            // In a real application, you would verify the token with your secret key
            // const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // For now, we'll just check if the token exists
            if (token !== 'mock-jwt-token') {
                return res.status(401).json({ message: 'Invalid token' });
            }
            
            // Add user info to request
            req.user = {
                id: 1,
                role: 'admin'
            };
            
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
    }
};

export default auth; 