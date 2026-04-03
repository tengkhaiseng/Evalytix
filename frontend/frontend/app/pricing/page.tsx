export default function Pricing() {
  return (
    <main className="min-h-screen p-10 flex flex-col items-center">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-500">Scale your startup analysis with our flexible pricing.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-6xl w-full items-center justify-center">
        
        {/* STARTER TIER */}
        <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Starter</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Free</h2>
          <p className="text-gray-500 mb-8">For Students / Early Founders</p>
          <button className="w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-lg mb-8 hover:bg-gray-50 transition-colors">
            Current Plan
          </button>
          <ul className="space-y-4 text-gray-600 text-sm">
            <li className="flex items-center gap-3"><span>✓</span> 1 Evaluation per month</li>
            <li className="flex items-center gap-3"><span>✓</span> Basic score only</li>
            <li className="flex items-center gap-3"><span>✓</span> Standard Processing Speed</li>
          </ul>
        </div>

        {/* PREMIUM TIER (Highlighted) */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl border-2 border-blue-600 w-full max-w-sm relative transform md:-translate-y-4">
          <div className="bg-blue-600 text-white text-center py-2 text-sm font-bold uppercase tracking-widest rounded-t-xl">
            Most Popular
          </div>
          <div className="p-8">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Premium</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">RM 30<span className="text-lg text-gray-500 font-medium">/mo</span></h2>
            <p className="text-gray-500 mb-8">For Serious Founders / Angels</p>
            <button className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg mb-8 hover:bg-blue-700 transition-colors shadow-md">
              Upgrade Now
            </button>
            <ul className="space-y-4 text-gray-600 text-sm font-medium">
              <li className="flex items-center gap-3"><span className="text-blue-600">✓</span> 10 Evaluations per month</li>
              <li className="flex items-center gap-3"><span className="text-blue-600">✓</span> Full Deep-Dive Report</li>
              <li className="flex items-center gap-3"><span className="text-blue-600">✓</span> Downloadable PDF Reports</li>
            </ul>
          </div>
        </div>

        {/* ULTRA TIER */}
        <div className="flex-1 bg-gray-900 text-white p-8 rounded-2xl shadow-lg border border-gray-800 w-full max-w-sm">
          <p className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-2">Ultra</p>
          <h2 className="text-4xl font-extrabold mb-2">RM 150<span className="text-lg text-gray-400 font-medium">/mo</span></h2>
          <p className="text-gray-400 mb-8">For VC Firms / Accelerators</p>
          <button className="w-full py-3 px-4 bg-yellow-500 text-gray-900 font-bold rounded-lg mb-8 hover:bg-yellow-400 transition-colors shadow-md">
            Contact Sales
          </button>
          <ul className="space-y-4 text-gray-300 text-sm">
            <li className="flex items-center gap-3"><span className="text-yellow-500">✓</span> Unlimited Evaluations</li>
            <li className="flex items-center gap-3"><span className="text-yellow-500">✓</span> Priority API Access</li>
            <li className="flex items-center gap-3"><span className="text-yellow-500">✓</span> Bulk Upload Analysis</li>
            <li className="flex items-center gap-3"><span className="text-yellow-500">✓</span> 24/7 Priority Support</li>
          </ul>
        </div>

      </div>
    </main>
  );
}