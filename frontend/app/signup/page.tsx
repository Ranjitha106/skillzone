"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/auth/signup", {
        name,
        email,
        password,
        role,
      });

      router.push("/login");
    } catch (err: any) {
      console.error("SIGNUP ERROR:", err);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      
      <div className="w-full max-w-md space-y-8 rounded-xl bg-gray-800/80 backdrop-blur-md p-10 shadow-2xl border border-gray-700">
        
        <h2 className="text-center text-3xl font-extrabold text-blue-400">
          Create Account
        </h2>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">

            {/* NAME */}
            <input
              type="text"
              placeholder="Full Name"
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <select
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 p-3 text-white font-bold hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}