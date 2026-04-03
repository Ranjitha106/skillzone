import { supabase } from "../config/supabase.js";

// export const createSession = async (req, res) => {
//   const mentorId = req.user.userId;

//   const { data, error } = await supabase
//     .from("sessions")
//     .insert([{ mentor_id: mentorId }])
//     .select();

//   if (error) return res.status(400).json({ error });

//   // res.json(data);
//   res.json({
//   sessionId: data[0].id,
// });
// };
export const createSession = async (req, res) => {
  try {
    const mentorId = req.user?.userId;

    if (!mentorId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("sessions")
      .insert([{ mentor_id: mentorId }])
      .select();

    if (error) {
      console.log("SUPABASE ERROR:", error);
      return res.status(400).json({ error });
    }

    if (!data || data.length === 0) {
      return res.status(400).json({ error: "No session created" });
    }

    // ✅ SAFE RETURN
    res.json({
      sessionId: data[0].id,
    });

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const joinSession = async (req, res) => {
  const { sessionId } = req.body;
  const studentId = req.user.userId;

  const { data, error } = await supabase
    .from("sessions")
    .update({ student_id: studentId })
    .eq("id", sessionId)
    .select();

  if (error) return res.status(400).json({ error });

  res.json(data);
};

export const endSession = async (req, res) => {
  const { sessionId } = req.body;

  const { error } = await supabase
    .from("sessions")
    .update({ status: "ended" })
    .eq("id", sessionId);

  if (error) return res.status(400).json({ error });

  res.json({ message: "Session ended" });
};

export const getMessages = async (req, res) => {
  const { sessionId } = req.params;

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) return res.status(400).json({ error });

  res.json(data);
};