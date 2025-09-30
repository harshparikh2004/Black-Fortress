import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { User } from "../models/User.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const isProd = process.env.NODE_ENV === "production";

const registerValidators = [
  body("username").isString().isLength({ min: 3, max: 64 }).trim(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("role").optional().isIn(["admin","user"]) 
];

router.post("/register", registerValidators, async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ error: "Invalid input", details: errors.array() });
  }
  const { username, email, password, role } = req.body;
  try{
    const existing = await User.findOne({ email });
    if(existing){
      return res.status(409).json({ error: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash, role: role || "user" });
    return res.status(201).json({ id: user.id, email: user.email });
  }catch(err){
    return res.status(500).json({ error: "Registration failed" });
  }
});

const loginValidators = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 8 })
];

const ACCOUNT_LOCK_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;

router.post("/login", loginValidators, async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ error: "Invalid credentials" });
  }
  const { email, password } = req.body;
  try{
    const user = await User.findOne({ email });
    if(!user){
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if(user.lockUntil && user.lockUntil > new Date()){
      return res.status(423).json({ error: "Account locked. Try later." });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if(!match){
      const failed = (user.failedLoginCount || 0) + 1;
      const update = { failedLoginCount: failed };
      if(failed >= MAX_FAILED_ATTEMPTS){
        update.lockUntil = new Date(Date.now() + ACCOUNT_LOCK_MINUTES*60*1000);
        update.failedLoginCount = 0;
      }
      await User.updateOne({ _id: user._id }, update);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    await User.updateOne({ _id: user._id }, { failedLoginCount: 0, lockUntil: null });
    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, secure: isProd, sameSite: isProd ? "strict" : "lax", maxAge: 3600*1000 });
    return res.json({ ok: true, role: user.role });
  }catch(err){
    return res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ ok: true });
});

export default router;


