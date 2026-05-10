import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function AdminDashboard({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboard();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetch(apiEndpoints.getSystemDashboard());
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #2B2B2B 0%, #F27C38 55%, #C9A44C 100%)' }}>
        <h1 className="text-3xl font-bold">🔐 ระบบจัดการแอดมิน</h1>
        <p className="text-white/85 mt-1">Full System Control & Monitoring</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white rounded-xl border border-gray-200 p-2">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'users', label: '👥 User Management' },
          { id: 'approvals', label: '✅ Staff Approvals' },
          { id: 'audit', label: '📋 Audit Logs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
              style={activeTab === tab.id ? { backgroundColor: '#F27C38' } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 font-bold">👥 รวม User</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#F27C38' }}>{dashboard.users?.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {dashboard.users?.students} นักศึกษา • {dashboard.users?.staff} เจ้าหน้าที่
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 font-bold">⚙️ เครื่องมือ</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#C9A44C' }}>{dashboard.equipment?.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {dashboard.equipment?.available} พร้อม • {dashboard.equipment?.maintenance} ซ่อม
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 font-bold">📅 การจอง</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#F27C38' }}>{dashboard.bookings?.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {dashboard.bookings?.pending} รออนุมัติ • {dashboard.bookings?.approved} อนุมัติ
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 font-bold">🔧 ซ่อมแซม</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#2B2B2B' }}>{dashboard.repairs?.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {dashboard.repairs?.critical || 0} วิกฤต • {dashboard.repairs?.high || 0} สูง
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">📖 กิจกรรมล่าสุด</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dashboard.recent_logs?.map((log, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded text-sm border border-gray-100">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">{log.action}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString('th-TH')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{log.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeTab !== 'overview' && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <p className="font-bold text-lg">Tab "{activeTab}" - Ready for implementation</p>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
