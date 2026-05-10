import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function LabComparisonPanel() {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('usages');

  useEffect(() => {
    loadComparison();
  }, []);

  const loadComparison = async () => {
    try {
      const res = await fetch(apiEndpoints.getLabComparison());
      const data = await res.json();
      setComparison(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading comparison:', err);
    }
  };

  if (loading || !comparison) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;
  }

  const labs = comparison.comparison || [];
  const summary = comparison.summary || {};

  const sortedLabs = [...labs].sort((a, b) => {
    if (sortBy === 'usages') return (b.total_usages || 0) - (a.total_usages || 0);
    if (sortBy === 'efficiency') return (b.efficiency_score || 0) - (a.efficiency_score || 0);
    if (sortBy === 'users') return (b.unique_users || 0) - (a.unique_users || 0);
    return 0;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">🏢 Lab Comparison & Analysis</h1>
        <p className="text-indigo-100 mt-2">Cross-lab Utilization & Efficiency Benchmarking (Read-only)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-bold">🏢 Total Labs</p>
          <p className="text-3xl font-bold text-purple-600 mt-3">{summary.total_labs || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-bold">⚙️ Equipment</p>
          <p className="text-3xl font-bold text-blue-600 mt-3">{summary.total_equipment || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-bold">💰 Investment</p>
          <p className="text-2xl font-bold text-green-600 mt-3">฿{(summary.total_investment || 0).toLocaleString('th-TH')}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-bold">📊 Total Uses</p>
          <p className="text-3xl font-bold text-orange-600 mt-3">{summary.total_usages || 0}</p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-sm font-bold text-gray-700">🔄 Sort by:</label>
        <div className="flex gap-2 mt-2 flex-wrap">
          <button
            onClick={() => setSortBy('usages')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              sortBy === 'usages' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Total Usages
          </button>
          <button
            onClick={() => setSortBy('efficiency')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              sortBy === 'efficiency' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Efficiency Score
          </button>
          <button
            onClick={() => setSortBy('users')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              sortBy === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            User Count
          </button>
        </div>
      </div>

      {/* Labs Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedLabs.map((lab, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            {/* Lab Header */}
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{lab.name}</h3>
                <p className="text-xs text-gray-500">{lab.code}</p>
              </div>
              <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                lab.efficiency_level === 'Excellent' ? 'bg-green-100 text-green-700' :
                lab.efficiency_level === 'Good' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {lab.efficiency_level}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">📍 Rooms</p>
                <p className="font-bold text-lg text-blue-600">{lab.room_count}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">⚙️ Equipment</p>
                <p className="font-bold text-lg text-purple-600">{lab.equipment_count}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">📊 Uses</p>
                <p className="font-bold text-lg text-green-600">{lab.total_usages}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">👥 Users</p>
                <p className="font-bold text-lg text-orange-600">{lab.unique_users}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Uses/Equipment</span>
                <span className="font-bold text-gray-900">{(lab.avg_usage_per_equipment || 0).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost per Usage</span>
                <span className="font-bold text-gray-900">฿{Math.round(lab.cost_per_usage || 0).toLocaleString('th-TH')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days with Activity</span>
                <span className="font-bold text-gray-900">{lab.days_with_usage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Efficiency Score</span>
                <span className="font-bold text-blue-600">{lab.efficiency_score}/10</span>
              </div>
            </div>

            {/* Last Activity */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
              Last Activity: {lab.last_activity || 'Never'}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-3">📊 Efficiency Ratings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-bold text-green-700">🟢 Excellent (7-10)</p>
            <p className="text-gray-600">High usage, good ROI, many users</p>
          </div>
          <div>
            <p className="font-bold text-yellow-700">🟡 Good (4-6)</p>
            <p className="text-gray-600">Moderate usage and efficiency</p>
          </div>
          <div>
            <p className="font-bold text-red-700">🔴 Needs Improvement (0-3)</p>
            <p className="text-gray-600">Low utilization, consider optimization</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabComparisonPanel;
