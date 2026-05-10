import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function BuildingRoomManager({ user }) {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [buildingForm, setBuildingForm] = useState({ name: '', code: '' });
  const [roomForm, setRoomForm] = useState({ room_number: '', name: '', floor: '', description: '' });
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load buildings
  const loadBuildings = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiEndpoints.getBuildings());
      const data = await res.json();
      setBuildings(data);
    } catch (err) {
      console.error('Error loading buildings:', err);
      alert('Failed to load buildings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  // Handle Building Add/Edit
  const handleSaveBuilding = async (e) => {
    e.preventDefault();
    
    if (!buildingForm.name.trim()) {
      alert('ชื่ออาคารห้ามว่าง');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', buildingForm.name);
      if (buildingForm.code) formData.append('code', buildingForm.code);
      
      let endpoint;
      if (editingBuilding) {
        formData.append('id', editingBuilding.id);
        endpoint = apiEndpoints.updateBuilding();
      } else {
        endpoint = apiEndpoints.addBuilding();
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert(editingBuilding ? 'อัปเดตอาคารสำเร็จ' : 'เพิ่มอาคารสำเร็จ');
        setShowBuildingModal(false);
        setBuildingForm({ name: '', code: '' });
        setEditingBuilding(null);
        loadBuildings();
      } else {
        alert('เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Error saving building:', err);
      alert('Error saving building');
    }
  };

  // Handle Room Add/Edit
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    
    if (!roomForm.room_number.trim() || !selectedBuilding) {
      alert('ห้องและเลขห้องห้ามว่าง');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('building_id', selectedBuilding);
      formData.append('room_number', roomForm.room_number);
      formData.append('name', roomForm.name || roomForm.room_number);
      if (roomForm.floor) formData.append('floor', roomForm.floor);
      if (roomForm.description) formData.append('description', roomForm.description);

      let endpoint;
      if (editingRoom) {
        formData.append('id', editingRoom.id);
        endpoint = apiEndpoints.updateRoom();
      } else {
        endpoint = apiEndpoints.addRoom();
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert(editingRoom ? 'อัปเดตห้องสำเร็จ' : 'เพิ่มห้องสำเร็จ');
        setShowRoomModal(false);
        setRoomForm({ room_number: '', name: '', floor: '', description: '' });
        setEditingRoom(null);
        loadBuildings();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Error saving room:', err);
      alert('Error saving room');
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const formData = new FormData();
      
      let endpoint;
      if (deleteConfirm.type === 'building') {
        formData.append('id', deleteConfirm.id);
        endpoint = apiEndpoints.deleteBuilding();
      } else {
        formData.append('id', deleteConfirm.id);
        endpoint = apiEndpoints.deleteRoom();
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert(deleteConfirm.type === 'building' ? 'ลบอาคารสำเร็จ' : 'ลบห้องสำเร็จ');
        setDeleteConfirm(null);
        loadBuildings();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'ไม่สามารถลบได้');
      }
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Error deleting');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  const selectedBuildingData = buildings.find(b => b.id === selectedBuilding);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#2B2B2B' }}>🏢 จัดการอาคารและห้อง</h1>
            <p className="text-sm mt-1" style={{ color: '#6b5a47' }}>เพิ่ม แก้ไข ลบ อาคารและห้องในศูนย์ศึกษา</p>
          </div>
          <button
            onClick={() => {
              setEditingBuilding(null);
              setBuildingForm({ name: '', code: '' });
              setShowBuildingModal(true);
            }}
            className="text-white px-6 py-3 rounded-lg font-bold"
            style={{ backgroundColor: '#F27C38' }}
          >
            + เพิ่มอาคารใหม่
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buildings List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-h-[70vh] overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">รายชื่ออาคาร</h2>
          <div className="space-y-2">
            {buildings.length === 0 ? (
              <p className="text-gray-400 text-sm">ยังไม่มีอาคาร</p>
            ) : (
              buildings.map(building => (
                <div
                  key={building.id}
                  onClick={() => setSelectedBuilding(building.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    selectedBuilding === building.id
                      ? ''
                      : 'bg-gray-50 border-transparent hover:bg-gray-100'
                  }`}
                  style={selectedBuilding === building.id ? { backgroundColor: '#EAD7C2', borderColor: '#C9A44C', color: '#2B2B2B' } : {}}
                >
                  <p className="font-bold">{building.name}</p>
                  <p className="text-xs text-gray-500">{building.code}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rooms List & Details */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedBuilding ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-400 font-medium">เลือกอาคารจากรายชื่อทางซ้าย</p>
            </div>
          ) : (
            <>
              {/* Building Details */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedBuildingData?.name}</h2>
                    <p className="text-gray-500 text-sm mt-1">รหัส: {selectedBuildingData?.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingBuilding(selectedBuildingData);
                        setBuildingForm({
                          name: selectedBuildingData?.name || '',
                          code: selectedBuildingData?.code || ''
                        });
                        setShowBuildingModal(true);
                      }}
                      className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg font-bold hover:bg-yellow-100 border border-yellow-200"
                    >
                      ✏️ แก้ไข
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'building', id: selectedBuilding })}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 border border-red-200"
                    >
                      🗑️ ลบ
                    </button>
                  </div>
                </div>
              </div>

              {/* Rooms */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">ห้องในอาคาร</h3>
                  <button
                    onClick={() => {
                      setEditingRoom(null);
                      setRoomForm({ room_number: '', name: '', floor: '', description: '' });
                      setShowRoomModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                  >
                    + เพิ่มห้อง
                  </button>
                </div>

                {!selectedBuildingData?.rooms || selectedBuildingData.rooms.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">ยังไม่มีห้องในอาคารนี้</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBuildingData.rooms.map(room => (
                      <div key={room.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-gray-900">{room.name || room.room_number}</p>
                            <p className="text-xs text-gray-500">ห้องที่ {room.room_number}</p>
                            {room.floor && <p className="text-xs text-gray-500">ชั้น {room.floor}</p>}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingRoom(room);
                                setRoomForm({
                                  room_number: room.room_number,
                                  name: room.name || '',
                                  floor: room.floor || '',
                                  description: room.description || ''
                                });
                                setShowRoomModal(true);
                              }}
                              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'room', id: room.id })}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        {room.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">{room.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Building Modal */}
      {showBuildingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editingBuilding ? '✏️ แก้ไขอาคาร' : '🏢 เพิ่มอาคารใหม่'}
            </h3>
            <form onSubmit={handleSaveBuilding} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ชื่ออาคาร *</label>
                <input
                  type="text"
                  value={buildingForm.name}
                  onChange={e => setBuildingForm({ ...buildingForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น อาคาร A, ศูนย์ศึกษา"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">รหัสอาคาร (ทางเลือก)</label>
                <input
                  type="text"
                  value={buildingForm.code}
                  onChange={e => setBuildingForm({ ...buildingForm, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น BLD-A"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBuildingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  {editingBuilding ? 'อัปเดต' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editingRoom ? '✏️ แก้ไขห้อง' : '🚪 เพิ่มห้องใหม่'}
            </h3>
            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">เลขห้อง *</label>
                <input
                  type="text"
                  value={roomForm.room_number}
                  onChange={e => setRoomForm({ ...roomForm, room_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น 101, A1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อห้อง (ทางเลือก)</label>
                <input
                  type="text"
                  value={roomForm.name}
                  onChange={e => setRoomForm({ ...roomForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น ห้องศึกษา, Lab 1"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ชั้น (ทางเลือก)</label>
                <input
                  type="number"
                  value={roomForm.floor}
                  onChange={e => setRoomForm({ ...roomForm, floor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น 1, 2, 3"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">คำอธิบาย (ทางเลือก)</label>
                <textarea
                  value={roomForm.description}
                  onChange={e => setRoomForm({ ...roomForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น ห้องสำหรับทดลองฟิสิกส์"
                  rows="2"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                >
                  {editingRoom ? 'อัปเดต' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">⚠️ ยืนยันการลบ</h3>
            <p className="text-gray-600 mb-6">
              {deleteConfirm.type === 'building'
                ? 'คุณแน่ใจหรือว่าต้องการลบอาคารนี้? การลบจะส่งผลต่อห้องและเครื่องมือด้วย'
                : 'คุณแน่ใจหรือว่าต้องการลบห้องนี้?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
              >
                ลบเลย
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuildingRoomManager;
