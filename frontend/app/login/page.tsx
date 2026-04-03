"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      
      <div className="w-full max-w-md space-y-8 rounded-xl bg-gray-800/80 backdrop-blur-md p-10 shadow-2xl border border-gray-700">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-blue-400">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-400">Login to your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md bg-blue-600 p-3 text-white font-bold transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-400 font-medium hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}