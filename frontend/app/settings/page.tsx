"use client";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Moon, Lock } from "lucide-react";

export default function SettingsPage() {
  useAuth();
  
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 ml-64 p-10">
        <h1 className="text-3xl font-bold mb-10">Settings</h1>
        
        <div className="max-w-3xl space-y-4">
          {[
            { name: "Push Notifications", icon: Bell, desc: "Get notified about new messages." },
            { name: "Dark Mode", icon: Moon, desc: "Your system is locked to Dark Mode.", disabled: true },
            { name: "Privacy & Security", icon: Lock, desc: "Manage your account data." },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between p-6 bg-gray-900 border border-gray-800 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="bg-gray-800 p-3 rounded-lg"><item.icon size={20} className="text-gray-400" /></div>
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
              <div className="w-10 h-5 bg-blue-600/20 border border-blue-600/30 rounded-full relative">
                <div className="w-3 h-3 bg-blue-500 rounded-full absolute top-1 right-1"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}