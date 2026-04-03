import { supabase } from "../config/supabase.js";
import jwt from "jsonwebtoken";

// ================= SIGNUP =================
export const signup = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ message: "User creation failed" });
    }

    // insert into profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: data.user.id,
          role,
          name,
        },
      ]);

    if (profileError) {
      return res.status(400).json({ message: profileError.message });
    }

    res.json({ message: "User created successfully ✅" });

  } catch (err) {
    console.log("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // 🔥 Fetch user profile from DB
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      return res.status(400).json({ message: profileError.message });
    }

    // 🔐 Create JWT
    const token = jwt.sign(
      { userId: data.user.id },
      process.env.JWT_SECRET
    );

    // ✅ Send BOTH token + user
    // res.json({
    //   token,
    //   user: profile,
    // });
    res.json({
  token,
  user: {
    id: data.user.id,
    name: profile.name,
    role: profile.role,
    email: data.user.email,   // 🔥 FIX HERE
  },
});

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};