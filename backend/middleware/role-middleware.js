const globalData = require('../config/global-data.json');
const userTypes = globalData.userTypes;


function checkRole(userType) {
  return (req, res, next) => {
    const userRole = req.user.userType; // Assuming user role is attached to the request object after authentication
    if (userRole === userType) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied' });
  };
}

function checkRoles(roles) {
  return (req, res, next) => {
    const userRole = req.user.userType; // Assuming user role is attached to the request object after authentication
    if (roles.includes(userRole)) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied' });
  };
}

module.exports = {
  checkRole,
  checkRoles,
};