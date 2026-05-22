/**
 * Authentication middleware for admin routes.
 * Checks if the current session has admin privileges.
 */
const requireAuth = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    // Session is authenticated — proceed to the route handler
    return next();
  }

  // No valid admin session — deny access
  return res.status(401).json({
    success: false,
    message: 'Unauthorized'
  });
};

module.exports = requireAuth;
