import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function StudentStatistics({ userId }) {
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [period, userId]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiEndpoints.getPersonalStatistics()}?user_id=${userId}&period=${period}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">ไม่มีข้อมูล</div>;
  }

  const maxSessions = Math.max(...(stats.daily_stats?.map(d => d.session_count) || [1]));

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2 justify-center">
        {[
          { value: 'week', label: '📅 สัปดาห์นี้' },
          { value: 'month', label: '📅 เดือนนี้' },
          { value: 'year', label: '📅 ปีนี้' }
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center">
          <p className="text-xs opacity-90">📊 รวมครั้ง</p>
          <p className="text-2xl font-bold">{stats.totals?.total_sessions || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white text-center">
          <p className="text-xs opacity-90">⏱️ รวมชั่วโมง</p>
          <p className="text-2xl font-bold">{stats.totals?.total_hours || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white text-center">
          <p className="text-xs opacity-90">⚙️ เครื่องมือ</p>
          <p className="text-2xl font-bold">{stats.totals?.unique_equipment || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white text-center">
          <p className="text-xs opacity-90">⏰ เฉลี่ย</p>
          <p className="text-2xl font-bold">{(stats.totals?.avg_duration || 0).toFixed(0)}</p>
        </div>
      </div>

      {/* Daily Usage Chart */}
      {stats.daily_stats && stats.daily_stats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-4">📉 การใช้งานรายวัน</h3>
          <div className="space-y-2">
            {stats.daily_stats.map((day, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-20 text-xs font-medium text-gray-600">{day.usage_date}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${(day.session_count / maxSessions) * 100}%` }}
                  >
                    {day.session_count > 0 && day.session_count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frequent Equipment */}
      {stats.frequent_equipment && stats.frequent_equipment.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-4">🏆 เครื่องมือที่ใช้บ่อย</h3>
          <div className="space-y-3">
            {stats.frequent_equipment.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{item.usage_count}</p>
                  <p className="text-xs text-gray-500">{item.avg_duration.toFixed(1)}นา</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentStatistics;
