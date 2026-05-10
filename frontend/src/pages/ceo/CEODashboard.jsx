import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function CEODashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetch(apiEndpoints.getExecutiveDashboard());
      const data = await res.json();
      setDashboard(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  if (loading || !dashboard) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  const metrics = dashboard.metrics || {};
  const investment = dashboard.investment || {};
  const topEquip = dashboard.top_equipment || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-8 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #2B2B2B 0%, #F27C38 55%, #C9A44C 100%)' }}>
        <h1 className="text-4xl font-bold">📊 Executive Dashboard</h1>
        <p className="text-white/85 mt-1 text-lg">Strategic Overview & Business Intelligence</p>
        <p className="text-white/75 text-sm mt-2">View-only Report (Read-only)</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-bold">⚙️ Total Equipment</p>
          <p className="text-3xl font-bold mt-3" style={{ color: '#F27C38' }}>{metrics.total_equipment || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-bold">💰 Total Investment</p>
          <p className="text-2xl font-bold mt-3" style={{ color: '#C9A44C' }}>
            ฿{(investment.total_investment || 0).toLocaleString('th-TH')}
          </p>
          <p className="text-xs text-gray-600 mt-1">Avg: ฿{Math.round(investment.avg_price || 0).toLocaleString('th-TH')}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-bold">👥 Active Users</p>
          <p className="text-3xl font-bold mt-3" style={{ color: '#F27C38' }}>{metrics.active_users || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-bold">📅 Today Bookings</p>
          <p className="text-3xl font-bold mt-3" style={{ color: '#2B2B2B' }}>{metrics.today_bookings || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Approved: {metrics.total_approved_bookings || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-bold">⏱️ Avg Session</p>
          <p className="text-3xl font-bold mt-3" style={{ color: '#C9A44C' }}>{Math.round(metrics.avg_session_minutes || 0)}m</p>
        </div>
      </div>

      {/* Equipment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">📦 Equipment Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">🟢 Available</span>
              <span className="font-bold text-gray-900">{investment.available_count || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">🔴 Retired</span>
              <span className="font-bold text-gray-900">{investment.retired_count || 0}</span>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg mt-4">
              <p className="text-sm font-bold text-blue-700">
                ✓ Equipment Health: {(((investment.available_count || 0) / (investment.total_count || 1)) * 100).toFixed(1)}% Operational
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">💡 Investment Analysis</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="text-gray-600">Total Equipment Value</p>
              <p className="font-bold text-xl text-green-600">฿{(investment.total_investment || 0).toLocaleString('th-TH')}</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-600">Per-Equipment Cost</p>
              <p className="font-bold text-xl text-blue-600">฿{Math.round(investment.avg_price || 0).toLocaleString('th-TH')}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-purple-700 font-bold">
                ℹ️ ROI calculated from usage frequency and uniqueness
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Equipment by ROI */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">🏆 Top Equipment (by ROI)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Equipment</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Uses</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Users</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Cost/Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topEquip.slice(0, 10).map((eq, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{eq.name}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{eq.usage_count}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{eq.unique_users}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    ฿{Math.round(eq.cost_per_use).toLocaleString('th-TH')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Building Utilization */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">🏢 Lab Utilization Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboard.building_utilization?.map((bldg, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <p className="font-bold text-gray-900">{bldg.name}</p>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <p>📍 Rooms: {bldg.room_count}</p>
                <p>⚙️ Equipment: {bldg.equipment_count}</p>
                <p>📊 Total Uses: {bldg.total_usages}</p>
                <p>👥 Users: {bldg.unique_users}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-bold">ℹ️ Note:</p>
        <p>This is a read-only executive dashboard. For detailed analysis, visit Cost Analysis, Lab Comparison, or Equipment Recommendations panels.</p>
      </div>
    </div>
  );
}

export default CEODashboard;
