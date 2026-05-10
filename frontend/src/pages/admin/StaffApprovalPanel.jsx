import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function StaffApprovalPanel({ userId }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadApprovals();
  }, [filter]);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? apiEndpoints.getStaffApprovals()
        : `${apiEndpoints.getStaffApprovals()}?status=${filter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setApprovals(data);
    } catch (err) {
      console.error('Error loading approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId, action) => {
    const reason = action === 'reject' ? prompt('เหตุผลในการปฏิเสธ:') : null;
    
    if (action === 'reject' && !reason) return;

    try {
      const formData = new FormData();
      formData.append('approval_id', approvalId);
      formData.append('action', action);
      formData.append('admin_id', userId);
      if (reason) formData.append('reason', reason);

      const res = await fetch(apiEndpoints.approveStaff(), {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert(`Staff ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        loadApprovals();
      }
    } catch (err) {
      alert('Error processing request');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: 'pending', label: '⏳ รอการอนุมัติ' },
          { value: 'approved', label: '✅ อนุมัติแล้ว' },
          { value: 'rejected', label: '❌ ปฏิเสธแล้ว' },
          { value: 'all', label: '📋 ทั้งหมด' }
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              filter === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {approvals.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>ไม่มีรายการ</p>
          </div>
        ) : (
          approvals.map(approval => (
            <div key={approval.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-900">{approval.first_name} {approval.last_name}</p>
                  <p className="text-sm text-gray-600">{approval.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Username: {approval.username}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  approval.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  approval.status === 'approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {approval.status === 'pending' ? '⏳ รอ' : 
                   approval.status === 'approved' ? '✅ อนุมัติ' : '❌ ปฏิเสธ'}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <p>📱 {approval.phone}</p>
                <p>📅 สมัคร: {new Date(approval.created_at).toLocaleString('th-TH')}</p>
              </div>

              {approval.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(approval.id, 'approve')}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 text-sm"
                  >
                    ✅ อนุมัติ
                  </button>
                  <button
                    onClick={() => handleApprove(approval.id, 'reject')}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 text-sm"
                  >
                    ❌ ปฏิเสธ
                  </button>
                </div>
              )}

              {approval.status === 'approved' && (
                <p className="text-xs text-gray-500">อนุมัติโดย: {approval.approved_first} {approval.approved_last} เมื่อ {new Date(approval.approved_at).toLocaleString('th-TH')}</p>
              )}

              {approval.status === 'rejected' && approval.rejection_reason && (
                <p className="text-xs text-red-600">เหตุผล: {approval.rejection_reason}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StaffApprovalPanel;
