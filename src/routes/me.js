import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = Router();

router.get("/profile", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("username email role createdAt").lean();
  if(!user){ return res.status(404).json({ error: "User not found" }); }
  return res.json({ id: req.user.id, username: user.username, email: user.email, role: user.role, createdAt: user.createdAt });
});

export default router;


