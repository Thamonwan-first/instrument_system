import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function TrendAnalytics() {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      const res = await fetch(apiEndpoints.getUsageTrends());
      const data = await res.json();
      setTrends(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading trends:', err);
    }
  };

  if (loading || !trends) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;
  }

  const dailyTrend = trends.daily_trend || [];
  const dayPattern = trends.day_pattern || [];
  const hourPattern = trends.hour_pattern || [];
  const equipTrend = trends.equipment_trend || [];

  const getDayName = (num) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[num - 1];
  };

  // Calculate max for scaling
  const maxDaily = Math.max(...dailyTrend.map(d => d.sessions), 1);
  const maxHour = Math.max(...hourPattern.map(h => h.sessions), 1);
  const maxDay = Math.max(...dayPattern.map(d => d.sessions), 1);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-700 to-cyan-900 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">📈 Trend Analytics</h1>
        <p className="text-cyan-100 mt-2">Usage Patterns & Historical Trends (Read-only)</p>
      </div>

      {/* Daily Usage Chart (Last 30 days) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">📊 Daily Usage Trend (Last 30 Days)</h3>
        <div className="h-64 flex items-end justify-between gap-1 bg-gray-50 rounded-lg p-4">
          {dailyTrend.slice(0, 30).map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center group">
              <div
                className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${(day.sessions / maxDaily) * 200}px` }}
                title={`${day.date}: ${day.sessions} sessions`}
              />
              <p className="text-xs text-gray-500 mt-2 group-hover:font-bold">{day.sessions}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Day of Week Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">📅 Usage by Day of Week</h3>
          <div className="space-y-3">
            {dayPattern.map((day, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-12 text-sm font-bold text-gray-700">{getDayName(day.day_num)}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-400 h-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${(day.sessions / maxDay) * 100}%` }}
                  >
                    {day.sessions > 50 && <span>{day.sessions}</span>}
                  </div>
                </div>
                <span className="w-12 text-right text-sm font-bold text-gray-900">{day.sessions}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hour of Day Pattern */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">⏰ Usage by Hour of Day</h3>
          <div className="space-y-2">
            {hourPattern.map((hour, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-8 text-sm font-bold text-gray-700">{hour.hour}:00</span>
                <div className="flex-1 bg-gray-200 rounded h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-400 h-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${(hour.sessions / maxHour) * 100}%` }}
                  >
                    {hour.sessions > 20 && hour.sessions}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Equipment Trends (6 months) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">🏆 Top Equipment Trends (6 Months)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Equipment</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 text-xs">M-1</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 text-xs">M-2</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 text-xs">M-3</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 text-xs">M-4</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 text-xs">M-5</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 text-xs">M-6</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from(new Set(equipTrend.map(e => e.id))).map((equipId, idx) => {
                const equipData = equipTrend.filter(e => e.id === equipId).sort((a, b) => b.month.localeCompare(a.month));
                const equipName = equipData[0]?.name;
                const trend = equipData.length > 1 ? 
                  (equipData[0]?.usages > equipData[equipData.length - 1]?.usages ? '📈' : '📉') : '-';
                
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{equipName}</td>
                    {Array(6).fill(0).map((_, i) => (
                      <td key={i} className="px-4 py-3 text-center font-bold text-gray-600">
                        {equipData[i]?.usages || '-'}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right text-lg">{trend}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-3">💡 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Peak Day:</p>
            <p className="font-bold text-gray-900">
              {dayPattern.reduce((max, d) => d.sessions > max.sessions ? d : max)?.day_name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Peak Hour:</p>
            <p className="font-bold text-gray-900">
              {hourPattern.reduce((max, h) => h.sessions > max.sessions ? h : max)?.hour || 'N/A'}:00
            </p>
          </div>
          <div>
            <p className="text-gray-600">Average Daily Sessions:</p>
            <p className="font-bold text-gray-900">
              {Math.round(dailyTrend.reduce((sum, d) => sum + d.sessions, 0) / dailyTrend.length)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Most Active Day Range:</p>
            <p className="font-bold text-gray-900">
              {Math.min(...hourPattern.map(h => h.hour))}:00 - {Math.max(...hourPattern.map(h => h.hour))}:00
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendAnalytics;
