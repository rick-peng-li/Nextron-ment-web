import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: '未提供认证令牌' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nextron_local_jwt_secret_change_me');
        req.user = decoded.user;
        return next();
    } catch (error) {
        return res.status(401).json({ message: '认证令牌无效或已过期' });
    }
};

export default authMiddleware;
