"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Evaluation {
  id: number;
  startup_name: string;
  evaluation_mode: string;
  overall_viability_score: number;
  technical_readiness_score: number;
  business_viability_score: number;
  ai_feedback_json: string;
}

interface UserProfile {
  email: string;
  subscription_tier: string;
  evaluations_count: number;
  created_at: string;
}

export default function Dashboard() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      router.push("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const profileRes = await fetch(`http://127.0.0.1:8000/profile/${userEmail}`);
        const profileData = await profileRes.json();
        if (!profileData.error) setProfile(profileData);

        const evalRes = await fetch("http://127.0.0.1:8000/evaluations/");
        const evalData = await evalRes.json();
        if (evalData.status === "Success") {
          setEvaluations(evalData.data.reverse());
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this evaluation? This cannot be undone.");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/evaluations/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!data.error) {
        setEvaluations(evaluations.filter((evalItem) => evalItem.id !== id));
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to connect to the backend.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    window.location.href = "/login"; // Hard redirect to clear cache
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* ================= DYNAMIC TOP NAVBAR ================= */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight">
            EVALYTIX
          </Link>
          <span className="hidden md:inline-block bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">Dashboard</span>
        </div>

        <div className="flex items-center gap-4">
          {/* User Profile Badge */}
          {profile && (
            <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 px-3 py-2 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                {profile.email.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-gray-900 leading-none">{profile.email.split('@')[0]}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">{profile.subscription_tier} • {profile.evaluations_count} Evals</p>
              </div>
            </div>
          )}

          {/* Settings Icon */}
          <Link href="/settings" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition" title="Settings">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </Link>

          {/* Logout Icon */}
          <button onClick={handleLogout} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition" title="Log Out">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </nav>
      
      {/* ================= DASHBOARD CONTENT ================= */}
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-2 font-medium">Welcome back. Here is what is happening with your evaluations today.</p>
        </header>

        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Evaluations</h2>
          <Link href="/evaluate" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Evaluation
          </Link>
        </div>

        {evaluations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200 border-dashed">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">No evaluations yet.</h3>
            <p className="text-gray-500 mt-2 font-medium">Start analyzing startups to build your portfolio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evaluations.map((evalItem) => (
              <div key={evalItem.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 relative group cursor-pointer flex flex-col justify-between">
                
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(evalItem.id); }}
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                  title="Delete Evaluation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>

                <Link href={`/report/${evalItem.id}`} className="block h-full">
                  <div className="flex justify-between items-start mb-4 pr-6">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{evalItem.startup_name}</h3>
                  </div>
                  <span className="inline-block mb-4 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-3 py-1.5 rounded-full">
                    {evalItem.evaluation_mode}
                  </span>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-black text-white shadow-inner ${
                      evalItem.overall_viability_score >= 80 ? "bg-green-500" : 
                      evalItem.overall_viability_score >= 60 ? "bg-yellow-500" : "bg-red-500"
                    }`}>
                      {Math.round(evalItem.overall_viability_score)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Overall Score</p>
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mt-0.5 group-hover:underline">View report &rarr;</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mt-auto">
                    <p className="text-gray-600 text-xs line-clamp-2 font-medium italic">
                      &quot;{evalItem.ai_feedback_json}&quot;
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}