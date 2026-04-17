"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Strength {
  title: string;
  desc: string;
}

interface Evaluation {
  id: number;
  startup_name: string;
  evaluation_mode: string;
  overall_viability_score: number;
  technical_readiness_score: number;
  business_viability_score: number;
  innovation_index_score: number;
  financial_sustainability_score: number;
  key_strengths: string;
  priority_actions: string;
  strategic_opportunities: string;
  ai_feedback_json: string;
}

export default function ReportPage() {
  const params = useParams();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  
  // --- DETECTIVE MODE STATE ---
  const [debugMsg, setDebugMsg] = useState<string>("Loading...");

  // --- PARSED DATA STATES ---
  const [strengths, setStrengths] = useState<Strength[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [opportunities, setOpportunities] = useState<string[]>([]);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        // FIX: Check both "userEmail" AND "email" just in case your login page uses a different name!
        const userEmail = localStorage.getItem("userEmail") || localStorage.getItem("email");
        
        if (!userEmail) {
          setDebugMsg("❌ ERROR: No email found in your browser! The system doesn't know who you are. Please go back to the Dashboard and Log In again.");
          setLoading(false);
          return;
        }

        const response = await fetch(`https://evalytix-api.onrender.com/evaluations/${userEmail}`);
        const data = await response.json();
        
        if (data.status === "Success") {
          // DETECTIVE CHECK 1: Did the database return anything?
          if (data.data.length === 0) {
            setDebugMsg(`❌ ERROR: The database connected, but it found ZERO evaluations saved under the email: ${userEmail}. The evaluation didn't save correctly.`);
            setLoading(false);
            return;
          }

          const foundEval = data.data.find((e: Evaluation) => e.id.toString() === params.id);
          
          if (foundEval) {
            setEvaluation(foundEval);
            try { setStrengths(JSON.parse(foundEval.key_strengths || "[]")); } catch { console.log("Strengths parse error"); }
            try { setActions(JSON.parse(foundEval.priority_actions || "[]")); } catch { console.log("Actions parse error"); }
            try { setOpportunities(JSON.parse(foundEval.strategic_opportunities || "[]")); } catch { console.log("Opp parse error"); }
          } else {
            // DETECTIVE CHECK 2: The ID didn't match
            setDebugMsg(`❌ ERROR: The database found ${data.data.length} evaluations for ${userEmail}, but NONE of them matched the ID in the URL (${params.id}).`);
          }
        } else {
           setDebugMsg(`❌ API ERROR: ${JSON.stringify(data)}`);
        }
      } catch (error) {
        setDebugMsg(`❌ NETWORK ERROR: Failed to talk to Render server. Is the server asleep?`);
        console.error("Failed to load report", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchEvaluation();
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>
  );

  // 👇 THIS WILL NOW SHOW US EXACTLY WHY IT IS FAILING 👇
  if (!evaluation) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-2xl w-full">
        <h1 className="text-3xl font-black text-red-500 mb-4">Report Not Found</h1>
        <div className="bg-red-50 text-red-800 p-4 rounded-xl font-mono text-sm mb-6 border border-red-200">
           {debugMsg}
        </div>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition inline-block">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );

  const needleRotation = (evaluation.overall_viability_score / 100) * 180 - 90;

  const getAssessment = (score: number) => {
    if (score >= 80) return { title: "Excellent", color: "text-green-600", bg: "bg-green-50", border: "border-green-200", text: "Your startup demonstrates exceptional potential with highly defensible competitive advantages." };
    if (score >= 60) return { title: "Good", color: "text-yellow-600", bg: "bg-[#FFF9EA]", border: "border-[#FDE68A]", text: "Your startup demonstrates strong potential across multiple dimensions. The analysis has identified specific areas for optimization." };
    return { title: "High Risk", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", text: "Significant risks identified. A pivot is highly recommended." };
  };
  const assessment = getAssessment(evaluation.overall_viability_score);

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans pb-20 relative">
      
      {/* HEADER (Hidden when downloading PDF) */}
      <header className="bg-white px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-black shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">EVALYTIX</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="px-4 py-2 bg-[#10B981] text-white font-bold rounded-lg hover:bg-green-600 transition shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download PDF
          </button>
          <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-bold transition flex items-center gap-2">Dashboard</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        
        {/* ================= SECTION 1: OVERALL SCORE ================= */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-5 flex items-center gap-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            <h3 className="text-white font-bold text-xl tracking-wide">Overall Viability Score</h3>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-b border-gray-50">
            <div className="flex flex-col items-center justify-center pt-8">
              <div className="relative w-64 h-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 rounded-full border-30 border-transparent" style={{ borderTopColor: '#EF4444', borderRightColor: '#F59E0B', borderBottomColor: '#10B981', borderLeftColor: '#EF4444', transform: 'rotate(-45deg)' }}></div>
                <div className="absolute top-7.5 left-7.5 w-48 h-48 bg-white rounded-full"></div>
                <div className="absolute bottom-0 left-1/2 w-1.5 h-24 bg-gray-800 origin-bottom transition-transform duration-1000 ease-out z-10" style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}>
                    <div className="absolute -bottom-3 -left-1.5 w-5 h-5 bg-gray-800 rounded-full border-4 border-white shadow-sm"></div>
                </div>
              </div>
              <div className="text-center mt-4">
                <span className="text-6xl font-black text-gray-900">{evaluation.overall_viability_score}</span>
                <span className="text-3xl font-bold text-gray-300">/100</span>
              </div>
            </div>

            <div className={`${assessment.bg} border ${assessment.border} p-8 rounded-2xl shadow-sm relative`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Overall Assessment</p>
              <h4 className={`text-4xl font-black mb-4 ${assessment.color}`}>{assessment.title}</h4>
              <p className="text-gray-700 leading-relaxed text-sm font-medium">{evaluation.ai_feedback_json}</p>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-white">
            {[
              { label: "Technical Readiness", score: evaluation.technical_readiness_score || 0, weight: "30%", color: "text-gray-800", bar: "bg-gray-800" },
              { label: "Business Viability", score: evaluation.business_viability_score || 0, weight: "30%", color: "text-green-500", bar: "bg-green-500" },
              { label: "Innovation Index", score: evaluation.innovation_index_score || 0, weight: "20%", color: "text-gray-800", bar: "bg-gray-800" },
              { label: "Financial Sustainability", score: evaluation.financial_sustainability_score || 0, weight: "20%", color: "text-gray-800", bar: "bg-gray-800" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 border-b border-gray-50 pb-4">
                <div className="w-1/3 text-sm font-bold text-gray-600">{item.label}</div>
                <div className="w-16 text-xs text-gray-400 font-bold">{item.weight}</div>
                <div className={`w-12 text-lg font-black ${item.color}`}>{item.score}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className={`${item.bar} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= SECTION 2: AI STRENGTHS ================= */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-[#10B981] px-8 py-5 flex items-center gap-3 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="font-bold text-xl tracking-wide">Key Strengths Identified</h3>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {strengths.length > 0 ? (
              strengths.map((strength, i) => (
                <div key={i} className="bg-white border-2 border-green-100 p-6 rounded-2xl shadow-sm flex items-start gap-4 transition hover:border-green-300">
                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 bg-green-50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800 text-lg mb-1">{strength.title}</h4>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">{strength.desc}</p>
                    </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-6 bg-gray-50 border-2 border-dashed border-gray-200 text-gray-500 text-center rounded-2xl font-medium">
                Generating strengths...
              </div>
            )}
          </div>
        </div>

        {/* ================= SECTION 3: RECOMMENDATIONS ================= */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-5 flex items-center gap-3 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            <h3 className="font-bold text-xl tracking-wide">AI-Generated Recommendations</h3>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Priority Actions (RED) */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                 <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 <h4 className="text-red-500 font-black uppercase tracking-wider text-sm">Priority Action Items</h4>
              </div>
              
              {actions.length > 0 ? (
                <div className="space-y-4">
                  {actions.map((item, i) => (
                    <div key={i} className="bg-red-50/50 border-l-4 border-l-red-500 border border-red-100 p-5 rounded-r-2xl rounded-l-sm flex gap-4 shadow-sm transition hover:bg-red-50">
                      <span className="font-black text-red-500 text-lg">{i + 1}.</span>
                      <span className="text-gray-700 text-sm font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-200 text-gray-500 text-center rounded-2xl font-medium text-sm">Waiting for data...</div>
              )}
            </div>

            {/* Strategic Opportunities (BLUE) */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                 <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 <h4 className="text-blue-500 font-black uppercase tracking-wider text-sm">Strategic Opportunities</h4>
              </div>

              {opportunities.length > 0 ? (
                <div className="space-y-4">
                  {opportunities.map((item, i) => (
                    <div key={i} className="bg-blue-50/50 border-l-4 border-l-blue-500 border border-blue-100 p-5 rounded-r-2xl rounded-l-sm flex gap-4 shadow-sm transition hover:bg-blue-50">
                      <span className="font-black text-blue-500 text-lg">{i + 1}.</span>
                      <span className="text-gray-700 text-sm font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-200 text-gray-500 text-center rounded-2xl font-medium text-sm">Waiting for data...</div>
              )}
            </div>
          </div>
        </div>

      </main>
      {/* ================= SECTION 4: SCORE DISTRIBUTION CHART ================= */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8 p-8 max-w-5xl mx-auto">
          <h3 className="font-bold text-lg text-center text-gray-800 mb-8">Score Distribution Chart</h3>
          
          <div className="relative h-64 mt-4 mb-8 max-w-4xl mx-auto">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[100, 75, 50, 25, 0].map(val => (
                <div key={val} className="border-b border-dashed border-gray-200 w-full flex items-center h-0 relative">
                  <span className="absolute -left-6 text-[10px] font-bold text-gray-400 bg-white pr-2">{val}</span>
                </div>
              ))}
            </div>

            {/* Render Bars */}
            <div className="absolute inset-0 flex justify-around items-end px-8">
              {[
                { label: "Technical Readiness", score: evaluation.technical_readiness_score || 0 },
                { label: "Business Viability", score: evaluation.business_viability_score || 0 },
                { label: "Innovation Index", score: evaluation.innovation_index_score || 0 },
                { label: "Financial Sustainability", score: evaluation.financial_sustainability_score || 0 },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center w-1/5 group z-10 h-full justify-end">
                  {/* The Bar */}
                  <div 
                    className="w-full rounded-t-md shadow-sm transition-all duration-1000 relative"
                    style={{ 
                      height: `${item.score}%`, 
                      background: 'linear-gradient(to top, #8B5CF6, #3B82F6)' // Purple to Blue gradient
                    }}
                  >
                    {/* Hover Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded-md transition-opacity">
                      {item.score}
                    </div>
                  </div>
                  {/* Label below bar */}
                  <span className="text-[11px] font-bold text-gray-500 mt-4 -rotate-12 whitespace-nowrap">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= SECTION 5: MARKET GROWTH PROJECTION ================= */}
        {(() => {
          const baseScore = Math.max(10, Math.floor(evaluation.overall_viability_score * 0.6));
          const yr3Score = Math.min(95, Math.floor(evaluation.overall_viability_score * 0.9));
          const yr5Score = Math.min(100, Math.floor(evaluation.overall_viability_score * 1.15));
          
          const growth3 = Math.round(((yr3Score - baseScore) / baseScore) * 100);
          const growth5 = Math.round(((yr5Score - baseScore) / baseScore) * 100);

          return (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-12 max-w-5xl mx-auto">
              <div className="bg-[#10B981] px-8 py-4 flex items-center gap-3 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                <h3 className="font-bold text-xl tracking-wide">Market Growth Projection</h3>
              </div>
              
              <div className="p-8">
                {/* Line Chart Area */}
                <div className="bg-green-50/30 rounded-2xl p-6 border border-green-100 relative h-64 mb-6">
                   <div className="absolute inset-y-6 left-12 right-6 flex flex-col justify-between pointer-events-none">
                      {[100, 75, 50, 25, 0].map(val => (
                        <div key={val} className="border-b border-dashed border-green-200/50 w-full relative h-0">
                          <span className="absolute -left-8 -top-2 text-[10px] font-bold text-gray-400">{val}</span>
                        </div>
                      ))}
                   </div>
                   
                   <div className="absolute bottom-2 left-12 right-6 flex justify-between text-[11px] font-bold text-gray-500">
                      <span>Now</span>
                      <span>3 Yrs</span>
                      <span>5 Yrs</span>
                   </div>

                   <svg className="absolute inset-y-6 left-12 right-6 w-[calc(100%-4.5rem)] h-[calc(100%-3rem)] overflow-visible">
                      <line x1="0%" y1={`${100 - baseScore}%`} x2="50%" y2={`${100 - yr3Score}%`} stroke="#10B981" strokeWidth="4" className="drop-shadow-sm transition-all duration-1000" />
                      <line x1="50%" y1={`${100 - yr3Score}%`} x2="100%" y2={`${100 - yr5Score}%`} stroke="#10B981" strokeWidth="4" className="drop-shadow-sm transition-all duration-1000" />
                      
                      <circle cx="0%" cy={`${100 - baseScore}%`} r="7" fill="#10B981" className="drop-shadow-md transition-all duration-1000" />
                      <circle cx="50%" cy={`${100 - yr3Score}%`} r="7" fill="#10B981" className="drop-shadow-md transition-all duration-1000" />
                      <circle cx="100%" cy={`${100 - yr5Score}%`} r="7" fill="#10B981" className="drop-shadow-md transition-all duration-1000" />
                      
                      <circle cx="0%" cy={`${100 - baseScore}%`} r="3" fill="#ffffff" className="transition-all duration-1000" />
                      <circle cx="50%" cy={`${100 - yr3Score}%`} r="3" fill="#ffffff" className="transition-all duration-1000" />
                      <circle cx="100%" cy={`${100 - yr5Score}%`} r="3" fill="#ffffff" className="transition-all duration-1000" />
                   </svg>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-center">
                    <p className="text-xs font-bold text-gray-500 mb-1">Current Market</p>
                    <h4 className="text-3xl font-black text-gray-900">{baseScore}</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Market Index Score</p>
                  </div>
                  
                  <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-6 text-center">
                    <p className="text-xs font-bold text-gray-500 mb-1">3-Year Projection</p>
                    <h4 className="text-3xl font-black text-purple-600">+{growth3}%</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Growth Rate</p>
                  </div>
                  
                  <div className="bg-green-50/50 border border-green-100 rounded-xl p-6 text-center">
                    <p className="text-xs font-bold text-gray-500 mb-1">5-Year Projection</p>
                    <h4 className="text-3xl font-black text-green-600">+{growth5}%</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Total Growth</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}