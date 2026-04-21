import React, { useState, useEffect } from 'react';

function Management() {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('building'); // building, room, instrument
  const [parentId, setParentId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', rules: '' });
  const [files, setFiles] = useState({ image: null, manual: null });

  const fetchTree = async () => {
    try {
      const response = await fetch('http://localhost/api/get_tree.php');
      const data = await response.json();
      setTreeData(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('type', modalType);
    data.append('name', formData.name);
    if (modalType === 'room') data.append('building_id', parentId);
    if (modalType === 'instrument') {
      data.append('room_id', parentId);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('rules', formData.rules);
      if (files.image) data.append('image', files.image);
      if (files.manual) data.append('manual', files.manual);
    }

    try {
      const response = await fetch('http://localhost/api/add_item.php', {
        method: 'POST',
        body: data,
      });
      if (response.ok) {
        alert('เพิ่มสำเร็จ!');
        setShowModal(false);
        setFormData({ name: '', description: '', price: '', rules: '' });
        fetchTree();
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  const openModal = (type, pid = null) => {
    setModalType(type);
    setParentId(pid);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">จัดการข้อมูลเครื่องมือ</h2>
          <button onClick={() => openModal('building')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + เพิ่มอาคาร
          </button>
        </div>

        {loading ? <p>กำลังโหลด...</p> : (
          <div className="space-y-4">
            {treeData.map(building => (
              <div key={building.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
                <div className="flex justify-between">
                  <span className="font-bold text-blue-800">🏢 {building.name}</span>
                  <button onClick={() => openModal('room', building.id)} className="text-xs text-blue-600 hover:underline">+ เพิ่มห้อง</button>
                </div>
                
                <div className="ml-6 mt-2 space-y-2">
                  {building.rooms.map(room => (
                    <div key={room.id} className="border-l-4 border-green-500 pl-4 py-1 bg-green-50 rounded-r-lg">
                      <div className="flex justify-between">
                        <span className="font-semibold text-green-800">🚪 {room.name}</span>
                        <button onClick={() => openModal('instrument', room.id)} className="text-xs text-green-600 hover:underline">+ เพิ่มเครื่องมือ</button>
                      </div>

                      <div className="ml-6 mt-1 space-y-1">
                        {room.instruments.map(inst => (
                          <div key={inst.id} className="text-sm text-gray-700 flex justify-between bg-white p-2 rounded shadow-sm">
                            <span>🛠️ {inst.name} ({inst.price}.-)</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${inst.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {inst.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">เพิ่ม {modalType}</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input type="text" placeholder="ชื่อ" className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              
              {modalType === 'instrument' && (
                <>
                  <textarea placeholder="คำอธิบาย" className="w-full p-2 border rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  <input type="number" placeholder="ราคา" className="w-full p-2 border rounded" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  <textarea placeholder="กฎการใช้เครื่อง" className="w-full p-2 border rounded" value={formData.rules} onChange={e => setFormData({...formData, rules: e.target.value})} />
                  <div>
                    <label className="text-xs text-gray-500">รูปภาพเครื่องมือ</label>
                    <input type="file" className="w-full text-xs" onChange={e => setFiles({...files, image: e.target.files[0]})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">ไฟล์คู่มือ (PDF)</label>
                    <input type="file" className="w-full text-xs" onChange={e => setFiles({...files, manual: e.target.files[0]})} />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Management;