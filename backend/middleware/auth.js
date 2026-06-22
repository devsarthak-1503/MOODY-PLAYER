const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Token is format "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is invalid' });
  }

  const token = parts[1];

  // BYPASS FOR MOCK GUEST SESSION
  if (token === 'mock_guest_token_12345') {
    req.user = { id: '667788990011223344556677' }; // Static mock ObjectId representing Sarthak
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'moody_player_super_secret_jwt_key_12345');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
