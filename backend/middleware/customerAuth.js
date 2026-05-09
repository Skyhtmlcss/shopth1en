const jwt = require('jsonwebtoken');

const customerAuthMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
    if (decoded.role !== 'customer') {
      return res.status(403).json({ message: 'Forbidden: customer access only' });
    }
    req.customer = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = customerAuthMiddleware;
