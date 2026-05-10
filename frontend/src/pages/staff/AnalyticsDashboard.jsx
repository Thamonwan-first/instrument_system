import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function AnalyticsDashboard() {
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiEndpoints.getUsageStatistics()}?period=${period}`);
      const data = await res.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  // Calculate totals
  const totalSessions = stats?.daily_stats?.reduce((sum, day) => sum + day.session_count, 0) || 0;
  const avgDuration = stats?.daily_stats?.length > 0 
    ? Math.round(stats.daily_stats.reduce((sum, day) => sum + (day.avg_duration || 0), 0) / stats.daily_stats.length * 100) / 100
    : 0;

  // Get max value for scaling
  const maxSessions = Math.max(...(stats?.daily_stats?.map(d => d.session_count) || [1]));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">📈 สถิติการใช้งานและการวิเคราะห์</h1>
        <p className="text-gray-500 text-sm mt-1">ดูข้อมูลความถี่การใช้งาน ความนิยม และการกระจายสถานะ</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex gap-3">
        {[
          { value: 'week', label: '📅 สัปดาห์ที่แล้ว' },
          { value: 'month', label: '📅 เดือนที่แล้ว' },
          { value: 'year', label: '📅 ปีที่แล้ว' }
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setPeriod(option.value)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              period === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-md">
          <p className="text-sm font-medium opacity-90">📊 รวมการใช้งาน</p>
          <p className="text-3xl font-bold mt-2">{totalSessions}</p>
          <p className="text-xs opacity-75 mt-1">ครั้ง</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-md">
          <p className="text-sm font-medium opacity-90">⏱️ ระยะเวลาเฉลี่ย</p>
          <p className="text-3xl font-bold mt-2">{avgDuration}</p>
          <p className="text-xs opacity-75 mt-1">นาที</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-md">
          <p className="text-sm font-medium opacity-90">🎯 เครื่องมือทั้งหมด</p>
          <p className="text-3xl font-bold mt-2">{stats?.popular_equipment?.length || 0}</p>
          <p className="text-xs opacity-75 mt-1">รายการ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Usage Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📉 การใช้งานรายวัน</h2>
          
          <div className="space-y-3">
            {stats?.daily_stats?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>ไม่มีข้อมูลการใช้งานในช่วงเวลานี้</p>
              </div>
            ) : (
              stats?.daily_stats?.map((day, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium text-gray-700">{day.usage_date}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: `${(day.session_count / maxSessions) * 100}%` }}
                    >
                      {day.session_count > 0 && day.session_count}
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm text-gray-600">
                    {day.avg_duration.toFixed(1)}นา
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">⚙️ การกระจายสถานะ</h2>
          
          <div className="space-y-4">
            {stats?.status_distribution?.map((status, idx) => {
              const total = stats.status_distribution.reduce((sum, s) => sum + s.count, 0);
              const percentage = Math.round((status.count / total) * 100);
              
              const statusColors = {
                available: 'from-green-500 to-green-600',
                in_use: 'from-blue-500 to-blue-600',
                maintenance: 'from-yellow-500 to-yellow-600',
                retired: 'from-red-500 to-red-600'
              };

              const statusLabels = {
                available: '✅ พร้อมใช้',
                in_use: '🔵 ใช้งาน',
                maintenance: '🔧 ซ่อม',
                retired: '❌ เลิกใช้'
              };

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{statusLabels[status.status] || status.status}</span>
                    <span className="text-sm font-bold text-gray-900">{status.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`bg-gradient-to-r ${statusColors[status.status] || 'from-gray-400 to-gray-500'} h-3 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular Equipment */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🏆 เครื่องมือที่ใช้บ่อยที่สุด</h2>
        
        {stats?.popular_equipment?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>ไม่มีข้อมูลการใช้งาน</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">🎯 อันดับ</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">ชื่อเครื่องมือ</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">รหัส</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">📊 ครั้งใช้งาน</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">⏱️ เฉลี่ย (นาที)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.popular_equipment?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 font-bold">{item.usage_count}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{(item.avg_duration || 0).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
