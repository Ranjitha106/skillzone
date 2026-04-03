"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { User, Mail, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  useAuth();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 ml-64 p-10 flex justify-center items-start">
        <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-6 mb-8 border-b border-gray-800 pb-8">
            <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-600/20">
              {user.name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.name || "User"}</h1>
              <p className="text-blue-400 font-medium">Verified {user.role}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-gray-800/40 p-4 rounded-xl">
              <Mail className="text-gray-500" size={20} />
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold">Email Address</p>
                {/* <p className="text-gray-200">{user.email}</p> */}
                <p className="text-gray-200">{user.email || user.user_metadata?.email || "No Email Found"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gray-800/40 p-4 rounded-xl">
              <ShieldCheck className="text-gray-500" size={20} />
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold">Account Security</p>
                <p className="text-gray-200">JWT Authenticated via Supabase</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}