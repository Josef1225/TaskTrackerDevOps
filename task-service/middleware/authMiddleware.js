const jwt = require('jsonwebtoken');

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token using the same secret as user-service
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info from token to request object
    req.user = decoded;

    console.log("Authorization header:", authHeader);
    console.log("Decoded token:", decoded);


    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};


module.exports = authMiddleware;
