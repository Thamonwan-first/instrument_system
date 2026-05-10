import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    user_id: '',
    from: '',
    to: ''
  });
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);

  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('offset', page * limit);
      params.append('limit', limit);
      if (filters.action) params.append('action', filters.action);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const res = await fetch(`${apiEndpoints.getAuditLogs()}?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const actionColors = {
    login: 'bg-blue-100 text-blue-700',
    logout: 'bg-gray-100 text-gray-700',
    create: 'bg-green-100 text-green-700',
    update: 'bg-yellow-100 text-yellow-700',
    delete: 'bg-red-100 text-red-700',
    approve_staff: 'bg-green-100 text-green-700',
    reject_staff: 'bg-red-100 text-red-700',
    suspend_user: 'bg-orange-100 text-orange-700',
    unsuspend_user: 'bg-blue-100 text-blue-700'
  };

  const pageCount = Math.ceil(total / limit);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h3 className="font-bold text-gray-900">🔍 ตัวกรองการค้นหา</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="date"
            value={filters.from}
            onChange={e => setFilters({ ...filters, from: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="จากวันที่"
          />
          <input
            type="date"
            value={filters.to}
            onChange={e => setFilters({ ...filters, to: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="ถึงวันที่"
          />
          <select
            value={filters.action}
            onChange={e => setFilters({ ...filters, action: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">ทุกการดำเนินการ</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          <button
            onClick={() => setFilters({ action: '', user_id: '', from: '', to: '' })}
            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 text-sm"
          >
            🔄 รีเซ็ต
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-700">⏰ เวลา</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">👤 ผู้ใช้</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">🔖 การดำเนินการ</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">📝 รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                    ไม่พบบันทึก
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {new Date(log.created_at).toLocaleString('th-TH')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {log.first_name} {log.last_name}
                      </span>
                      <p className="text-xs text-gray-500">{log.username}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
          >
            ← ก่อนหน้า
          </button>
          <span className="px-4 py-2 text-sm font-bold text-gray-700">
            หน้า {page + 1} / {pageCount}
          </span>
          <button
            onClick={() => setPage(Math.min(pageCount - 1, page + 1))}
            disabled={page >= pageCount - 1}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
          >
            ถัดไป →
          </button>
        </div>
      )}
    </div>
  );
}

export default AuditLogViewer;
