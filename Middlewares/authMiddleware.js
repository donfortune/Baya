const user = require('../Models/user');
const jwt = require('jsonwebtoken');

exports.protectRoutes = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const existingUser = await user.findById(decoded.userId);
        if (!existingUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = existingUser;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
}