import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// 🔥 USE REAL SESSION ID (from your DB/Postman)
const SESSION_ID = "8d991aa0-8179-4ddd-8900-84e914edef39";

// JOIN ROOM
socket.emit("join-room", SESSION_ID);

// RECEIVE MESSAGE
socket.on("receive-message", (data) => {
  console.log("Message received:", data);
});

// SEND MESSAGE AFTER 2s
setTimeout(() => {
  socket.emit("send-message", {
    sessionId: SESSION_ID,
    message: "Hello from client 🚀",
    sender: "TestUser",
  });
}, 2000);

// SEND CODE CHANGE AFTER 4s
setTimeout(() => {
  socket.emit("code-change", {
    sessionId: SESSION_ID,
    code: "console.log('Hello World 🚀')",
  });
}, 4000);

// RECEIVE CODE
socket.on("code-update", (code) => {
  console.log("Code updated:", code);
});