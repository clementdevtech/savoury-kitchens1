const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    console.log(req.cookies.token);
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = verifyToken;
