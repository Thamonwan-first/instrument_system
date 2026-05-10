import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function UserManagementPanel({ userId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiEndpoints.getUsers());
      const data = await res.json();
      
      let filtered = data;
      if (filter !== 'all') {
        filtered = data.filter(u => u.role === filter);
      }
      
      setUsers(filtered);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserActivity = async (userId) => {
    try {
      const res = await fetch(`${apiEndpoints.getUserActivity()}?user_id=${userId}`);
      const data = await res.json();
      setUserActivity(data);
      setSelectedUser(userId);
    } catch (err) {
      console.error('Error loading user activity:', err);
    }
  };

  const handleSuspend = async (action) => {
    if (action === 'suspend' && !suspendReason) {
      alert('กรุณากรอกเหตุผลในการระงับ');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', selectedUser);
      formData.append('action', action);
      formData.append('admin_id', userId);
      if (action === 'suspend') formData.append('reason', suspendReason);

      const res = await fetch(apiEndpoints.suspendUser(), {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert(`User ${action === 'suspend' ? 'suspended' : 'unsuspended'} successfully`);
        setSuspendReason('');
        setShowSuspendForm(false);
        loadUsers();
        setSelectedUser(null);
      }
    } catch (err) {
      alert('Error processing request');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>;
  }

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User List */}
      <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">👥 รายชื่อผู้ใช้</h3>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">ทั้งหมด ({users.length})</option>
            <option value="student">นักศึกษา ({users.filter(u => u.role === 'student').length})</option>
            <option value="staff">เจ้าหน้าที่ ({users.filter(u => u.role === 'staff').length})</option>
            <option value="admin">Admin ({users.filter(u => u.role === 'admin').length})</option>
          </select>
        </div>
        
        <div className="overflow-y-auto max-h-[600px]">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => loadUserActivity(user.id)}
              className={`w-full p-3 text-left border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                selectedUser === user.id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <p className="font-bold text-gray-900">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <div className="mt-1 inline-block px-2 py-0.5 bg-gray-200 rounded text-xs font-bold text-gray-700">
                {user.role}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* User Details */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
        {selectedUserData ? (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedUserData.first_name} {selectedUserData.last_name}</h2>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-gray-500">📧 Email</p>
                  <p className="font-medium text-gray-900">{selectedUserData.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">📱 Phone</p>
                  <p className="font-medium text-gray-900">{selectedUserData.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">🎭 Role</p>
                  <p className="font-medium text-gray-900">{selectedUserData.role}</p>
                </div>
                <div>
                  <p className="text-gray-500">📝 ID</p>
                  <p className="font-medium text-gray-900">{selectedUserData.student_id}</p>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            {/* Activity Stats */}
            {userActivity && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">📊 สถิติการใช้งาน</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-bold">📊 การใช้งาน</p>
                    <p className="text-2xl font-bold text-blue-600">{userActivity.usage?.total_sessions || 0}</p>
                    <p className="text-xs text-gray-600">{userActivity.usage?.total_hours || 0} ชั่วโมง</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-bold">📅 การจอง</p>
                    <p className="text-2xl font-bold text-green-600">{userActivity.bookings?.total_bookings || 0}</p>
                    <p className="text-xs text-gray-600">{userActivity.bookings?.approved || 0} อนุมัติ</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-600 font-bold">⏰ วันที่ใช้</p>
                    <p className="text-2xl font-bold text-orange-600">{userActivity.usage?.days_used || 0}</p>
                    <p className="text-xs text-gray-600">วัน</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => setShowSuspendForm(!showSuspendForm)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 text-sm"
              >
                {showSuspendForm ? '✕ ยกเลิก' : '⛔ ระงับ User'}
              </button>

              {showSuspendForm && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-2">
                  <textarea
                    value={suspendReason}
                    onChange={e => setSuspendReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="เหตุผลในการระงับ"
                    rows="2"
                  />
                  <button
                    onClick={() => handleSuspend('suspend')}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 text-sm"
                  >
                    ✓ ยืนยันระงับ
                  </button>
                </div>
              )}

              <button
                onClick={() => handleSuspend('unsuspend')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 text-sm"
              >
                ✓ ปลดระงับ User
              </button>

              <button
                onClick={() => alert('Edit functionality coming soon')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 text-sm"
              >
                ✏️ แก้ไขข้อมูล
              </button>
            </div>

            {/* Recent Activity */}
            {userActivity?.activity && userActivity.activity.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">📋 กิจกรรมล่าสุด</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {userActivity.activity.slice(0, 5).map((log, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded text-xs border border-gray-100">
                      <p className="font-medium text-gray-900">{log.action}</p>
                      <p className="text-gray-600">{new Date(log.created_at).toLocaleString('th-TH')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">👈 เลือก User จากรายการด้านซ้าย</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagementPanel;
