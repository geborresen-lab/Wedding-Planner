import React, { useState, useEffect } from 'react';
import { Download, Print, Plus, X, Check, AlertCircle, Heart, Calendar, Users, Settings, Share2, Zap, TrendingUp, Eye, MessageCircle } from 'lucide-react';

export default function WeddingPlanner() {
  const [data, setData] = useState({
    couple: { name: '', partnerName: '', email: '', weddingDate: '', budget: 0, guestCount: 0, currency: '$', location: '', theme: '' },
    budget: {
      Venue: { allocated: 4500, spent: 0, category: 'Venue' },
      Catering: { allocated: 8500, spent: 0, category: 'Catering' },
      Photography: { allocated: 2500, spent: 0, category: 'Photography' },
      Florals: { allocated: 3000, spent: 0, category: 'Florals' },
      Music: { allocated: 1200, spent: 0, category: 'Music/DJ' },
      Rentals: { allocated: 800, spent: 0, category: 'Rentals' },
      Attire: { allocated: 600, spent: 0, category: 'Attire' },
      HairMakeup: { allocated: 300, spent: 0, category: 'Hair/Makeup' },
      Invitations: { allocated: 400, spent: 0, category: 'Invitations' },
      Decorations: { allocated: 1500, spent: 0, category: 'Decorations' },
      Transportation: { allocated: 400, spent: 0, category: 'Transportation' },
      Miscellaneous: { allocated: 1700, spent: 0, category: 'Miscellaneous' }
    },
    vendors: [],
    vision: { vibe: '', colors: [], mustHaves: '', avoids: '', keywords: [], partnerVibe: '', partnerColors: [], partnerKeywords: [], alignment: 'pending' },
    timeline: [],
    checklist: [],
    guestList: [],
    seating: [],
    moodboard: [],
    registry: [],
    accommodations: [],
    honeymoon: { destination: '', dates: '', notes: '' },
    wedding_party: [],
    music: { songs: [], dj_timeline: '' },
    attire_details: [],
    decor_plans: [],
    floralPlans: [],
    invoices: [],
    partner_share: { code: '', access_level: 'view' },
    notes: []
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupData, setSetupData] = useState({});
  const [searchVendor, setSearchVendor] = useState('');
  const [partnerVisionStep, setPartnerVisionStep] = useState(0);
  const [showPartnerSetup, setShowPartnerSetup] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('weddingPlannerData');
    if (saved) {
      const parsedData = JSON.parse(saved);
      setData(parsedData);
      setIsSetupComplete(true);
      setOnboardingStep(99);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem('weddingPlannerData', JSON.stringify(data));
    }
  }, [data, isSetupComplete]);

  // ONBOARDING FLOW
  const handleOnboardingNext = () => {
    if (onboardingStep === 0) {
      // Welcome screen
      setOnboardingStep(1);
    } else if (onboardingStep === 1) {
      // Basic setup
      if (setupData.name && setupData.weddingDate && setupData.budget) {
        setData(prev => ({
          ...prev,
          couple: { ...setupData, currency: setupData.currency || '$' }
        }));
        setOnboardingStep(2);
      }
    } else if (onboardingStep === 2) {
      // Your aesthetic
      setOnboardingStep(3);
    } else if (onboardingStep === 3) {
      // Partner setup
      setOnboardingStep(4);
    } else if (onboardingStep === 4) {
      // Complete
      setIsSetupComplete(true);
      setOnboardingStep(99);
    }
  };

  // AESTHETIC MATCHING ALGORITHM
  const calculateAestheticMatch = (vendorVibe, vendorKeywords) => {
    let matchScore = 0;
    const yourKeywords = data.vision.keywords || [];
    
    // Match keywords
    const matchedKeywords = vendorKeywords.filter(k => yourKeywords.includes(k));
    matchScore += matchedKeywords.length * 15;
    
    // Color match (simplified)
    matchScore = Math.min(100, matchScore + 20);
    
    return matchScore;
  };

  // PARTNER ALIGNMENT
  const checkPartnerAlignment = () => {
    if (!data.vision.partnerVibe) return null;
    
    const yourKeywords = data.vision.keywords || [];
    const partnerKeywords = data.vision.partnerKeywords || [];
    
    const overlap = yourKeywords.filter(k => partnerKeywords.includes(k));
    const overlapPercent = overlap.length > 0 ? Math.round((overlap.length / Math.max(yourKeywords.length, partnerKeywords.length)) * 100) : 0;
    
    return {
      overlap: overlap,
      overlapPercent: overlapPercent,
      status: overlapPercent >= 70 ? 'aligned' : overlapPercent >= 40 ? 'partial' : 'conflicted'
    };
  };

  const addVendor = (category, name, amount, notes = '', aestheticScore = 100) => {
    const vendor = { 
      id: Date.now(), 
      category, 
      name, 
      amount: parseFloat(amount) || 0, 
      notes, 
      aestheticScore,
      status: 'pending', 
      date: new Date().toISOString().split('T')[0],
      contactInfo: '',
      portfolio: ''
    };
    setData(prev => ({
      ...prev,
      vendors: [...prev.vendors, vendor],
      budget: {
        ...prev.budget,
        [category]: { ...prev.budget[category], spent: prev.budget[category].spent + vendor.amount }
      }
    }));
  };

  const removeVendor = (id) => {
    const vendor = data.vendors.find(v => v.id === id);
    if (vendor) {
      setData(prev => ({
        ...prev,
        vendors: prev.vendors.filter(v => v.id !== id),
        budget: {
          ...prev.budget,
          [vendor.category]: { ...prev.budget[vendor.category], spent: prev.budget[vendor.category].spent - vendor.amount }
        }
      }));
    }
  };

  const updateVendorStatus = (id, status) => {
    setData(prev => ({
      ...prev,
      vendors: prev.vendors.map(v => v.id === id ? { ...v, status } : v)
    }));
  };

  const addMilestone = (text, date, urgency) => {
    setData(prev => ({
      ...prev,
      timeline: [...prev.timeline, { id: Date.now(), text, date, urgency }]
    }));
  };

  const addChecklistItem = (task, category = 'General') => {
    setData(prev => ({
      ...prev,
      checklist: [...prev.checklist, { id: Date.now(), task, category, completed: false }]
    }));
  };

  const toggleChecklistItem = (id) => {
    setData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    }));
  };

  const addGuest = (name, email, rsvp = 'pending', mealChoice = '', plusOne = false) => {
    setData(prev => ({
      ...prev,
      guestList: [...prev.guestList, { id: Date.now(), name, email, rsvp, mealChoice, plusOne }]
    }));
  };

  const updateVision = (vibe, colors, mustHaves, avoids, keywords = []) => {
    setData(prev => ({
      ...prev,
      vision: { ...prev.vision, vibe, colors, mustHaves, avoids, keywords }
    }));
  };

  const addFloralItem = (type, description, location, budget, quantity = 1) => {
    setData(prev => ({
      ...prev,
      floralPlans: [...prev.floralPlans, { id: Date.now(), type, description, location, budget: parseFloat(budget) || 0, quantity }]
    }));
  };

  const addDecorItem = (name, location, description, budget, status = 'planning') => {
    setData(prev => ({
      ...prev,
      decor_plans: [...prev.decor_plans, { id: Date.now(), name, location, description, budget: parseFloat(budget) || 0, status }]
    }));
  };

  const addMusicTrack = (title, artist, purpose = 'ceremony') => {
    setData(prev => ({
      ...prev,
      music: { ...prev.music, songs: [...prev.music.songs, { id: Date.now(), title, artist, purpose }] }
    }));
  };

  const addNote = (content, category = 'general') => {
    setData(prev => ({
      ...prev,
      notes: [...prev.notes, { id: Date.now(), content, category, date: new Date().toISOString() }]
    }));
  };

  // Calculations
  const calculateBudgetStats = () => {
    let totalAllocated = 0;
    let totalSpent = 0;
    Object.values(data.budget).forEach(cat => {
      totalAllocated += cat.allocated;
      totalSpent += cat.spent;
    });
    return { totalAllocated, totalSpent, remaining: data.couple.budget - totalSpent, percentUsed: Math.round((totalSpent / data.couple.budget) * 100) };
  };

  const calculateDaysUntil = () => {
    if (!data.couple.weddingDate) return 0;
    const diff = new Date(data.couple.weddingDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateGuestStats = () => {
    const confirmed = data.guestList.filter(g => g.rsvp === 'confirmed').length;
    const pending = data.guestList.filter(g => g.rsvp === 'pending').length;
    const declined = data.guestList.filter(g => g.rsvp === 'declined').length;
    return { confirmed, pending, declined, total: data.guestList.length };
  };

  const getChecklistProgress = () => {
    if (data.checklist.length === 0) return 0;
    return Math.round((data.checklist.filter(item => item.completed).length / data.checklist.length) * 100);
  };

  const getUrgentTasks = () => {
    return data.timeline
      .filter(t => t.urgency === 'urgent' && new Date(t.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  };

  const getOverBudgetCategories = () => {
    return Object.entries(data.budget)
      .filter(([key, cat]) => cat.spent > cat.allocated)
      .map(([key, cat]) => ({ key, ...cat }));
  };

  // Export functions
  const exportToJSON = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `wedding-plan-${data.couple.name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateVendorBrief = () => {
    let content = `WEDDING VENDOR BRIEF\n`;
    content += `${data.couple.name || 'Our Wedding'}\n`;
    content += `Date: ${data.couple.weddingDate}\n`;
    content += `Location: ${data.couple.location}\n\n`;
    
    content += `OUR VISION:\n`;
    content += `Style: ${data.vision.vibe}\n`;
    content += `Key Elements: ${data.vision.mustHaves}\n`;
    content += `Colors: ${data.vision.colors.join(', ')}\n`;
    content += `What We Avoid: ${data.vision.avoids}\n\n`;
    
    content += `VENDORS:\n`;
    data.vendors.forEach(v => {
      content += `${v.category}: ${v.name}\nBudget: ${data.couple.currency}${v.amount}\nNotes: ${v.notes}\n\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `vendor-brief-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const partnerAlignment = checkPartnerAlignment();
  const stats = calculateBudgetStats();
  const daysUntil = calculateDaysUntil();
  const guestStats = calculateGuestStats();
  const checklistProgress = getChecklistProgress();
  const urgentTasks = getUrgentTasks();
  const overBudgetCats = getOverBudgetCategories();

  // ONBOARDING SCREENS
  if (!isSetupComplete && onboardingStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">💒</div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3">Wedding Planner OS</h1>
            <p className="text-xl text-gray-600">The only planner built for DIY couples who want creative control & budget clarity</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard icon="💰" title="Smart Budget" desc="See what every choice costs" />
              <FeatureCard icon="✨" title="Vision Mapper" desc="Turn Pinterest into a plan" />
              <FeatureCard icon="🤝" title="Partner Aligned" desc="Decide together, not apart" />
              <FeatureCard icon="💒" title="Vendor Tracking" desc="Compare & book with confidence" />
            </div>
          </div>

          <button onClick={() => setOnboardingStep(1)} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-4 text-lg rounded-xl hover:shadow-lg transition transform hover:scale-105">
            Let's Plan Your Wedding 💕
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">All data stays on YOUR computer. No login. No tracking. Forever yours.</p>
        </div>
      </div>
    );
  }

  if (!isSetupComplete && onboardingStep === 1) {
    return (
      <OnboardingSetup 
        onNext={handleOnboardingNext} 
        setupData={setupData} 
        setSetupData={setSetupData}
        step={1}
      />
    );
  }

  if (!isSetupComplete && onboardingStep === 2) {
    return (
      <OnboardingVision 
        onNext={handleOnboardingNext} 
        updateVision={updateVision}
        vision={data.vision}
        step={2}
      />
    );
  }

  if (!isSetupComplete && onboardingStep === 3) {
    return (
      <OnboardingPartner 
        onNext={handleOnboardingNext} 
        step={3}
      />
    );
  }

  if (!isSetupComplete && onboardingStep === 4) {
    return (
      <OnboardingComplete 
        onNext={handleOnboardingNext} 
        couple={data.couple}
      />
    );
  }

  // MAIN APP
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-purple-50">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-rose-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💒</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Wedding OS</h1>
                <p className="text-xs text-gray-600">{data.couple.name}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setShowPartnerSetup(true)} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:shadow-lg transition flex items-center gap-2 text-sm">
                <Share2 size={16} /> Share
              </button>
              <button onClick={exportToJSON} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm">
                <Download size={16} /> Export
              </button>
              <button onClick={() => window.print()} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm">
                <Print size={16} /> Print
              </button>
              <button onClick={() => setOnboardingStep(1)} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm">
                <Settings size={16} /> Setup
              </button>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <StatCard value={daysUntil > 0 ? `${daysUntil}d` : 'Soon!'} label="Until Wedding" color="rose" />
            <StatCard value={`${stats.percentUsed}%`} label="Budget Used" color="orange" />
            <StatCard value={guestStats.confirmed} label="Guests RSVP'd" color="green" />
            <StatCard value={`${checklistProgress}%`} label="Progress" color="purple" />
            <StatCard value={urgentTasks.length} label="Urgent Tasks" color="red" />
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className="bg-white/80 backdrop-blur border-b border-rose-100 sticky top-24 z-40">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'budget', label: 'Budget', icon: '💰' },
            { id: 'vision', label: 'Vision', icon: '✨' },
            { id: 'vendors', label: 'Vendors', icon: '💒' },
            { id: 'timeline', label: 'Timeline', icon: '📅' },
            { id: 'guests', label: 'Guests', icon: '👥' },
            { id: 'checklist', label: 'Checklist', icon: '✅' },
            { id: 'details', label: 'Details', icon: '📋' },
            { id: 'notes', label: 'Notes', icon: '📝' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 transition text-sm ${
                activeTab === tab.id ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-600 hover:text-rose-600'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-4">

        {/* ALERTS */}
        {overBudgetCats.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-600 p-4 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-red-800">Budget Alert!</p>
              <p className="text-red-700 text-sm">{overBudgetCats.map(c => c.category).join(', ')} are over budget. Review your spending!</p>
            </div>
          </div>
        )}

        {/* PARTNER ALIGNMENT ALERT */}
        {partnerAlignment && partnerAlignment.status === 'conflicted' && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-600 p-4 rounded-lg flex gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-yellow-800">Vision Mismatch</p>
              <p className="text-yellow-700 text-sm">You and your partner have different aesthetics. Time to find compromises!</p>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BUDGET HEALTH */}
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">💰 Budget Health</h2>
                  <TrendingUp className="text-rose-600" size={24} />
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                      <p className="text-2xl font-bold text-orange-700">{data.couple.currency}{stats.totalSpent}</p>
                      <p className="text-xs text-orange-600 font-semibold">SPENT</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                      <p className="text-2xl font-bold text-green-700">{data.couple.currency}{stats.remaining}</p>
                      <p className="text-xs text-green-600 font-semibold">REMAINING</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                      <p className="text-2xl font-bold text-blue-700">{data.couple.currency}{data.couple.budget}</p>
                      <p className="text-xs text-blue-600 font-semibold">TOTAL</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-700">Budget Allocation</span>
                      <span className="font-bold text-rose-600">{stats.percentUsed}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${stats.percentUsed > 100 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-rose-500 to-pink-500'}`} style={{ width: `${Math.min(stats.percentUsed, 100)}%` }}></div>
                    </div>
                  </div>

                  <p className={`text-sm font-semibold ${stats.percentUsed > 100 ? 'text-red-600' : stats.percentUsed > 85 ? 'text-orange-600' : 'text-green-600'}`}>
                    {stats.percentUsed > 100 ? '🔴 Over Budget - Time to cut!' : stats.percentUsed > 85 ? '🟡 Getting close - Watch spending' : '🟢 Healthy - Room to splurge'}
                  </p>
                </div>
              </div>

              {/* URGENT TASKS */}
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">⚡ Urgent Decisions</h2>
                  <Zap className="text-orange-600" size={24} />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {urgentTasks.length > 0 ? (
                    urgentTasks.map(task => (
                      <div key={task.id} className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-600 p-3 rounded-lg">
                        <p className="font-bold text-gray-900">{task.text}</p>
                        <p className="text-xs text-gray-600">{task.date}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">No urgent tasks right now! 🎉</p>
                  )}
                </div>
              </div>
            </div>

            {/* VENDOR STATUS */}
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💒 Vendor Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <VendorStatusCard title="Total Vendors" count={data.vendors.length} color="blue" />
                <VendorStatusCard title="Booked" count={data.vendors.filter(v => v.status === 'booked').length} color="green" />
                <VendorStatusCard title="Pending Quotes" count={data.vendors.filter(v => v.status === 'pending').length} color="yellow" />
                <VendorStatusCard title="Declined" count={data.vendors.filter(v => v.status === 'declined').length} color="red" />
              </div>
            </div>

            {/* VISION & PARTNER ALIGNMENT */}
            {data.vision.vibe && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">✨ Your Aesthetic</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">Vibe</p>
                      <p className="text-lg font-bold text-rose-600">{data.vision.vibe}</p>
                    </div>
                    
                    {data.vision.colors.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-2">Colors</p>
                        <div className="flex gap-2 flex-wrap">
                          {data.vision.colors.map((color, i) => (
                            <div key={i} className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm" style={{ backgroundColor: color }}></div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.vision.keywords.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-2">Key Elements</p>
                        <div className="flex flex-wrap gap-2">
                          {data.vision.keywords.map((keyword, i) => (
                            <span key={i} className="bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-xs font-semibold">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {partnerAlignment && (
                  <div className={`bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition border-2 ${partnerAlignment.status === 'aligned' ? 'border-green-200' : partnerAlignment.status === 'partial' ? 'border-yellow-200' : 'border-red-200'}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">🤝 Partner Alignment</h3>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className={`text-4xl font-bold mb-1 ${partnerAlignment.status === 'aligned' ? 'text-green-600' : partnerAlignment.status === 'partial' ? 'text-yellow-600' : 'text-red-600'}`}>
                          {partnerAlignment.overlapPercent}%
                        </div>
                        <p className="text-sm text-gray-600">Aesthetic Overlap</p>
                      </div>

                      <div className={`p-3 rounded-lg text-center font-bold text-sm ${partnerAlignment.status === 'aligned' ? 'bg-green-100 text-green-800' : partnerAlignment.status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {partnerAlignment.status === 'aligned' ? '✅ You\'re on the same page!' : partnerAlignment.status === 'partial' ? '⚠️ Some overlap, need to discuss' : '❌ Very different visions - talk it out!'}
                      </div>

                      {partnerAlignment.overlap.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-2">Shared Elements</p>
                          <div className="flex flex-wrap gap-2">
                            {partnerAlignment.overlap.map((element, i) => (
                              <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                                {element}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GUEST PROGRESS */}
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-gray-900 mb-4">👥 Guest RSVP Status</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-700">{guestStats.confirmed}</p>
                  <p className="text-xs text-blue-600 font-semibold">Confirmed</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-700">{guestStats.pending}</p>
                  <p className="text-xs text-yellow-600 font-semibold">Pending</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-700">{guestStats.declined}</p>
                  <p className="text-xs text-red-600 font-semibold">Declined</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BUDGET TAB */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 Budget Breakdown</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-rose-50 to-pink-50">
                    <tr>
                      <th className="text-left p-3 font-bold text-gray-900">Category</th>
                      <th className="text-right p-3 font-bold text-gray-900">Allocated</th>
                      <th className="text-right p-3 font-bold text-gray-900">Spent</th>
                      <th className="text-right p-3 font-bold text-gray-900">Remaining</th>
                      <th className="text-center p-3 font-bold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.budget).map(([key, category]) => {
                      const spent = category.spent;
                      const allocated = category.allocated;
                      const remaining = allocated - spent;
                      const isOver = remaining < 0;
                      
                      return (
                        <tr key={key} className="border-t hover:bg-rose-50 transition">
                          <td className="p-3 font-semibold text-gray-900">{category.category}</td>
                          <td className="text-right p-3">{data.couple.currency}{allocated}</td>
                          <td className="text-right p-3 font-semibold text-orange-600">{data.couple.currency}{spent}</td>
                          <td className={`text-right p-3 font-semibold ${isOver ? 'text-red-600' : 'text-green-600'}`}>{data.couple.currency}{remaining}</td>
                          <td className="text-center p-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isOver ? 'bg-red-100 text-red-700' : remaining < 100 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                              {isOver ? '🔴 Over' : remaining < 100 ? '🟡 Low' : '🟢 OK'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-600 font-semibold text-sm">Total Allocated</p>
                    <p className="text-2xl font-bold text-rose-600">{data.couple.currency}{stats.totalAllocated}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold text-sm">Total Spent</p>
                    <p className="text-2xl font-bold text-orange-600">{data.couple.currency}{stats.totalSpent}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold text-sm">Total Remaining</p>
                    <p className="text-2xl font-bold text-green-600">{data.couple.currency}{stats.remaining}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ADD VENDOR */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">➕ Log Vendor Quote</h3>
              <VendorQuoteForm onAdd={addVendor} categories={Object.keys(data.budget)} />
            </div>

            {/* BUDGET SCENARIOS */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🤔 What-If Scenarios</h3>
              <BudgetScenarios budget={data.budget} totalBudget={data.couple.budget} currency={data.couple.currency} guestCount={data.couple.guestCount} />
            </div>

            {/* EXPORT */}
            <div className="flex gap-3">
              <button onClick={generateVendorBrief} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2">
                <Download size={20} /> Download Vendor Briefs
              </button>
            </div>
          </div>
        )}

        {/* VISION TAB */}
        {activeTab === 'vision' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Your Wedding Aesthetic</h2>
              <EnhancedVisionEditor vision={data.vision} updateVision={updateVision} />
            </div>

            {/* COLOR PALETTE */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎨 Color Palette</h3>
              <ColorPaletteEditor colors={data.vision.colors} onAdd={(color) => {
                const newColors = [...(data.vision.colors || []), color];
                updateVision(data.vision.vibe, newColors, data.vision.mustHaves, data.vision.avoids, data.vision.keywords);
              }} />
            </div>

            {/* PARTNER VISION */}
            {data.vision.partnerVibe && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🤝 Partner's Aesthetic</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Their Vibe</p>
                    <p className="text-lg text-blue-600 font-bold">{data.vision.partnerVibe}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VENDORS TAB */}
        {activeTab === 'vendors' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">💒 Vendor Tracking</h2>
              
              <div className="mb-4">
                <input type="text" placeholder="🔍 Search vendors..." className="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-rose-600 outline-none"
                  value={searchVendor} onChange={(e) => setSearchVendor(e.target.value)} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-rose-50 to-pink-50">
                    <tr>
                      <th className="text-left p-3 font-bold text-gray-900">Category</th>
                      <th className="text-left p-3 font-bold text-gray-900">Vendor</th>
                      <th className="text-right p-3 font-bold text-gray-900">Cost</th>
                      <th className="text-center p-3 font-bold text-gray-900">Aesthetic Match</th>
                      <th className="text-center p-3 font-bold text-gray-900">Status</th>
                      <th className="text-left p-3 font-bold text-gray-900">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vendors
                      .filter(v => v.name.toLowerCase().includes(searchVendor.toLowerCase()) || v.category.toLowerCase().includes(searchVendor.toLowerCase()))
                      .map(vendor => (
                        <tr key={vendor.id} className="border-t hover:bg-rose-50 transition">
                          <td className="p-3">{vendor.category}</td>
                          <td className="p-3 font-semibold text-gray-900">{vendor.name}</td>
                          <td className="text-right p-3">{data.couple.currency}{vendor.amount}</td>
                          <td className="text-center p-3">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500" style={{ width: `${vendor.aestheticScore}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-gray-700">{vendor.aestheticScore}%</span>
                            </div>
                          </td>
                          <td className="text-center p-3">
                            <select value={vendor.status} onChange={(e) => updateVendorStatus(vendor.id, e.target.value)} 
                              className={`px-2 py-1 rounded-full text-xs font-bold border-0 cursor-pointer ${
                                vendor.status === 'booked' ? 'bg-green-100 text-green-700' : 
                                vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                'bg-red-100 text-red-700'
                              }`}>
                              <option value="pending">⏳ Pending</option>
                              <option value="booked">✅ Booked</option>
                              <option value="declined">❌ Declined</option>
                            </select>
                          </td>
                          <td className="p-3 text-gray-600 text-xs max-w-xs truncate">{vendor.notes}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {data.vendors.length === 0 && (
                <p className="text-center text-gray-500 py-8">No vendors yet. Add your first quote in the Budget tab!</p>
              )}
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📅 Wedding Timeline</h2>
              
              <TimelineEditor timeline={data.timeline} onAdd={addMilestone} />

              <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
                {data.timeline
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map(item => {
                    const daysUntilTask = Math.ceil((new Date(item.date) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={item.id} className={`p-4 rounded-lg border-l-4 flex justify-between items-start ${item.urgency === 'urgent' ? 'bg-red-50 border-red-600' : item.urgency === 'soon' ? 'bg-yellow-50 border-yellow-600' : 'bg-green-50 border-green-600'}`}>
                        <div>
                          <p className="font-bold text-gray-900">{item.text}</p>
                          <p className="text-xs text-gray-600">{item.date} {daysUntilTask >= 0 ? `(${daysUntilTask} days)` : '(Past due!)'}</p>
                        </div>
                        <button onClick={() => setData(prev => ({...prev, timeline: prev.timeline.filter(t => t.id !== item.id)}))} className="text-red-600 hover:text-red-800 font-bold">✕</button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* GUESTS TAB */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 Guest List</h2>
              
              <GuestListEditor guests={data.guestList} onAdd={addGuest} onRemove={(id) => setData(prev => ({...prev, guestList: prev.guestList.filter(g => g.id !== id)}))} />

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-rose-50 to-pink-50">
                    <tr>
                      <th className="text-left p-3 font-bold text-gray-900">Name</th>
                      <th className="text-left p-3 font-bold text-gray-900">Email</th>
                      <th className="text-center p-3 font-bold text-gray-900">RSVP</th>
                      <th className="text-center p-3 font-bold text-gray-900">Meal</th>
                      <th className="text-center p-3 font-bold text-gray-900">+1</th>
                      <th className="text-center p-3 font-bold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.guestList.map(guest => (
                      <tr key={guest.id} className="border-t hover:bg-rose-50 transition">
                        <td className="p-3 font-semibold text-gray-900">{guest.name}</td>
                        <td className="p-3 text-gray-600">{guest.email}</td>
                        <td className="text-center p-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${guest.rsvp === 'confirmed' ? 'bg-green-100 text-green-700' : guest.rsvp === 'declined' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {guest.rsvp === 'confirmed' ? '✅' : guest.rsvp === 'declined' ? '❌' : '⏳'}
                          </span>
                        </td>
                        <td className="text-center p-3 text-xs">{guest.mealChoice || '—'}</td>
                        <td className="text-center p-3">{guest.plusOne ? '✓' : '—'}</td>
                        <td className="text-center p-3">
                          <button onClick={() => setData(prev => ({...prev, guestList: prev.guestList.filter(g => g.id !== guest.id)}))} className="text-red-600 hover:text-red-800 font-bold">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CHECKLIST TAB */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">✅ Wedding Checklist</h2>
                <span className="text-2xl font-bold text-rose-600">{checklistProgress}%</span>
              </div>

              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all" style={{ width: `${checklistProgress}%` }}></div>
              </div>

              <ChecklistEditor checklist={data.checklist} onAdd={addChecklistItem} onToggle={toggleChecklistItem} onRemove={(id) => setData(prev => ({...prev, checklist: prev.checklist.filter(c => c.id !== id)}))} />

              <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
                {data.checklist
                  .sort((a, b) => {
                    if (a.completed === b.completed) return 0;
                    return a.completed ? 1 : -1;
                  })
                  .map(item => (
                    <div key={item.id} className={`p-3 rounded-lg flex items-center gap-3 transition ${item.completed ? 'bg-gray-100 opacity-60' : 'bg-gray-50 hover:bg-rose-50'}`}>
                      <input type="checkbox" checked={item.completed} onChange={() => toggleChecklistItem(item.id)} className="w-5 h-5 accent-rose-600 cursor-pointer rounded" />
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>{item.task}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <button onClick={() => setData(prev => ({...prev, checklist: prev.checklist.filter(c => c.id !== item.id)}))} className="text-red-600 hover:text-red-800 flex-shrink-0">✕</button>
                    </div>
                  ))}
              </div>
            </div>

            {/* PREMADE CHECKLISTS */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Quick Add Checklists</h3>
              <PrebuiltChecklists onAdd={addChecklistItem} />
            </div>
          </div>
        )}

        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🌿 Florals</h3>
                <FloralPlanner florals={data.floralPlans} onAdd={addFloralItem} onRemove={(id) => setData(prev => ({...prev, floralPlans: prev.floralPlans.filter(f => f.id !== id)}))} />
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎨 Decorations</h3>
                <DecorPlanner decor={data.decor_plans} onAdd={addDecorItem} onRemove={(id) => setData(prev => ({...prev, decor_plans: prev.decor_plans.filter(d => d.id !== id)}))} />
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎵 Music & DJ</h3>
                <MusicPlanner music={data.music} onAddTrack={addMusicTrack} onUpdate={(notes) => setData(prev => ({...prev, music: {...prev.music, dj_timeline: notes}}))} />
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">✈️ Honeymoon</h3>
                <HoneymoonPlanner honeymoon={data.honeymoon} onUpdate={(h) => setData(prev => ({...prev, honeymoon: h}))} />
              </div>
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Planning Notes</h2>
              
              <NotesEditor notes={data.notes} onAdd={addNote} onRemove={(id) => setData(prev => ({...prev, notes: prev.notes.filter(n => n.id !== id)}))} />

              <div className="mt-6 space-y-3">
                {data.notes.map(note => (
                  <div key={note.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">{note.category}</span>
                      <button onClick={() => setData(prev => ({...prev, notes: prev.notes.filter(n => n.id !== note.id)}))} className="text-red-600 hover:text-red-800">✕</button>
                    </div>
                    <p className="text-gray-900">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(note.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PARTNER SHARE MODAL */}
      {showPartnerSetup && (
        <PartnerShareModal onClose={() => setShowPartnerSetup(false)} couple={data.couple} />
      )}
    </div>
  );
}

// HELPER COMPONENTS
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-rose-300 transition">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-600">{desc}</p>
    </div>
  );
}

function StatCard({ value, label, color }) {
  const colorMap = {
    rose: 'from-rose-50 to-pink-50 text-rose-700',
    orange: 'from-orange-50 to-amber-50 text-orange-700',
    green: 'from-green-50 to-emerald-50 text-green-700',
    purple: 'from-purple-50 to-indigo-50 text-purple-700',
    red: 'from-red-50 to-rose-50 text-red-700'
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} p-3 rounded-lg text-center`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-semibold">{label}</p>
    </div>
  );
}

function VendorStatusCard({ title, count, color }) {
  const colorClass = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700'
  }[color];

  return (
    <div className={`${colorClass} p-4 rounded-lg text-center font-bold`}>
      <p className="text-2xl">{count}</p>
      <p className="text-xs">{title}</p>
    </div>
  );
}

// ONBOARDING SCREENS
function OnboardingSetup({ onNext, setupData, setSetupData, step }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's Set Up Your Wedding 💒</h1>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500" style={{ width: '25%' }}></div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block font-bold text-gray-900 mb-2">Your Names</label>
            <input type="text" placeholder="e.g., Maya & Jordan" className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none" 
              value={setupData.name || ''} onChange={(e) => setSetupData({...setupData, name: e.target.value})} />
          </div>

          <div>
            <label className="block font-bold text-gray-900 mb-2">Wedding Date</label>
            <input type="date" className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none" 
              value={setupData.weddingDate || ''} onChange={(e) => setSetupData({...setupData, weddingDate: e.target.value})} />
          </div>

          <div>
            <label className="block font-bold text-gray-900 mb-2">Total Budget</label>
            <input type="number" placeholder="22500" className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none" 
              value={setupData.budget || ''} onChange={(e) => setSetupData({...setupData, budget: parseFloat(e.target.value) || 0})} />
          </div>

          <div>
            <label className="block font-bold text-gray-900 mb-2">Currency</label>
            <select className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none" 
              value={setupData.currency || '$'} onChange={(e) => setSetupData({...setupData, currency: e.target.value})}>
              <option value="$">USD $</option>
              <option value="€">EUR €</option>
              <option value="£">GBP £</option>
              <option value="¥">JPY ¥</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-900 mb-2">Guest Count</label>
            <input type="number" placeholder="110" className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none" 
              value={setupData.guestCount || ''} onChange={(e) => setSetupData({...setupData, guestCount: parseInt(e.target.value) || 0})} />
          </div>

          <div>
            <label className="block font-bold text-gray-900 mb-2">Wedding Location</label>
            <input type="text" placeholder="City, State" className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none" 
              value={setupData.location || ''} onChange={(e) => setSetupData({...setupData, location: e.target.value})} />
          </div>
        </div>

        <button onClick={onNext} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition">
          Next Step →
        </button>
      </div>
    </div>
  );
}

function OnboardingVision({ onNext, updateVision, vision, step }) {
  const [vibe, setVibe] = React.useState(vision.vibe || '');
  const [keywords, setKeywords] = React.useState(vision.keywords || []);
  const [input, setInput] = React.useState('');

  const aestheticOptions = [
    'Romantic', 'Boho', 'Modern', 'Elegant', 'Rustic', 'Minimalist', 
    'Garden', 'Vintage', 'Industrial', 'Glamorous', 'Casual', 'Tropical'
  ];

  const handleAddKeyword = () => {
    if (input && !keywords.includes(input)) {
      setKeywords([...keywords, input]);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">What's Your Wedding Vibe? ✨</h1>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500" style={{ width: '50%' }}></div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <label className="block font-bold text-gray-900 mb-3">Pick Vibes That Match You</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {aestheticOptions.map(option => (
                <button key={option} onClick={() => setVibe(option)}
                  className={`p-3 rounded-lg border-2 font-bold transition ${vibe === option ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-gray-300 text-gray-700 hover:border-rose-300'}`}>
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-900 mb-3">Key Elements (Type & Add)</label>
            <div className="flex gap-2 mb-3">
              <input type="text" placeholder="e.g., Candlelit, Greenery..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                className="flex-1 border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
              <button onClick={handleAddKeyword} className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition font-bold">
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, i) => (
                <span key={i} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                  {keyword}
                  <button onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))} className="hover:text-rose-900">✕</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => {
          updateVision(vibe, vision.colors, vision.mustHaves, vision.avoids, keywords);
          onNext();
        }} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition">
          Next Step →
        </button>
      </div>
    </div>
  );
}

function OnboardingPartner({ onNext, step }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Your Partner Later 🤝</h1>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500" style={{ width: '75%' }}></div>
          </div>
        </div>

        <p className="text-gray-700 mb-8 text-lg">Your partner can add their aesthetic preferences anytime. You can also share this planner with them to collaborate together!</p>

        <button onClick={onNext} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition">
          Got It! Let's Start Planning →
        </button>
      </div>
    </div>
  );
}

function OnboardingComplete({ onNext, couple }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">You're All Set!</h1>
        <p className="text-xl text-gray-700 mb-2">Welcome, {couple.name || 'lovebirds'}!</p>
        <p className="text-gray-600 mb-8">Your wedding planning dashboard is ready. Everything you need is just a click away.</p>

        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-xl mb-8 border border-rose-200">
          <p className="text-sm text-gray-700"><strong>💡 Pro Tip:</strong> Start by adding vendor quotes in the Budget tab to see your spending in real-time!</p>
        </div>

        <button onClick={onNext} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-3 text-lg rounded-lg hover:shadow-lg transition">
          Open Your Dashboard 💒
        </button>
      </div>
    </div>
  );
}

// MAIN COMPONENTS
function EnhancedVisionEditor({ vision, updateVision }) {
  const [vibe, setVibe] = React.useState(vision.vibe);
  const [mustHaves, setMustHaves] = React.useState(vision.mustHaves);
  const [avoids, setAvoids] = React.useState(vision.avoids);
  const [keyword, setKeyword] = React.useState('');
  const [keywords, setKeywords] = React.useState(vision.keywords || []);

  const handleAddKeyword = () => {
    if (keyword && !keywords.includes(keyword)) {
      const newKeywords = [...keywords, keyword];
      setKeywords(newKeywords);
      updateVision(vibe, vision.colors, mustHaves, avoids, newKeywords);
      setKeyword('');
    }
  };

  const handleRemoveKeyword = (index) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
    updateVision(vibe, vision.colors, mustHaves, avoids, newKeywords);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-bold text-gray-900 mb-2">Your Wedding Vibe</label>
        <input type="text" placeholder="e.g., Moody Romantic + Earthy DIY" value={vibe} onChange={(e) => setVibe(e.target.value)}
          onBlur={() => updateVision(vibe, vision.colors, mustHaves, avoids, keywords)}
          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none font-bold text-lg" />
      </div>

      <div>
        <label className="block font-bold text-gray-900 mb-3">Key Elements</label>
        <div className="flex gap-2 mb-3">
          <input type="text" placeholder="e.g., Candlelit, Handmade..." value={keyword} onChange={(e) => setKeyword(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
            className="flex-1 border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
          <button onClick={handleAddKeyword} className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition font-bold">
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {keywords.map((kw, i) => (
            <span key={i} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
              {kw}
              <button onClick={() => handleRemoveKeyword(i)} className="hover:text-rose-900">✕</button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-bold text-gray-900 mb-2">Must-Haves</label>
        <textarea placeholder="Specific design elements you love..." value={mustHaves} onChange={(e) => setMustHaves(e.target.value)}
          onBlur={() => updateVision(vibe, vision.colors, mustHaves, avoids, keywords)}
          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none h-24" />
      </div>

      <div>
        <label className="block font-bold text-gray-900 mb-2">Avoids</label>
        <textarea placeholder="What NOT to do..." value={avoids} onChange={(e) => setAvoids(e.target.value)}
          onBlur={() => updateVision(vibe, vision.colors, mustHaves, avoids, keywords)}
          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none h-24" />
      </div>
    </div>
  );
}

function ColorPaletteEditor({ colors, onAdd }) {
  const [colorInput, setColorInput] = React.useState('');
  const presetColors = ['#2d5016', '#f5e6e0', '#d4af37', '#1a1a1a', '#ffffff', '#e8d5c4'];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input type="color" value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="w-16 h-10 border-2 border-gray-300 rounded-lg cursor-pointer" />
        <input type="text" placeholder="#2d5016" value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="flex-1 border-2 border-gray-300 rounded-lg p-2" />
        <button onClick={() => {
          if (colorInput) {
            onAdd(colorInput);
            setColorInput('');
          }
        }} className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition font-bold">
          Add
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Presets</p>
        <div className="flex gap-2 flex-wrap">
          {presetColors.map((color, i) => (
            <button key={i} onClick={() => {
              onAdd(color);
              setColorInput(color);
            }} className="w-10 h-10 rounded border-2 border-gray-300 hover:border-rose-600 transition" style={{ backgroundColor: color }}></button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap mt-4">
        {colors.map((color, i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
            <div className="w-8 h-8 rounded border-2 border-gray-300" style={{ backgroundColor: color }}></div>
            <span className="text-sm font-mono font-bold">{color}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorQuoteForm({ onAdd, categories }) {
  const [form, setForm] = React.useState({ category: '', name: '', amount: '', notes: '', aestheticScore: 100 });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none">
          <option value="">Select Category</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input type="text" placeholder="Vendor name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <input type="text" placeholder="Notes" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
      </div>
      <button onClick={() => {
        if (form.category && form.name && form.amount) {
          onAdd(form.category, form.name, form.amount, form.notes, form.aestheticScore);
          setForm({ category: '', name: '', amount: '', notes: '', aestheticScore: 100 });
        }
      }} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-2 rounded-lg hover:shadow-lg transition">
        ➕ Add Vendor Quote
      </button>
    </div>
  );
}

function BudgetScenarios({ budget, totalBudget, currency, guestCount }) {
  const [scenario, setScenario] = React.useState('');

  const handleScenario = (type) => {
    let message = '';
    if (type === 'guests_add') {
      const newTotal = guestCount + 20;
      const cateringIncrease = (20 * 38);
      message = `📊 Adding 20 guests: +${currency}${cateringIncrease} (catering estimate). New total guests: ${newTotal}. Would you need to cut ${currency}${cateringIncrease} from elsewhere to stay in budget?`;
    } else if (type === 'floral_upgrade') {
      message = `🌿 Upgrading florals by ${currency}500: You'd need to cut ${currency}500 elsewhere to stay in budget. Suggested cuts: reduce decorations (${currency}300) + music upgrade deferred (${currency}200).`;
    } else if (type === 'venue_up') {
      message = `📍 Upgrading venue by ${currency}800: This impacts everything. Catering capacity changes, decoration needs change. Recommend reviewing full budget.`;
    }
    setScenario(message);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => handleScenario('guests_add')} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-bold">
          What if +20 guests?
        </button>
        <button onClick={() => handleScenario('floral_upgrade')} className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-bold">
          What if florals +${currency}500?
        </button>
        <button onClick={() => handleScenario('venue_up')} className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition font-bold">
          What if venue +${currency}800?
        </button>
      </div>
      {scenario && <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600 text-blue-900 font-semibold">{scenario}</div>}
    </div>
  );
}

function TimelineEditor({ timeline, onAdd }) {
  const [form, setForm] = React.useState({ text: '', date: '', urgency: 'soon' });

  return (
    <div className="space-y-3 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input type="text" placeholder="Decision or milestone..." value={form.text} onChange={(e) => setForm({...form, text: e.target.value})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <select value={form.urgency} onChange={(e) => setForm({...form, urgency: e.target.value})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none">
          <option value="urgent">🔴 Urgent</option>
          <option value="soon">🟡 Soon</option>
          <option value="upcoming">🟢 Upcoming</option>
        </select>
      </div>
      <button onClick={() => {
        if (form.text && form.date) {
          onAdd(form.text, form.date, form.urgency);
          setForm({ text: '', date: '', urgency: 'soon' });
        }
      }} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-2 rounded-lg hover:shadow-lg transition">
        ➕ Add Milestone
      </button>
    </div>
  );
}

function GuestListEditor({ guests, onAdd, onRemove }) {
  const [form, setForm] = React.useState({ name: '', email: '', rsvp: 'pending', mealChoice: '', plusOne: false });

  return (
    <div className="space-y-3 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input type="text" placeholder="Guest name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select value={form.rsvp} onChange={(e) => setForm({...form, rsvp: e.target.value})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none">
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="declined">Declined</option>
        </select>
        <input type="text" placeholder="Meal choice" value={form.mealChoice} onChange={(e) => setForm({...form, mealChoice: e.target.value})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <label className="flex items-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <input type="checkbox" checked={form.plusOne} onChange={(e) => setForm({...form, plusOne: e.target.checked})} className="w-4 h-4 accent-rose-600" />
          <span className="font-bold">Has +1</span>
        </label>
      </div>
      <button onClick={() => {
        if (form.name) {
          onAdd(form.name, form.email, form.rsvp, form.mealChoice, form.plusOne);
          setForm({ name: '', email: '', rsvp: 'pending', mealChoice: '', plusOne: false });
        }
      }} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-2 rounded-lg hover:shadow-lg transition">
        ➕ Add Guest
      </button>
    </div>
  );
}

function ChecklistEditor({ checklist, onAdd, onToggle, onRemove }) {
  const [task, setTask] = React.useState('');
  const [category, setCategory] = React.useState('General');

  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-4">
        <input type="text" placeholder="Add a task..." value={task} onChange={(e) => setTask(e.target.value)} className="flex-1 border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <button onClick={() => {
          if (task) {
            onAdd(task, category);
            setTask('');
          }
        }} className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition whitespace-nowrap font-bold">
          ➕ Add
        </button>
      </div>
    </div>
  );
}

function PrebuiltChecklists({ onAdd }) {
  const checklists = {
    '3 Months Before': [
      'Book all major vendors (venue, catering, photographer)',
      'Order invitations',
      'Book accommodations for guests',
      'Start planning seating chart',
      'Book hair and makeup artist'
    ],
    '1 Month Before': [
      'Send final guest count to caterer',
      'Confirm all vendor details',
      'Create day-of timeline',
      'Plan ceremony and reception music',
      'Do hair and makeup trial'
    ],
    '1 Week Before': [
      'Final confirmations with all vendors',
      'Arrange transportation',
      'Confirm wedding party roles',
      'Do final walk-through of venue',
      'Pack for honeymoon'
    ]
  };

  return (
    <div className="space-y-3">
      {Object.entries(checklists).map(([phase, tasks]) => (
        <button key={phase} onClick={() => tasks.forEach(task => onAdd(`[${phase}] ${task}`))}
          className="w-full text-left bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 p-3 rounded-lg font-bold border-2 border-rose-200 transition">
          📋 {phase}
        </button>
      ))}
    </div>
  );
}

function FloralPlanner({ florals, onAdd, onRemove }) {
  const [form, setForm] = React.useState({ type: '', description: '', location: '', budget: '', quantity: 1 });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input type="text" placeholder="Type (e.g., Bridal Bouquet)" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Budget" value={form.budget} onChange={(e) => setForm({...form, budget: e.target.value})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
          <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({...form, quantity: parseInt(e.target.value) || 1})} className="border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        </div>
        <button onClick={() => {
          if (form.type && form.location && form.budget) {
            onAdd(form.type, form.description, form.location, form.budget, form.quantity);
            setForm({ type: '', description: '', location: '', budget: '', quantity: 1 });
          }
        }} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-2 rounded-lg hover:shadow-lg transition">
          ➕ Add Floral
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {florals.map(floral => (
          <div key={floral.id} className="bg-pink-50 p-3 rounded-lg border-l-4 border-pink-500">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-bold text-gray-900">{floral.type}</p>
                <p className="text-sm text-gray-600">{floral.description}</p>
                <p className="text-xs text-gray-500">{floral.location} • Qty: {floral.quantity}</p>
              </div>
              <button onClick={() => onRemove(floral.id)} className="text-red-600 hover:text-red-800 font-bold">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DecorPlanner({ decor, onAdd, onRemove }) {
  const [form, setForm] = React.useState({ name: '', location: '', description: '', budget: '', status: 'planning' });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input type="text" placeholder="Decoration name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <input type="number" placeholder="Budget" value={form.budget} onChange={(e) => setForm({...form, budget: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <button onClick={() => {
          if (form.name && form.location && form.budget) {
            onAdd(form.name, form.location, form.description, form.budget);
            setForm({ name: '', location: '', description: '', budget: '', status: 'planning' });
          }
        }} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-2 rounded-lg hover:shadow-lg transition">
          ➕ Add Decoration
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {decor.map(item => (
          <div key={item.id} className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-bold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-xs text-gray-500">{item.location}</p>
              </div>
              <button onClick={() => onRemove(item.id)} className="text-red-600 hover:text-red-800 font-bold">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MusicPlanner({ music, onAddTrack, onUpdate }) {
  const [form, setForm] = React.useState({ title: '', artist: '', purpose: 'ceremony' });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input type="text" placeholder="Song title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <input type="text" placeholder="Artist" value={form.artist} onChange={(e) => setForm({...form, artist: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
        <select value={form.purpose} onChange={(e) => setForm({...form, purpose: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none">
          <option value="ceremony">Ceremony</option>
          <option value="reception_entrance">Reception Entrance</option>
          <option value="dinner">Dinner</option>
          <option value="dancing">Dancing</option>
        </select>
        <button onClick={() => {
          if (form.title && form.artist) {
            onAddTrack(form.title, form.artist, form.purpose);
            setForm({ title: '', artist: '', purpose: 'ceremony' });
          }
        }} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-2 rounded-lg hover:shadow-lg transition">
          ➕ Add Song
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {music.songs.map(song => (
          <div key={song.id} className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
            <p className="font-bold text-gray-900">{song.title}</p>
            <p className="text-sm text-gray-600">{song.artist}</p>
            <p className="text-xs text-gray-500">{song.purpose}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HoneymoonPlanner({ honeymoon, onUpdate }) {
  return (
    <div className="space-y-3">
      <input type="text" placeholder="Destination" value={honeymoon.destination} onChange={(e) => onUpdate({...honeymoon, destination: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
      <input type="text" placeholder="Dates" value={honeymoon.dates} onChange={(e) => onUpdate({...honeymoon, dates: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none" />
      <textarea placeholder="Plans and notes..." value={honeymoon.notes} onChange={(e) => onUpdate({...honeymoon, notes: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none h-24" />
    </div>
  );
}

function NotesEditor({ notes, onAdd, onRemove }) {
  const [content, setContent] = React.useState('');
  const [category, setCategory] = React.useState('general');

  return (
    <div className="mb-6">
      <div className="space-y-2 mb-4">
        <textarea placeholder="Add a note..." value={content} onChange={(e) => setContent(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none h-24" />
        <div className="flex gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1 border-2 border-gray-300 rounded-lg p-2 focus:border-rose-600 outline-none">
            <option value="general">General</option>
            <option value="vendor">Vendor</option>
            <option value="guest">Guest</option>
            <option value="budget">Budget</option>
            <option value="design">Design</option>
          </select>
          <button onClick={() => {
            if (content) {
              onAdd(content, category);
              setContent('');
            }
          }} className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition whitespace-nowrap font-bold">
            ➕ Add Note
          </button>
        </div>
      </div>
    </div>
  );
}

function PartnerShareModal({ onClose, couple }) {
  const shareLink = `${window.location.origin}?couple=${encodeURIComponent(couple.name)}&date=${couple.weddingDate}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🤝 Share with Partner</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 font-semibold mb-2">Share Link</p>
            <div className="flex gap-2">
              <input type="text" value={shareLink} readOnly className="flex-1 border-2 border-gray-300 rounded-lg p-2 text-xs bg-gray-50" />
              <button onClick={() => navigator.clipboard.writeText(shareLink)} className="bg-rose-600 text-white px-3 py-2 rounded-lg hover:bg-rose-700 transition font-bold">
                Copy
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900"><strong>💡 Tip:</strong> Send this link to your partner so they can add their preferences!</p>
          </div>

          <button onClick={onClose} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 rounded-lg transition">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
