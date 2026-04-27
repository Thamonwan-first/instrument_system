import React, { useState, useEffect } from 'react';

function Management() {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('building');
  const [parentId, setParentId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', rules: '' });
  const [files, setFiles] = useState({ image: null, manual: null });

  const fetchTree = async () => {
    try {
      const response = await fetch('http://localhost/instrument_system/api/get_tree.php');
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
      const response = await fetch('http://localhost/instrument_system/api/add_item.php', {
        method: 'POST',
        body: data,
      });
      if (response.ok) {
        setShowModal(false);
        setFormData({ name: '', description: '', price: '', rules: '' });
        fetchTree();
      }
    } catch (err) {
      alert('Error saving data');
    }
  };

  const openModal = (type, pid = null) => {
    setModalType(type);
    setParentId(pid);
    setShowModal(true);
  };

  return (
    <div className="py-2">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="bg-blue-50 text-blue-600 p-2 rounded-lg text-xl">🏢</span> การจัดการโครงสร้างคลังเครื่องมือ
          </h3>
          <p className="text-sm text-gray-500 mt-2 font-medium">จัดการข้อมูลอาคาร ห้อง และเครื่องมือทั้งหมดภายในระบบ</p>
        </div>
        <button 
          onClick={() => openModal('building')}
          className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <span>+</span> เพิ่มอาคารใหม่
        </button>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          {[1,2].map(i => <div key={i} className="h-48 bg-white border border-gray-200 rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="space-y-8">
          {treeData.map(building => (
            <div key={building.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2.5 border border-gray-200 rounded-xl text-xl shadow-sm">🏢</div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-lg">{building.name}</h4>
                    <p className="text-xs text-gray-500 font-bold mt-1 bg-gray-200/50 px-2 py-0.5 rounded-md inline-block">จำนวน {building.rooms.length} ห้อง</p>
                  </div>
                </div>
                <button onClick={() => openModal('room', building.id)} className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-100">
                  + เพิ่มห้อง
                </button>
              </div>
              
              <div className="p-6 md:p-8 grid grid-cols-1 gap-6">
                {building.rooms.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm font-medium bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">ยังไม่มีข้อมูลห้องในอาคารนี้</div>
                ) : building.rooms.map(room => (
                  <div key={room.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></span>
                        <span className="font-extrabold text-gray-800 text-lg">{room.name}</span>
                      </div>
                      <button onClick={() => openModal('instrument', room.id)} className="text-xs font-bold bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">
                        + เพิ่มเครื่องมือ
                      </button>
                    </div>

                    {room.instruments.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-xs font-medium">ยังไม่มีเครื่องมือในห้องนี้</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {room.instruments.map(inst => (
                          <div key={inst.id} className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group relative">
                            <div className="flex justify-between items-start mb-4">
                              <div className="bg-white p-2.5 rounded-lg border border-gray-100 text-xl shadow-sm">🛠️</div>
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${inst.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                {inst.status === 'active' ? 'พร้อม' : 'ซ่อมบำรุง'}
                              </span>
                            </div>
                            <h5 className="font-bold text-gray-900 text-base truncate mb-1" title={inst.name}>{inst.name}</h5>
                            <p className="text-sm font-bold text-gray-500">{Number(inst.price).toLocaleString()} ฿</p>
                            
                            <div className="mt-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="flex-1 text-xs bg-white border border-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-50 shadow-sm">แก้ไข</button>
                              <button className="flex-1 text-xs bg-red-50 text-red-600 py-2 rounded-lg font-bold hover:bg-red-100 border border-red-100">ลบ</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900">
                เพิ่ม{modalType === 'building' ? 'อาคาร' : modalType === 'room' ? 'ห้อง' : 'เครื่องมือ'}ใหม่
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อ (Name)</label>
                <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-colors font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder={`ระบุชื่อ${modalType}`} />
              </div>
              
              {modalType === 'instrument' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">รายละเอียด (Description)</label>
                    <textarea placeholder="คำอธิบาย หรือ สเปคเครื่องมือ..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm min-h-[100px] font-medium" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ราคา/มูลค่า (Price)</label>
                    <input type="number" placeholder="เช่น 5000" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm font-medium" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">รูปภาพประกอบ (Image)</label>
                    <input type="file" className="w-full text-sm font-medium text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-dashed border-gray-300 p-2 rounded-xl bg-gray-50" onChange={e => setFiles({...files, image: e.target.files[0]})} />
                  </div>
                </>
              )}

              <div className="pt-6">
                <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-base">บันทึกข้อมูลเข้าระบบ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Management;