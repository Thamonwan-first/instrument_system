import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function NotificationCenter({ user }) {
  const [activeTab, setActiveTab] = useState('send');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Send form state
  const [sendForm, setSendForm] = useState({
    type: 'to_student',
    title: '',
    message: '',
    user_ids: ''
  });

  const [users, setUsers] = useState({ students: [], staff: [], admins: [] });

  // Load data
  useEffect(() => {
    loadNotifications();
    loadUsers();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetch(apiEndpoints.getNotifications());
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(apiEndpoints.getUsers());
      const data = await res.json();
      
      const groupedUsers = {
        students: data.filter(u => u.role_id === 3),
        staff: data.filter(u => u.role_id === 2),
        admins: data.filter(u => u.role_id === 1)
      };
      
      setUsers(groupedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();

    if (!sendForm.title.trim() || !sendForm.message.trim()) {
      alert('กรุณากรอกชื่อเรื่องและข้อความ');
      return;
    }

    if (sendForm.type === 'custom' && !sendForm.user_ids.trim()) {
      alert('เลือกผู้รับแจ้งเตือนอย่างน้อยคนหนึ่ง');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('type', sendForm.type);
      formData.append('title', sendForm.title);
      formData.append('message', sendForm.message);
      if (sendForm.type === 'custom') {
        formData.append('user_ids', sendForm.user_ids);
      }

      const res = await fetch(apiEndpoints.sendNotification(), {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        alert(`ส่งแจ้งเตือนให้ ${data.count} คน สำเร็จ`);
        setSendForm({ type: 'to_student', title: '', message: '', user_ids: '' });
        loadNotifications();
      } else {
        alert('เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Error sending notification');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const formData = new FormData();
      formData.append('id', notificationId);

      const res = await fetch(apiEndpoints.markRead(), {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        loadNotifications();
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const formData = new FormData();
      formData.append('mark_all', true);

      const res = await fetch(apiEndpoints.markRead(), {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        loadNotifications();
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold" style={{ color: '#2B2B2B' }}>📢 ศูนย์แจ้งเตือน</h1>
        <p className="text-sm mt-1" style={{ color: '#6b5a47' }}>ส่งแจ้งเตือนให้นักเรียน เจ้าหน้าที่ และผู้บริหาร</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 bg-white rounded-t-2xl">
        <button
          onClick={() => setActiveTab('send')}
          className={`flex-1 py-4 font-bold border-b-2 transition-colors ${
            activeTab === 'send'
                ? 'border-transparent text-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
              style={activeTab === 'send' ? { backgroundColor: '#F27C38', borderBottomColor: '#F27C38' } : {}}
        >
          📤 ส่งแจ้งเตือน
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-4 font-bold border-b-2 transition-colors ${
            activeTab === 'received'
                ? 'border-transparent text-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
              style={activeTab === 'received' ? { backgroundColor: '#C9A44C', borderBottomColor: '#C9A44C' } : {}}
        >
          📥 แจ้งเตือนที่ได้รับ ({unreadCount})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm p-6">
        {activeTab === 'send' ? (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">ส่งแจ้งเตือนใหม่</h2>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ผู้รับแจ้งเตือน *</label>
                <select
                  value={sendForm.type}
                  onChange={e => setSendForm({ ...sendForm, type: e.target.value, user_ids: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="to_student">📚 นักเรียนทั้งหมด ({users.students.length} คน)</option>
                  <option value="to_staff">👨‍💼 เจ้าหน้าที่ทั้งหมด ({users.staff.length} คน)</option>
                  <option value="to_admin">🔐 ผู้บริหารทั้งหมด ({users.admins.length} คน)</option>
                  <option value="custom">👥 เลือกคนเอง</option>
                </select>
              </div>

              {sendForm.type === 'custom' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">เลือกผู้รับ</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {users.students.map(user => (
                      <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={user.id}
                          checked={sendForm.user_ids.includes(user.id.toString())}
                          onChange={e => {
                            const ids = sendForm.user_ids ? sendForm.user_ids.split(',') : [];
                            if (e.target.checked) {
                              setSendForm({ ...sendForm, user_ids: [...ids, user.id].join(',') });
                            } else {
                              setSendForm({
                                ...sendForm,
                                user_ids: ids.filter(id => id !== user.id.toString()).join(',')
                              });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{user.first_name} {user.last_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อเรื่อง *</label>
                <input
                  type="text"
                  value={sendForm.title}
                  onChange={e => setSendForm({ ...sendForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น ประกาศปิดศูนย์ศึกษา"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ข้อความ *</label>
                <textarea
                  value={sendForm.message}
                  onChange={e => setSendForm({ ...sendForm, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="พิมพ์ข้อความแจ้งเตือนที่นี่"
                  rows="6"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSendForm({ type: 'to_student', title: '', message: '', user_ids: '' })}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  📤 ส่งแจ้งเตือน
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">แจ้งเตือนที่ได้รับ</h2>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-bold"
                >
                  ✓ ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg font-medium">ไม่มีแจ้งเตือน</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      notif.is_read
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-blue-50 border-blue-300 hover:border-blue-400'
                    }`}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{notif.title}</h3>
                        <p className="text-gray-700 text-sm">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notif.created_at).toLocaleString('th-TH')}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <span className="ml-3 w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationCenter;
