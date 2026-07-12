import jwt from 'jsonwebtoken'; 
// protect any route — must be logged in
export function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized, no token' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
}

// restrict to specific roles
// usage: restrictTo('admin')  or  restrictTo('doctor', 'admin')
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    next();
  };
}