"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // NEW STATE
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // NEW CHECK: Do the passwords match?
    if (password !== confirmPassword) {
      alert("Passwords do not match! Please try again.");
      return; // Stop the function here
    }

    setLoading(true);

    try {
      const response = await fetch("https://evalytix-api.onrender.com/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error); 
      } else {
        alert("Account created successfully! Welcome to Evalytix."); 
        router.push("/login"); 
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("Failed to connect to the backend.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600 mb-2">
            Create an Account
          </h1>
          <p className="text-gray-500">Join Evalytix to evaluate startups.</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="founder@startup.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* NEW CONFIRM PASSWORD FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input 
              type="password" 
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg shadow-md mt-4 transition"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account? {" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </main>
  );
}