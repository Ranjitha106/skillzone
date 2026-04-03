import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import http from "http";
import { Server } from "socket.io";
import { supabase } from "./config/supabase.js";

import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ JSON parser
app.use(express.json());

// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// 🔥 STORE CODE FOR EACH ROOM
let roomCode = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ JOIN ROOM
  socket.on("join-room", (sessionId) => {
    socket.join(sessionId);
    console.log(`User joined room ${sessionId}`);

    socket.emit(
      "code-update",
      roomCode[sessionId] || "// Start collaborating..."
    );
  });

  // 🚪 END SESSION
  // socket.on("end-session", ({ sessionId }) => {
  //   console.log("Session ended:", sessionId);
  //   socket.to(sessionId).emit("session-ended");
  // });
  socket.on("end-session", ({ sessionId, role }) => {
  socket.to(sessionId).emit("session-ended", { role });
});

  // ✅ CODE SYNC
  socket.on("code-change", ({ sessionId, code }) => {
    roomCode[sessionId] = code;
    socket.to(sessionId).emit("code-update", code);
  });

  // ✅ CHAT MESSAGE
  socket.on("send-message", async ({ sessionId, message, sender }) => {
    try {
      const { error } = await supabase.from("messages").insert([
        {
          session_id: sessionId,
          content: message,
          sender_id: sender,
        },
      ]);

      if (error) {
        console.log("DB ERROR:", error);
        return;
      }

      socket.to(sessionId).emit("receive-message", {
        message,
        sender,
        time: new Date(),
      });
    } catch (err) {
      console.log("SERVER ERROR:", err);
    }
  });

  socket.on("language-change", ({ sessionId, language }) => {
  // Broadcast the new language to others in the room
  socket.to(sessionId).emit("language-update", language);
});

  // ✅ WEBRTC SIGNALING
  socket.on("offer", ({ sessionId, offer }) => {
    socket.to(sessionId).emit("offer", offer);
  });

  socket.on("answer", ({ sessionId, answer }) => {
    socket.to(sessionId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ sessionId, candidate }) => {
    socket.to(sessionId).emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
  // Inside your io.on("connection") block in server.js

socket.on("run-code", async ({ sessionId, code, language }) => {
  try {
    // ✅ Judge0 language IDs
    const langMap = {
      javascript: 63,
      python: 71,
      java: 62,
      cpp: 54,
    };

    const response = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: langMap[language],
        }),
      }
    );

    const data = await response.json();

    // ✅ Extract output properly
    const output =
      data.stdout ||
      data.stderr ||
      data.compile_output ||
      "No output";

    // 🔥 Send to BOTH users
    io.to(sessionId).emit("code-result", output);

  } catch (err) {
    console.error("JUDGE0 ERROR:", err);

    io.to(sessionId).emit(
      "code-result",
      "Execution Error: Judge0 failed."
    );
  }
});
  
});

// ✅ START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});