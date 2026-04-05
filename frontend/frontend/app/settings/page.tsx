"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserProfile {
  email: string;
  subscription_tier: string;
  evaluations_count: number;
  created_at: string;
}

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`https://evalytix-api.onrender.com/profile/${userEmail}`);
        const data = await response.json();
        if (!data.error) setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      
      {/* ==================== SIDEBAR ==================== */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm hidden md:flex md:flex-col">
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 tracking-tight">
            EVALYTIX
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-semibold transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </Link>
          <Link href="/evaluate" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-semibold transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Evaluation
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            General Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Settings</h1>
            <p className="text-gray-500 mt-2 font-medium">Manage your account preferences and billing.</p>
          </header>

          {profile ? (
            <div className="space-y-8">
              
              {/* Account Details */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Account Profile</h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
                    <input 
                      type="text" 
                      disabled
                      className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                      value={profile.email}
                    />
                    <p className="text-xs text-gray-400 mt-2">To change your email, please contact support.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Password</label>
                    <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl text-sm font-bold transition">
                      Request Password Reset
                    </button>
                  </div>
                </div>
              </section>

              {/* Billing Details */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Subscription & Billing</h2>
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Current Plan</p>
                    <h3 className="text-2xl font-black text-gray-900">{profile.subscription_tier}</h3>
                    <p className="text-sm text-gray-600 mt-1">You have run <span className="font-bold text-blue-600">{profile.evaluations_count}</span> evaluations so far.</p>
                  </div>
                  
                  <button className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg transition whitespace-nowrap">
                    Upgrade to Pro
                  </button>
                </div>
              </section>

            </div>
          ) : (
             <div className="animate-pulse flex flex-col items-center py-20">
               <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}