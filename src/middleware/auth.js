import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function requireAuth(req, res, next){
  const token = req.cookies?.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);
  if(!token){
    return res.status(401).json({ error: "Unauthorized" });
  }
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  }catch{
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireRole(...roles){
  return (req, res, next) => {
    if(!req.user){ return res.status(401).json({ error: "Unauthorized" }); }
    if(!roles.includes(req.user.role)){ return res.status(403).json({ error: "Forbidden" }); }
    return next();
  };
}


