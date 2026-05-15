import React, { useState, useEffect } from 'react';

export default function WeddingPlanner() {
  const [data, setData] = useState({
    couple: { name: '', weddingDate: '', budget: 0, currency: '$' },
    budget: {
      Venue: { allocated: 4500, spent: 0 },
      Catering: { allocated: 8500, spent: 0 },
      Photography: { allocated: 2500, spent: 0 },
      Florals: { allocated: 3000, spent: 0 },
      Music: { allocated: 1200, spent: 0 },
      Rentals: { allocated: 800, spent: 0 },
      Attire: { allocated: 600, spent: 0 },
      HairMakeup: { allocated: 300, spent: 0 },
      Invitations: { allocated: 400, spent: 0 },
      Decorations: { allocated: 1500, spent: 0 },
      Transportation: { allocated: 400, spent: 0 },
      Miscellaneous: { allocated: 1700, spent: 0 }
    },
    vendors: [],
    timeline: [],
    checklist: [],
    guestList: []
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupData, setSetupData] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('weddingPlannerData');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setData(parsedData);
        setIsSetupComplete(true);
      } catch (e) {
        console.log('Could not load saved data');
      }
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem('weddingPlannerData', JSON.stringify(data));
    }
  }, [data, isSetupComplete]);

  const handleSetup = () => {
    if (setupData.name && setupData.weddingDate && setupData.budget) {
      setData(prev => ({
        ...prev,
        couple: {
          name: setupData.name,
          weddingDate: setupData.weddingDate,
          budget: parseFloat(setupData.budget),
          currency: setupData.currency || '$'
        }
      }));
      setIsSetupComplete(true);
    }
  };

  const calculateBudgetStats = () => {
    let totalAllocated = 0;
    let totalSpent = 0;
    Object.values(data.budget).forEach(cat => {
      totalAllocated += cat.allocated;
      totalSpent += cat.spent;
    });
    return {
      totalAllocated,
      totalSpent,
      remaining: data.couple.budget - totalSpent,
      percentUsed: data.couple.budget > 0 ? Math.round((totalSpent / data.couple.budget) * 100) : 0
    };
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

  const stats = calculateBudgetStats();
  const guestStats = calculateGuestStats();
  const checklistProgress = getChecklistProgress();

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">💒</div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3">Wedding Planner OS</h1>
            <p className="text-xl text-gray-600">Plan your wedding, your way</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Let's Get Started!</h2>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block font-bold text-gray-900 mb-2">Your Names</label>
                <input
                  type="text"
                  placeholder="e.g., Maya & Jordan"
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none"
                  value={setupData.name || ''}
                  onChange={(e) => setSetupData({...setupData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 mb-2">Wedding Date</label>
                <input
                  type="date"
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none"
                  value={setupData.weddingDate || ''}
                  onChange={(e) => setSetupData({...setupData, weddingDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 mb-2">Total Budget</label>
                <input
                  type="number"
                  placeholder="22500"
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none"
                  value={setupData.budget || ''}
                  onChange={(e) => setSetupData({...setupData, budget: e.target.value})}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 mb-2">Currency</label>
                <select
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-rose-600 outline-none"
                  value={setupData.currency || '$'}
                  onChange={(e) => setSetupData({...setupData, currency: e.target.value})}
                >
                  <option value="$">USD $</option>
                  <option value="€">EUR €</option>
                  <option value="£">GBP £</option>
                  <option value="kr">DKK kr</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSetup}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-4 text-lg rounded-xl hover:shadow-lg transition"
            >
              Start Planning 💕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-purple-50">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-rose-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💒</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Wedding OS
                </h1>
                <p className="text-xs text-gray-600">{data.couple.name}</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('weddingPlannerData');
                setIsSetupComplete(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-900 font-semibold"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white/80 backdrop-blur border-b border-rose-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'budget', label: 'Budget', icon: '💰' },
            { id: 'vendors', label: 'Vendors', icon: '💒' },
            { id: 'timeline', label: 'Timeline', icon: '📅' },
            { id: 'guests', label: 'Guests', icon: '👥' },
            { id: 'checklist', label: 'Checklist', icon: '✅' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 transition text-sm ${
                activeTab === tab.id
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-gray-600 hover:text-rose-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">💰 Budget Health</h2>
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
                      <div
                        className={`h-full transition-all ${
                          stats.percentUsed > 100
                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                            : 'bg-gradient-to-r from-rose-500 to-pink-500'
                        }`}
                        style={{ width: `${Math.min(stats.percentUsed, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-gray-900 mb-4">👥 Guest Status</h3>
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

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💒 Vendor Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-100 text-blue-700 p-4 rounded-lg text-center font-bold">
                  <p className="text-2xl">{data.vendors.length}</p>
                  <p className="text-xs">Total Vendors</p>
                </div>
                <div className="bg-green-100 text-green-700 p-4 rounded-lg text-center font-bold">
                  <p className="text-2xl">{data.vendors.filter(v => v.status === 'booked').length}</p>
                  <p className="text-xs">Booked</p>
                </div>
                <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg text-center font-bold">
                  <p className="text-2xl">{data.vendors.filter(v => v.status === 'pending').length}</p>
                  <p className="text-xs">Pending</p>
                </div>
                <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center font-bold">
                  <p className="text-2xl">{data.vendors.filter(v => v.status === 'declined').length}</p>
                  <p className="text-xs">Declined</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">✅ Checklist Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all"
                      style={{ width: `${checklistProgress}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-2xl font-bold text-rose-600">{checklistProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
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
                        <td className="p-3 font-semibold text-gray-900">{key}</td>
                        <td className="text-right p-3">{data.couple.currency}{allocated}</td>
                        <td className="text-right p-3 font-semibold text-orange-600">{data.couple.currency}{spent}</td>
                        <td className={`text-right p-3 font-semibold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
                          {data.couple.currency}{remaining}
                        </td>
                        <td className="text-center p-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              isOver
                                ? 'bg-red-100 text-red-700'
                                : remaining < 100
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
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
        )}

        {activeTab === 'vendors' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">💒 Vendor Tracking</h2>
            <p className="text-gray-600 text-center py-8">Add vendors as you get quotes!</p>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Timeline</h2>
            <p className="text-gray-600 text-center py-8">Add milestones here!</p>
          </div>
        )}

        {activeTab === 'guests' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 Guest List</h2>
            <p className="text-gray-600 text-center py-8">Track your guests here!</p>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">✅ Checklist</h2>
              <span className="text-2xl font-bold text-rose-600">{checklistProgress}%</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
              <div
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all"
                style={{ width: `${checklistProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-600 text-center py-8">Add tasks to your checklist!</p>
          </div>
        )}
      </main>
    </div>
  );
}
