import jwt from 'jsonwebtoken';

// protect any route — must be logged in
export function protect(req, res, next) {
  const authHeader = req.headers.authorization;
        
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ success: false, error: 'No token provided.' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';
    return res.status(401).json({ success: false, error: msg });
  }
}

// restrict to specific roles
// usage: restrictTo('admin')  or  restrictTo('doctor', 'admin')
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) // 
      return res.status(403).json({
        success: false,
        error: `Access restricted to: ${roles.join(', ')}.`
      });
    next();
  };
}