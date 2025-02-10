const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const token1 = req.cookies.token; 

    if (!token1) {
      req.user1 = null;
      return next(); 
    }

    const decodedToken = jwt.verify(token1, process.env.JWT_SECRET);
    req.user1 = decodedToken; 
    next(); 
  } catch (error) {
    req.user1 = null; 
    return next(); 
  }
};

module.exports = verifyToken;
