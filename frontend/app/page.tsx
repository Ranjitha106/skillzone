import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-6">
      
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">
        
        {/* 🔹 LEFT SIDE */}
        <div className="text-center md:text-left">
          
          {/* 🔥 BIGGER BRAND */}
          <h2 className="text-6xl md:text-7xl font-extrabold text-blue-400 tracking-wide leading-tight">
            SkillZone
          </h2>

          <h1 className="text-2xl md:text-3xl font-semibold text-white mt-4">
            Mentor-Student Platform
          </h1>

          <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-lg">
            Learn faster with real-time mentorship, live coding sessions,
            and expert guidance designed to help you grow.
          </p>

          {/* CTA */}
          <div className="mt-10">
            <Link href="/login">
              <button className="px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-lg text-lg">
                Get Started
              </button>
            </Link>
          </div>

          {/* Secondary */}
          <div className="mt-5 text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-400 hover:underline">
              Register
            </Link>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            Industry Standard 1-on-1 Mentorship Platform v1.0
          </div>
        </div>

        {/* 🔹 RIGHT SIDE */}
        <div className="flex justify-center relative">
          
          {/* ✨ Glow background */}
          <div className="absolute w-[320px] h-[320px] bg-blue-500/20 rounded-full blur-3xl"></div>

          {/* Image (clean, no heavy border) */}
          <div className="relative w-[320px] h-[320px] rounded-full overflow-hidden shadow-2xl border border-gray-700">
            <img
              src="/mento.jpg"
              alt="Mentorship Illustration"
              className="w-full h-full object-cover scale-110"
            />
          </div>

        </div>

      </div>
    </div>
  );
}