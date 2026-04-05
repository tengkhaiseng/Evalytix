"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://evalytix-api.onrender.com/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        setLoading(false); // Only turn off loading if there's an error
      } else {
        // Save the email to memory
        localStorage.setItem("userEmail", data.email);
        
        // 🚀 THE FIX: Use a hard redirect to force Next.js to clear its cache and load the Dashboard!
        window.location.href = "/"; 
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Failed to connect to the backend.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6 font-sans">
      <div className="max-w-md w-full">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight mb-2">
            EVALYTIX
          </h1>
          <p className="text-gray-500 font-medium">Welcome back. Please enter your details.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition font-medium text-gray-900"
                placeholder="founder@startup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Password</label>
                <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-500">Forgot password?</a>
              </div>
              <input 
                type="password" 
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition font-medium text-gray-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-md transition duration-300 flex justify-center items-center gap-2 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Clear Register Button Area */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 mb-4 font-medium">Don&apos;t have an account yet?</p>
          <Link 
            href="/signup" 
            className="inline-block w-full py-4 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition duration-300"
          >
            Create your Evalytix Account
          </Link>
        </div>

      </div>
    </main>
  );
}