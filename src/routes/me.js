import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/profile", requireAuth, (req, res) => {
  return res.json({ id: req.user.id, role: req.user.role });
});

export default router;


