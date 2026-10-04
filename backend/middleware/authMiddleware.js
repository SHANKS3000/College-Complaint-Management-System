function requireAuth(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    next();
  };
}

module.exports = { requireAuth };
