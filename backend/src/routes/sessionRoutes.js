import express from "express";
import { supabase } from "../config/supabase.js";
import { getMessages } from "../controllers/sessionController.js";
import {
  createSession,
  joinSession,
  endSession,
} from "../controllers/sessionController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createSession);
router.post("/join", authMiddleware, joinSession);
router.post("/end", authMiddleware, endSession);
router.get("/:sessionId/messages", authMiddleware, getMessages);
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id);

  if (error || !data.length) {
    return res.status(404).json({ error: "Session not found" });
  }

  res.json(data);
});
router.post("/end/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Update session status to inactive
    const { data, error } = await supabase
      .from("sessions")
      .update({ status: "inactive" })
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Session ended successfully" });
  } catch (err) {
    console.error("End session error:", err);
    res.status(500).json({ error: "Failed to end session" });
  }
});


export default router;