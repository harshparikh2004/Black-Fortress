import { Router } from "express";
import { User } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", async (_req, res) => {
  const users = await User.find({}, { username: 1, email: 1, role: 1, createdAt: 1 }).sort({ createdAt: -1 }).lean();
  return res.json({ users });
});

router.patch("/users/:id/role", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if(!["admin","user"].includes(role)){
    return res.status(400).json({ error: "Invalid role" });
  }
  await User.updateOne({ _id: id }, { role });
  return res.json({ ok: true });
});

export default router;


