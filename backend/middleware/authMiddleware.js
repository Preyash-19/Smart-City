import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    // 1. Look for the token in the headers (The digital ID card)
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).json({ error: "Access Denied! No token provided." });
    }

    // Tokens usually come in the format "Bearer <token_string>". We just need the string.
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    // 2. Verify if the token is real and hasn't been tampered with
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach the user's details (ID, role, department) to the request so the next function can use it
    req.user = verified;
    
    // 4. Tell the server to move on to the actual route
    next();
    
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token!" });
  }
};

// We can also create a specialized guard just for Officers
export const verifyOfficer = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'OFFICER' || req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ error: "Access Denied! Only Officers can do this." });
    }
  });
};

// Strict Admin-only middleware
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ error: "Access Denied! Only Admins can do this." });
    }
  });
};