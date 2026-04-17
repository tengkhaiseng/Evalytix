"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- THE BRIDGE TO RENDER ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://evalytix-api.onrender.com";

export default function EvaluatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [startupName, setStartupName] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState("Pre-Launch");
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // --- LOADING ANIMATION TIMER ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : 3));
      }, 2000); // Advances the checklist every 2 seconds
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleNextStep = (selectedMode: string) => {
    setMode(selectedMode);
    setStep(2);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // FIXED: Added /extract-pdf/ to the end of the URL
      const response = await fetch(`${API_URL}/extract-pdf/`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.status === "Success") {
        setExtractedText((prev) => prev + "\n\n[Extracted from PDF]:\n" + data.full_text);
        alert("PDF Extracted Successfully!");
      } else {
        alert("Failed to read PDF.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to PDF extractor.");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleEvaluate = async () => {
    setLoading(true);

    // --- NEW SAFEGUARD: Check if the user is logged in! ---
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("Please log in or sign up first to evaluate a startup!");
      setLoading(false);
      return; // This stops the code from proceeding and crashing the backend!
    }
    // ------------------------------------------------------

    try {
      let finalData = extractedText;
      if (mode === "Post-Launch" && url) {
        finalData += `\n\nCompany Website: ${url}`;
      }

      // FIXED: Added /evaluate/ to the end of the URL
      const response = await fetch(`${API_URL}/evaluate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startup_name: startupName || "Unnamed Startup",
          extracted_text: finalData,
          evaluation_mode: mode,
          user_email: userEmail, // Sending the email safely to the backend!
        }),
      });

      const data = await response.json();
      if (data.status === "Success") {
        router.push(`/report/${data.id}`);
      } else {
        alert("Evaluation failed: " + (data.detail || data.error || "Unknown error"));
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to AI service.");
      setLoading(false);
    }
  };

  // ==========================================
  //         AI LOADING SCREEN UI
  // ==========================================
  if (loading) {
    const steps = [
      "Extracting text & context...",
      "Analyzing Market Size...",
      "Calculating Risk Score...",
      "Generating Strategic Recommendations..."
    ];

    return (
      <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6 font-sans">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-12 animate-in fade-in zoom-in duration-500">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
              AI Analysis in Progress
            </h2>
            <p className="text-gray-500 font-medium">Processing your data with advanced machine learning algorithms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* LEFT SIDE: Mock Code Editor */}
            <div className="bg-[#1E2330] rounded-2xl p-6 shadow-inner text-sm font-mono overflow-hidden relative group">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-gray-300 space-y-2 opacity-90">
                <p><span className="text-blue-400">import</span> numpy <span className="text-blue-400">as</span> np</p>
                <p><span className="text-blue-400">from</span> sklearn.model <span className="text-blue-400">import</span> predict</p>
                <br/>
                <p><span className="text-purple-400">def</span> <span className="text-green-400">analyze_startup</span>(data):</p>
                <p className="pl-4">market_size = calculate_tam(data)</p>
                <p className="pl-4 text-red-300">risk_score = assess_risk(data)</p>
                <p className="pl-4 text-green-300">viability = evaluate_business(data)</p>
                <br/>
                <p className="pl-4"><span className="text-blue-400">return</span> generate_report(</p>
                <p className="pl-8">market_size,</p>
                <p className="pl-8">risk_score,</p>
                <p className="pl-8">recommendations</p>
                <p className="pl-4">)</p>
              </div>
              {/* Scanning laser effect overlay */}
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[ping_2s_ease-in-out_infinite]"></div>
            </div>

            {/* RIGHT SIDE: Dynamic Progress Checklist */}
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                 {/* Glowing Brain Icon */}
                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-200 animate-pulse">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                 </div>
              </div>

              {steps.map((text, idx) => {
                const isComplete = idx < loadingStep;
                const isActive = idx === loadingStep;
                
                return (
                  <div key={idx} className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all duration-500 ${
                    isComplete ? "bg-green-50 border-green-200 text-green-700" : 
                    isActive ? "bg-blue-50 border-blue-400 text-blue-700 shadow-sm" : 
                    "bg-gray-50 border-gray-100 text-gray-400"
                  }`}>
                    {isComplete ? (
                       <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : isActive ? (
                       <div className="w-5 h-5 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0 ml-0.5"></div>
                    ) : (
                       <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0 ml-0.5"></div>
                    )}
                    <span className="font-bold text-sm">{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  //         STANDARD FORM UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans pb-20">
      <header className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-black text-[#6366F1] tracking-tighter italic">EVALYTIX</h1>
        <Link href="/" className="font-bold text-gray-500 hover:text-gray-900 transition text-sm">Dashboard</Link>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {step === 1 ? (
          <div className="text-center space-y-12 py-10">
            <div className="space-y-4">
              <span className="bg-[#6366F1] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Powered by Advanced AI Technology</span>
              <h2 className="text-5xl font-black text-gray-900">EVALYTIX</h2>
              <p className="text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
                Get comprehensive, data-driven analysis of your startup idea or business using our advanced AI evaluation frameworks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col items-center space-y-6">
                <div className="w-20 h-20 bg-orange-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-100">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Pre-Launch Idea</h3>
                <button onClick={() => handleNextStep("Pre-Launch")} className="w-full py-3 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md">Upload an Idea</button>
              </div>

              <div className="bg-white p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col items-center space-y-6">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-100">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Post-Launch Business</h3>
                <button onClick={() => handleNextStep("Post-Launch")} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition shadow-md">Enter Website URL</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-10">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center gap-3 text-white">
                   <span className="text-2xl">📝</span>
                   <div>
                     <h2 className="font-bold text-lg">Input Your Startup Data</h2>
                     <p className="text-xs opacity-80">{mode === "Pre-Launch" ? "Provide information about your startup idea" : "Provide information about your active business"}</p>
                   </div>
                </div>

                <div className="p-8 space-y-6">
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700 flex items-center gap-2">🏢 Startup / Business Name</label>
                     <input 
                        type="text" 
                        value={startupName}
                        onChange={(e) => setStartupName(e.target.value)}
                        placeholder="e.g. Evalytix Tech"
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition text-sm font-medium"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700 flex items-center gap-2">💬 Describe your Business Concept</label>
                     <textarea 
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                        placeholder="Tell us about your startup idea, target market, unique value proposition..."
                        className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition resize-none text-sm font-medium"
                     />
                     <p className="text-[10px] text-gray-400">Provide as much detail as possible for a more accurate evaluation</p>
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700 flex items-center gap-2">📄 Upload Business Plan (PDF)</label>
                     <input 
                        type="file" 
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handlePdfUpload}
                        className="hidden" 
                     />
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 hover:border-blue-300 transition cursor-pointer group"
                      >
                        {uploadingPdf ? (
                           <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                        ) : (
                           <svg className="w-10 h-10 text-gray-300 group-hover:text-blue-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        )}
                        <p className="text-xs text-gray-400 mt-2 font-medium">{uploadingPdf ? "Reading PDF..." : "Click here to browse for your PDF"}</p>
                     </div>
                   </div>

                   {mode === "Post-Launch" && (
                     <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                       <label className="text-sm font-bold text-gray-700 flex items-center gap-2">🌐 Company Website URL</label>
                       <input 
                          type="text" 
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-blue-100"
                       />
                       <p className="text-[10px] text-gray-400">We&apos;ll analyze your website for additional insights</p>
                     </div>
                   )}

                   <button 
                     onClick={handleEvaluate}
                     disabled={loading || uploadingPdf || !startupName}
                     className={`w-full mt-4 py-4 rounded-xl font-black text-white shadow-lg transition flex items-center justify-center gap-2 ${loading || uploadingPdf || !startupName ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#50E3C2] hover:bg-[#3ec8a9]'}`}
                   >
                     🚀 Generate AI Evaluation Report
                   </button>

                   <button onClick={() => setStep(1)} className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition pt-2">Back to Selection</button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}