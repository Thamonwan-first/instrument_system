import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function MonthlyStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    loadStats();
  }, [months]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiEndpoints.getMonthlyStatistics()}?months=${months}`);
      const data = await res.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  if (loading || !stats) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;
  }

  const monthlyStats = stats.monthly_stats || [];
  const roleStats = stats.role_stats || [];

  const roleNames = {
    1: 'Admin',
    2: 'Staff',
    3: 'Student',
    4: 'CEO'
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">📅 Monthly Statistics</h1>
        <p className="text-teal-100 mt-2">Historical Usage Statistics & Comparisons (Read-only)</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-sm font-bold text-gray-700">📊 Time Period:</label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[3, 6, 12].map(m => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                months === m ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Last {m} Months
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">📈 Monthly Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Month</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Sessions</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Approved</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Active Days</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Users</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyStats.map((m, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-900">{m.month}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{m.total_sessions}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-bold">{m.approved_count}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{m.active_days}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{m.unique_users}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">
                    {Math.round(m.total_hours)}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">👥 Activity by Role</h3>
          <div className="space-y-4">
            {roleStats.map((role, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-900">{roleNames[role.role_id] || 'Unknown'}</span>
                  <span className="text-lg font-bold text-blue-600">{role.total_usages}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Users: {role.user_count}</p>
                  <p>Hours: {Math.round(role.total_hours)}h</p>
                  <p>Avg/User: {(role.total_usages / role.user_count).toFixed(1)} sessions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Cards */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <p className="text-sm font-bold text-blue-700">📊 Total Sessions</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {monthlyStats.reduce((sum, m) => sum + m.total_sessions, 0)}
            </p>
            <p className="text-xs text-blue-600 mt-1">All {months} months</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <p className="text-sm font-bold text-green-700">⌚ Total Hours</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {Math.round(monthlyStats.reduce((sum, m) => sum + m.total_hours, 0))}h
            </p>
            <p className="text-xs text-green-600 mt-1">{(monthlyStats.reduce((sum, m) => sum + m.total_hours, 0) / 24).toFixed(0)} days</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
            <p className="text-sm font-bold text-purple-700">👥 Unique Users</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {Math.max(...monthlyStats.map(m => m.unique_users), 0)}
            </p>
            <p className="text-xs text-purple-600 mt-1">Peak month</p>
          </div>
        </div>
      </div>

      {/* Monthly Comparison Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">📊 Monthly Sessions Trend</h3>
        <div className="h-48 flex items-end justify-between gap-2 bg-gray-50 rounded-lg p-4">
          {monthlyStats.map((m, idx) => {
            const maxSessions = Math.max(...monthlyStats.map(x => x.total_sessions), 1);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group">
                <div
                  className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${(m.total_sessions / maxSessions) * 160}px` }}
                  title={`${m.month}: ${m.total_sessions} sessions`}
                />
                <p className="text-xs text-gray-600 mt-2 group-hover:font-bold">{m.month.slice(5)}</p>
                <p className="text-xs text-gray-500 group-hover:font-bold">{m.total_sessions}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">📈 Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Avg Sessions/Month</p>
            <p className="font-bold text-2xl text-gray-900">
              {Math.round(monthlyStats.reduce((sum, m) => sum + m.total_sessions, 0) / monthlyStats.length)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Avg Hours/Month</p>
            <p className="font-bold text-2xl text-gray-900">
              {Math.round(monthlyStats.reduce((sum, m) => sum + m.total_hours, 0) / monthlyStats.length)}h
            </p>
          </div>
          <div>
            <p className="text-gray-600">Peak Month</p>
            <p className="font-bold text-2xl text-gray-900">
              {monthlyStats.reduce((max, m) => m.total_sessions > max.total_sessions ? m : max).month.slice(5)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Total Users</p>
            <p className="font-bold text-2xl text-gray-900">
              {roleStats.reduce((sum, r) => sum + r.user_count, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyStatistics;
