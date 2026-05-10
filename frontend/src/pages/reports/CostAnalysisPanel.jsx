import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function CostAnalysisPanel() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buildingFilter, setBuildingFilter] = useState(null);
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    loadBuildings();
  }, []);

  useEffect(() => {
    loadAnalysis();
  }, [buildingFilter]);

  const loadBuildings = async () => {
    try {
      const res = await fetch(apiEndpoints.getBuildings());
      const data = await res.json();
      setBuildings(data || []);
    } catch (err) {
      console.error('Error loading buildings:', err);
    }
  };

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const url = buildingFilter 
        ? `${apiEndpoints.getCostAnalysis()}?building_id=${buildingFilter}`
        : apiEndpoints.getCostAnalysis();
      
      const res = await fetch(url);
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Error loading analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;
  }

  if (!analysis) {
    return <div className="p-8 text-center text-gray-500">ไม่มีข้อมูล</div>;
  }

  const sortedEquip = analysis.analysis?.sort((a, b) => b.roi_score - a.roi_score) || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">💰 Cost-Benefit Analysis</h1>
        <p className="text-green-100 mt-2">Equipment ROI & Investment Analysis (Read-only)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-bold">💵 Total Investment</p>
          <p className="text-3xl font-bold text-green-600 mt-3">
            ฿{(analysis.total_investment || 0).toLocaleString('th-TH')}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-bold">⚙️ Equipment Count</p>
          <p className="text-3xl font-bold text-blue-600 mt-3">{analysis.equipment_count || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-bold">💡 Avg Cost/Use</p>
          <p className="text-2xl font-bold text-orange-600 mt-3">
            ฿{Math.round(analysis.avg_cost_per_use || 0).toLocaleString('th-TH')}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-sm font-bold text-gray-700">🏢 Filter by Building:</label>
        <select
          value={buildingFilter || ''}
          onChange={e => setBuildingFilter(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Buildings</option>
          {buildings.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Equipment Table with ROI Scoring */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">📊 Equipment ROI Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Equipment</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Price</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Uses</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Users</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">Cost/Use</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">ROI Score</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedEquip.slice(0, 20).map((eq, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{eq.name}</td>
                  <td className="px-4 py-3 text-right text-gray-600">฿{Math.round(eq.price).toLocaleString('th-TH')}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">{eq.usage_count}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{eq.unique_users}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">฿{Math.round(eq.cost_per_use).toLocaleString('th-TH')}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                      eq.roi_score >= 7 ? 'bg-green-100 text-green-700' :
                      eq.roi_score >= 4 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {eq.roi_score}/10
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{eq.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROI Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="font-bold text-green-700">🟢 High ROI (7-10)</p>
          <p className="text-sm text-gray-600 mt-1">
            {sortedEquip.filter(e => e.roi_score >= 7).length} equipment
          </p>
          <p className="text-xs text-gray-500 mt-2">Keep & maintain these assets</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="font-bold text-yellow-700">🟡 Moderate ROI (4-6)</p>
          <p className="text-sm text-gray-600 mt-1">
            {sortedEquip.filter(e => e.roi_score >= 4 && e.roi_score < 7).length} equipment
          </p>
          <p className="text-xs text-gray-500 mt-2">Monitor usage patterns</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-bold text-red-700">🔴 Low ROI (0-3)</p>
          <p className="text-sm text-gray-600 mt-1">
            {sortedEquip.filter(e => e.roi_score < 4).length} equipment
          </p>
          <p className="text-xs text-gray-500 mt-2">Consider replacement/removal</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-bold">📊 ROI Score Calculation:</p>
        <p className="mt-1">• Usage frequency (3 pts max) + User diversity (3 pts) + Cost efficiency (3 pts) + Status (1 pt)</p>
      </div>
    </div>
  );
}

export default CostAnalysisPanel;
