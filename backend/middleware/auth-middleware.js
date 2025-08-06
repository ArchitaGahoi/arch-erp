const jwt = require('jsonwebtoken');
const globalData = require('../config/global-data.json');
const userTypes = globalData.userTypes;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.user = {
      userId: decoded.userId,
      id: decoded.userId,
      userType: decoded.userType
    };
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.userType !== userTypes.ADMIN) {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

const isGeneralUser = (req, res, next) => {
  if (req.user.userType !== userTypes.GENERAL) {
    return res.status(403).json({ message: 'Access denied: General users only' });
  }
  next();
};

module.exports = {
  authMiddleware,
  isAdmin,
  isGeneralUser,
};