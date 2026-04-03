"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  useAuth();
  const [user, setUser] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const createSession = async () => {
    try {
      const res = await api.post("/session/create");
      const newSessionId = res.data.sessionId;

      if (!newSessionId) {
        alert("No session ID received");
        return;
      }

      router.push(`/session/${newSessionId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create session");
    }
  };

  const joinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) {
      router.push(`/session/${sessionId}`);
    }
  };

  if (!user) return <div className="p-10 text-gray-300">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      
      <Sidebar />

      <main className="flex-1 ml-64 p-10 overflow-y-auto">

        {/* 🔥 HEADER */}
        {/* 🔥 HEADER */}
<div className="mb-12">

  {/* Dynamic Title */}
  <h1 className="text-5xl font-extrabold tracking-tight">
    {user.role === "mentor" ? "Mentor Dashboard" : "Student Dashboard"}
  </h1>

  {/* Welcome */}
  <p className="text-xl text-gray-300 mt-4">
    Welcome back,{" "}
    <span className="text-blue-400 font-semibold">
      {user.name || user.email}
    </span>
  </p>

  {/* Role */}
 <p className="mt-2 inline-block px-3 py-1 text-sm font-medium 
             text-blue-300 bg-blue-500/10 
             border border-blue-500/20 
             rounded-full capitalize">
    Role: {user.role}
  </p>

</div>

        {/* 🔥 FULL WIDTH GRID (FIXED) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">

          {/* MENTOR */}
          {user.role === "mentor" && (
           <div className="p-10 rounded-2xl bg-gray-900/70 backdrop-blur-md border border-blue-500/20 shadow-xl hover:shadow-blue-500/10 transition w-full">

              <h3 className="text-xl font-semibold mb-3">
                Start a Mentorship
              </h3>

              <p className="text-gray-400 text-sm mb-6">
                Create a new session and guide your students in real-time.
              </p>

              <button 
                onClick={createSession}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Create New Session
              </button>
            </div>
          )}

          {/* STUDENT */}
          {user.role === "student" && (
            <div className="p-8 rounded-2xl bg-gray-900/70 backdrop-blur-md border border-green-500/20 shadow-xl hover:shadow-green-500/10 transition w-full">

              <h3 className="text-xl font-semibold mb-3">
                Join Your Mentor
              </h3>

              <p className="text-gray-400 text-sm mb-6">
                Enter your session ID to connect instantly with your mentor.
              </p>

              <form onSubmit={joinSession} className="flex flex-col gap-4">
                <input 
                  type="text" 
                  placeholder="Enter Session ID" 
                  className="bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  required
                />

                <button 
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
                >
                  Join Session
                </button>
              </form>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}