import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function EquipmentRecommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommendations');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const res = await fetch(apiEndpoints.getEquipmentRecommendations());
      const data = await res.json();
      setData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;
  }

  const recommendations = data.recommendations || [];
  const demandAnalysis = data.demand_analysis || [];
  const highWait = data.high_wait_equipment || [];
  const underutilized = data.underutilized_equipment || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">💡 Equipment Recommendations</h1>
        <p className="text-amber-100 mt-2">Strategic Recommendations for Equipment Procurement (Read-only)</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl border border-gray-200 p-2">
        {[
          { id: 'recommendations', label: '💡 Recommendations' },
          { id: 'demand', label: '📈 Demand Analysis' },
          { id: 'wait', label: '⏳ High Wait Time' },
          { id: 'underutil', label: '📉 Underutilized' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
              <p className="text-blue-700 font-bold">✓ All equipment is optimally allocated</p>
            </div>
          ) : (
            recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-5 ${
                  rec.priority === 'High'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{rec.type}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {rec.category || rec.equipment}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs text-white ${
                    rec.priority === 'High' ? 'bg-red-600' : 'bg-yellow-600'
                  }`}>
                    {rec.priority}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-3">📝 {rec.reason}</p>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {rec.current_equipment && (
                    <div><span className="text-gray-600">Current:</span> <span className="font-bold">{rec.current_equipment}</span></div>
                  )}
                  {rec.pending_bookings && (
                    <div><span className="text-gray-600">Pending:</span> <span className="font-bold">{rec.pending_bookings}</span></div>
                  )}
                  {rec.estimated_cost && (
                    <div><span className="text-gray-600">Est. Cost:</span> <span className="font-bold">฿{Math.round(rec.estimated_cost).toLocaleString('th-TH')}</span></div>
                  )}
                  {rec.total_usages && (
                    <div><span className="text-gray-600">Uses:</span> <span className="font-bold">{rec.total_usages}</span></div>
                  )}
                </div>

                {rec.recommendation && (
                  <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
                    💡 {rec.recommendation}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Demand Analysis */}
      {activeTab === 'demand' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demandAnalysis.map((cat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-lg text-gray-900">{cat.category}</h3>
              <div className="text-sm text-gray-600 space-y-2 mt-3">
                <p>📊 Current: <span className="font-bold text-gray-900">{cat.current_count} units</span></p>
                <p>📈 Usages: <span className="font-bold text-gray-900">{cat.total_usages}</span></p>
                <p>⌚ Avg/Unit: <span className="font-bold text-gray-900">{(cat.avg_usage_per_unit || 0).toFixed(1)} uses</span></p>
                <p>💰 Total: <span className="font-bold text-green-600">฿{(cat.category_investment || 0).toLocaleString('th-TH')}</span></p>
              </div>
              {cat.avg_usage_per_unit > 20 && (
                <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-700 font-bold">
                  ⚠️ High demand - consider adding more
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: High Wait Time */}
      {activeTab === 'wait' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Equipment</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">Bookings</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">Pending %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {highWait.map((eq, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{eq.name}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{eq.category}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{eq.total_bookings}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${
                        eq.pending_percentage > 50 ? 'text-red-600' :
                        eq.pending_percentage > 30 ? 'text-orange-600' :
                        'text-yellow-600'
                      }`}>
                        {eq.pending_percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Underutilized */}
      {activeTab === 'underutil' && (
        <div className="space-y-3">
          {underutilized.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <p className="text-green-700 font-bold">✓ No underutilized equipment found</p>
            </div>
          ) : (
            underutilized.map((eq, idx) => (
              <div key={idx} className="bg-red-50 border border-red-200 rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{eq.name}</p>
                    <p className="text-xs text-gray-600">{eq.category}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full font-bold text-xs text-white bg-red-600">
                    Low Usage
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Uses</p>
                    <p className="font-bold text-gray-900">{eq.total_usages || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Use</p>
                    <p className="font-bold text-gray-900">{eq.days_since_use || '?'} days ago</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cost/Use</p>
                    <p className="font-bold text-gray-900">฿{Math.round(eq.cost_per_use).toLocaleString('th-TH')}</p>
                  </div>
                </div>

                <p className="text-xs text-red-700 mt-3 pt-3 border-t border-red-200">
                  💡 Consider replacement with high-demand equipment
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default EquipmentRecommendations;
