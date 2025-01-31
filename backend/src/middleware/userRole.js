const checkRole = (roles) => {
    return (req, res, next) => {
      const userRole = req.user.role; // Assuming the user's role is stored in the JWT payload or session
  
      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
  
      next();
    };
  };
  