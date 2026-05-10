import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function StatusTracker() {
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusForm, setShowStatusForm] = useState(false);
  
  const [statusForm, setStatusForm] = useState({
    new_status: 'available',
    reason: '',
    notes: ''
  });

  const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-300',
    in_use: 'bg-blue-100 text-blue-800 border-blue-300',
    maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    retired: 'bg-red-100 text-red-800 border-red-300'
  };

  const statusLabels = {
    available: '✅ พร้อมใช้งาน',
    in_use: '🔵 กำลังใช้งาน',
    maintenance: '🔧 ซ่อมแซม',
    retired: '❌ เลิกใช้'
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const res = await fetch(apiEndpoints.getTree());
      const data = await res.json();
      
      if (data.buildings) {
        const allEquipment = [];
        data.buildings.forEach(building => {
          building.rooms.forEach(room => {
            room.equipment.forEach(eq => {
              allEquipment.push({
                id: eq.id,
                name: eq.name,
                code: eq.code,
                status: eq.status,
                room: room.name,
                building: building.name
              });
            });
          });
        });
        setEquipment(allEquipment);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading equipment:', err);
      setLoading(false);
    }
  };

  const loadStatusHistory = async (equipmentId) => {
    try {
      const res = await fetch(`${apiEndpoints.getEquipmentStatusHistory()}?equipment_id=${equipmentId}`);
      const data = await res.json();
      setStatusHistory(data.history || []);
      setSelectedEquipment(equipmentId);
      setShowStatusForm(false);
    } catch (err) {
      console.error('Error loading status history:', err);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('equipment_id', selectedEquipment);
      formData.append('new_status', statusForm.new_status);
      formData.append('reason', statusForm.reason);
      formData.append('notes', statusForm.notes);

      const res = await fetch(apiEndpoints.logEquipmentStatus(), {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        alert('เปลี่ยนสถานะสำเร็จ');
        setStatusForm({ new_status: 'available', reason: '', notes: '' });
        setShowStatusForm(false);
        loadStatusHistory(selectedEquipment);
        loadEquipment();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('เกิดข้อผิดพลาด');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">📊 ติดตามสถานะเครื่องมือ</h1>
        <p className="text-gray-500 text-sm mt-1">ดูประวัติการเปลี่ยนแปลงสถานะและจัดการสถานะเครื่องมือ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-900">📦 รายการเครื่องมือ</h2>
            <p className="text-xs text-gray-500 mt-1">({equipment.length} รายการ)</p>
          </div>
          
          <div className="overflow-y-auto max-h-[600px]">
            {equipment.map(item => (
              <div
                key={item.id}
                onClick={() => loadStatusHistory(item.id)}
                className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedEquipment === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">{item.code}</p>
                <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-bold border ${statusColors[item.status]}`}>
                  {statusLabels[item.status]}
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.building}/{item.room}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Status History & Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          {selectedEquipment ? (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">📋 ประวัติการเปลี่ยนแปลงสถานะ</h2>
                
                <button
                  onClick={() => setShowStatusForm(!showStatusForm)}
                  className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 text-sm"
                >
                  {showStatusForm ? '✕ ปิด' : '+ เปลี่ยนสถานะ'}
                </button>

                {showStatusForm && (
                  <form onSubmit={handleStatusChange} className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 space-y-3">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">สถานะใหม่ *</label>
                      <select
                        value={statusForm.new_status}
                        onChange={e => setStatusForm({ ...statusForm, new_status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="available">✅ พร้อมใช้งาน</option>
                        <option value="in_use">🔵 กำลังใช้งาน</option>
                        <option value="maintenance">🔧 ซ่อมแซม</option>
                        <option value="retired">❌ เลิกใช้</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">เหตุผล</label>
                      <input
                        type="text"
                        value={statusForm.reason}
                        onChange={e => setStatusForm({ ...statusForm, reason: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="เช่น: ซ่อมวงจร, ส่งให้เช่า"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">หมายเหตุเพิ่มเติม</label>
                      <textarea
                        value={statusForm.notes}
                        onChange={e => setStatusForm({ ...statusForm, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="2"
                        placeholder="บันทึกเพิ่มเติม"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                    >
                      ✓ บันทึกการเปลี่ยนแปลง
                    </button>
                  </form>
                )}

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {statusHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>ไม่มีประวัติการเปลี่ยนแปลง</p>
                    </div>
                  ) : (
                    statusHistory.map((entry, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`px-2 py-1 rounded text-xs font-bold border ${statusColors[entry.old_status]}`}>
                            {statusLabels[entry.old_status] || entry.old_status}
                          </div>
                          <span className="text-gray-500">→</span>
                          <div className={`px-2 py-1 rounded text-xs font-bold border ${statusColors[entry.new_status]}`}>
                            {statusLabels[entry.new_status] || entry.new_status}
                          </div>
                        </div>
                        
                        {entry.reason && <p className="text-sm text-gray-700"><strong>เหตุผล:</strong> {entry.reason}</p>}
                        {entry.notes && <p className="text-sm text-gray-600"><strong>หมายเหตุ:</strong> {entry.notes}</p>}
                        
                        <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                          <span>{entry.first_name} {entry.last_name}</span>
                          <span>{new Date(entry.created_at).toLocaleString('th-TH')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg font-medium">👈 เลือกเครื่องมือจากรายการด้านซ้าย</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatusTracker;
