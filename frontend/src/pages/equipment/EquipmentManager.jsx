import React, { useState, useEffect } from 'react';
import { apiEndpoints, getImageUrl } from '../../api';
import MainLayout from '../../components/MainLayout';
import Modal from '../../components/Modal';
import QRCode from './QRCode';

function EquipmentManager() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showQrModal, setShowQrModal] = useState(null); 

  // Forms
  const [equipmentForm, setEquipmentForm] = useState({
    name: '', code: '', brand: '', model: '', serial_number: '',
    purchase_price: '', status: 'available', description: '',
    usage_rules: '', is_bookable: true, room_id: ''
  });
  const [buildingForm, setBuildingForm] = useState({ name: '', code: '' });
  const [roomForm, setRoomForm] = useState({ room_number: '', name: '', floor: '', description: '', building_id: '' });
  
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiEndpoints.getTree());
      const json = await res.json();
      const flatData = json.data || [];
      
      const grouped = [];
      flatData.forEach(item => {
        let building = grouped.find(b => b.id === item.b_id);
        if (!building) {
          building = { id: item.b_id, name: item.b_name, code: item.b_code, rooms: [] };
          grouped.push(building);
        }
        
        let room = building.rooms.find(r => r.id === item.r_id);
        if (!room) {
          room = { id: item.r_id, name: item.r_name, room_number: item.room_number, floor: item.floor, instruments: [] };
          building.rooms.push(room);
        }
        
        if (item.i_id) { 
          room.instruments.push({
            id: item.i_id,
            name: item.i_name,
            code: item.code || '-',
            brand: item.brand,
            model: item.model,
            status: item.i_status,
            purchase_price: item.i_price,
            thumbnail: item.thumbnail,
            serial_number: item.serial_number,
            is_bookable: item.is_bookable,
            description: item.description,
            usage_rules: item.usage_rules,
            qr_token: item.i_qr
          });
        }
      });

      setTree(grouped);
    } catch (err) {
      console.error('Error loading tree:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBuilding = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('name', buildingForm.name);
      if (buildingForm.code) form.append('code', buildingForm.code);
      let endpoint = apiEndpoints.addBuilding();
      if (editingItem?.type === 'building') {
        form.append('id', editingItem.data.id);
        endpoint = apiEndpoints.updateBuilding();
      }
      const res = await fetch(endpoint, { method: 'POST', body: form });
      if (res.ok) {
        setShowBuildingModal(false);
        setEditingItem(null);
        loadTree();
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('building_id', selectedBuilding || roomForm.building_id);
      form.append('room_number', roomForm.room_number);
      form.append('name', roomForm.name || roomForm.room_number);
      if (roomForm.floor) form.append('floor', roomForm.floor);
      if (roomForm.description) form.append('description', roomForm.description);
      let endpoint = apiEndpoints.addRoom();
      if (editingItem?.type === 'room') {
        form.append('id', editingItem.data.id);
        endpoint = apiEndpoints.updateRoom();
      }
      const res = await fetch(endpoint, { method: 'POST', body: form });
      if (res.ok) {
        setShowRoomModal(false);
        setEditingItem(null);
        loadTree();
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveEquipment = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      if (editingItem?.type === 'instrument') {
        form.append('id', editingItem.data.id);
        form.append('name', equipmentForm.name);
        form.append('code', equipmentForm.code);
        form.append('brand', equipmentForm.brand);
        form.append('model', equipmentForm.model);
        form.append('purchase_price', equipmentForm.purchase_price);
        form.append('usage_rules', equipmentForm.usage_rules);
        form.append('description', equipmentForm.description);
        form.append('status', equipmentForm.status);
        form.append('room_id', equipmentForm.room_id || selectedRoom);
        form.append('is_bookable', equipmentForm.is_bookable ? 1 : 0);
        if (imageFile) form.append('thumbnail', imageFile);
      } else {
        form.append('type', 'instrument');
        form.append('name', equipmentForm.name);
        form.append('code', equipmentForm.code);
        form.append('brand', equipmentForm.brand);
        form.append('model', equipmentForm.model);
        form.append('price', equipmentForm.purchase_price);
        form.append('rules', equipmentForm.usage_rules);
        form.append('description', equipmentForm.description);
        form.append('status', equipmentForm.status);
        form.append('room_id', selectedRoom || equipmentForm.room_id);
        if (imageFile) form.append('image', imageFile);
      }
      let endpoint = editingItem?.type === 'instrument' ? apiEndpoints.updateEquipment() : apiEndpoints.addItem();
      const res = await fetch(endpoint, { method: 'POST', body: form });
      if (res.ok) {
        setShowEquipmentModal(false);
        setEditingItem(null);
        setImageFile(null);
        setImagePreview(null);
        loadTree();
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    try {
      const form = new FormData();
      form.append('id', showDeleteConfirm.id);
      let endpoint;
      if (showDeleteConfirm.type === 'building') endpoint = apiEndpoints.deleteBuilding();
      else if (showDeleteConfirm.type === 'room') endpoint = apiEndpoints.deleteRoom();
      else endpoint = apiEndpoints.deleteEquipment();
      const res = await fetch(endpoint, { method: 'POST', body: form });
      if (res.ok) {
        setShowDeleteConfirm(null);
        if (showDeleteConfirm.type === 'building' && selectedBuilding === showDeleteConfirm.id) setSelectedBuilding(null);
        if (showDeleteConfirm.type === 'room' && selectedRoom === showDeleteConfirm.id) setSelectedRoom(null);
        loadTree();
      }
    } catch (err) { console.error(err); }
  };

  const activeBuilding = tree.find(b => b.id === selectedBuilding);
  const activeRoom = activeBuilding?.rooms?.find(r => r.id === selectedRoom);
  const instrumentsInRoom = activeRoom?.instruments || [];
  const filteredInstruments = instrumentsInRoom.filter(inst => 
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    available: instrumentsInRoom.filter(i => i.status === 'available').length,
    inUse: instrumentsInRoom.filter(i => i.status === 'in_use').length,
    maintenance: instrumentsInRoom.filter(i => i.status === 'maintenance').length,
    totalValue: instrumentsInRoom.reduce((sum, i) => sum + (parseFloat(i.purchase_price) || 0), 0)
  };

  return (
    <MainLayout title="📦 จัดการอุปกรณ์" subtitle="บริหารจัดการอาคาร ห้อง และเครื่องมือวิจัย">
      {loading && tree.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
          <p className="text-stone-500 font-medium font-inter">กำลังโหลดข้อมูลโครงสร้าง...</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[70vh] font-inter">
          {/* Left Panel - Tree View */}
          <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 custom-scrollbar overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-brand-charcoal uppercase tracking-wider">ผังอาคารและห้อง</h3>
              <button onClick={() => { setEditingItem(null); setBuildingForm({name:'', code:''}); setShowBuildingModal(true); }} className="text-brand-orange hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xl">add_circle</span>
              </button>
            </div>
            
            <div className="space-y-2">
              {tree.map(building => (
                <div key={building.id} className="space-y-1">
                  <div 
                    className={`flex items-center justify-between group px-3 py-2.5 rounded-xl cursor-pointer transition-all ${selectedBuilding === building.id ? 'bg-brand-sand/30 text-brand-charcoal' : 'hover:bg-stone-50'}`}
                    onClick={() => { setSelectedBuilding(building.id); setSelectedRoom(null); }}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`material-symbols-outlined text-lg transition-transform ${selectedBuilding === building.id ? 'rotate-90 text-brand-gold' : 'text-stone-300'}`}>chevron_right</span>
                      <span className={`material-symbols-outlined text-lg ${selectedBuilding === building.id ? 'text-brand-orange' : 'text-stone-400'}`}>domain</span>
                      <span className={`text-sm font-bold truncate ${selectedBuilding === building.id ? 'text-brand-charcoal' : 'text-stone-600'}`}>{building.name}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setEditingItem({type:'building', data: building}); setBuildingForm({name: building.name, code: building.code || ''}); setShowBuildingModal(true); }} className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-brand-gold transition-opacity">
                      <span className="material-symbols-outlined text-xs">edit</span>
                    </button>
                  </div>

                  {selectedBuilding === building.id && (
                    <div className="ml-5 pl-4 border-l-2 border-brand-sand space-y-1 mt-1">
                      {building.rooms?.map(room => (
                        <div 
                          key={room.id}
                          className={`flex items-center justify-between group px-3 py-2 rounded-lg cursor-pointer transition-all ${selectedRoom === room.id ? 'bg-brand-orange text-white' : 'hover:bg-stone-50 text-stone-600'}`}
                          onClick={() => setSelectedRoom(room.id)}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className={`material-symbols-outlined text-sm ${selectedRoom === room.id ? 'text-white' : 'text-stone-400'}`}>science</span>
                            <span className="text-xs font-bold truncate">{room.name || room.room_number}</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setEditingItem({type:'room', data: room}); setRoomForm({room_number: room.room_number, name: room.name || '', floor: room.floor || '', description: room.description || '', building_id: building.id}); setShowRoomModal(true); }} className={`opacity-0 group-hover:opacity-100 p-1 transition-opacity ${selectedRoom === room.id ? 'text-white' : 'text-stone-400 hover:text-brand-gold'}`}>
                            <span className="material-symbols-outlined text-xs">edit</span>
                          </button>
                        </div>
                      ))}
                      <button onClick={() => { setEditingItem(null); setRoomForm({room_number:'', name:'', floor:'', description:'', building_id: building.id}); setShowRoomModal(true); }} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-400 hover:text-brand-gold transition-colors">
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span>เพิ่มห้อง</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Content Area */}
          <div className="flex-1 min-0">
            {!selectedRoom ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-stone-200 h-full flex flex-col items-center justify-center p-12 text-center shadow-inner">
                <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-stone-200">location_on</span>
                </div>
                <h4 className="text-lg font-black text-brand-charcoal">กรุณาเลือกสถานที่</h4>
                <p className="text-stone-400 max-w-xs mt-2 font-medium">เลือกอาคารและห้องจากรายการด้านซ้ายเพื่อจัดการเครื่องมือ</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Header & Stats */}
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                      <div className="flex items-center gap-2 text-brand-gold font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                        <span>{activeBuilding?.name}</span>
                        <span className="material-symbols-outlined text-[8px] font-black">arrow_forward_ios</span>
                        <span>ชั้น {activeRoom?.floor || '-'}</span>
                      </div>
                      <h2 className="text-3xl font-black text-brand-charcoal flex items-center gap-3 tracking-tight">
                        {activeRoom?.name || activeRoom?.room_number}
                        <span className="text-[11px] font-black bg-stone-100 text-stone-500 px-3 py-1 rounded-full uppercase tracking-widest">{instrumentsInRoom.length} Items</span>
                      </h2>
                    </div>
                    <div className="flex gap-3">
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-black">search</span>
                        <input type="text" placeholder="ค้นหาเครื่องมือ..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="pl-11 pr-4 py-2.5 bg-stone-50 border-none rounded-2xl text-sm w-52 focus:ring-4 focus:ring-brand-gold/10 transition-all font-bold placeholder:text-stone-300" />
                      </div>
                      <button onClick={() => { setEditingItem(null); setEquipmentForm({name:'', code:'', brand:'', model:'', serial_number:'', purchase_price:'', status:'available', description:'', usage_rules:'', is_bookable:true, room_id: selectedRoom}); setImageFile(null); setImagePreview(null); setShowEquipmentModal(true); }} className="bg-brand-charcoal text-charcoal-gray px-7 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 shadow-xl shadow-stone-200 hover:bg-brand-orange hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
                        <span className="material-symbols-outlined text-sm font-black">add_circle</span>
                        <span>เพิ่มเครื่องมือ</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard icon="check_circle" label="พร้อมใช้งาน" value={stats.available} color="text-emerald-500" bgColor="bg-emerald-50" />
                    <StatCard icon="sync" label="ใช้งานอยู่" value={stats.inUse} color="text-brand-orange" bgColor="bg-brand-orange/5" />
                    <StatCard icon="build" label="ซ่อมบำรุง" value={stats.maintenance} color="text-brand-gold" bgColor="bg-brand-gold/5" />
                    <StatCard icon="payments" label="มูลค่ารวม" value={`฿${stats.totalValue.toLocaleString()}`} color="text-brand-charcoal" bgColor="bg-brand-sand/20" />
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50/50 border-b border-stone-100 uppercase tracking-widest text-[10px] font-black text-stone-400">
                          <th className="px-6 py-5">Equipment Details</th>
                          <th className="px-6 py-5">Code / Model</th>
                          <th className="px-6 py-5 text-center">Status</th>
                          <th className="px-6 py-5 text-right">Value</th>
                          <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {filteredInstruments.map(inst => (
                          <tr key={inst.id} className="hover:bg-stone-50/50 transition-colors group">
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200 shadow-inner">
                                  {inst.thumbnail ? <img src={getImageUrl(inst.thumbnail)} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" alt={inst.name} /> : <div className="w-full h-full flex items-center justify-center text-stone-300"><span className="material-symbols-outlined">image</span></div>}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-brand-charcoal mb-0.5">{inst.name}</p>
                                  <p className="text-[10px] text-brand-gold font-black uppercase tracking-tighter">{inst.brand || 'Research Instrument'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <span className="text-[11px] font-mono font-bold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm">{inst.code}</span>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <StatusBadge status={inst.status} />
                            </td>
                            <td className="px-6 py-6 text-right text-sm font-black text-brand-charcoal">฿{(parseFloat(inst.purchase_price)||0).toLocaleString()}</td>
                            <td className="px-6 py-6 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <button onClick={() => setShowQrModal(inst)} className="p-2.5 bg-white border border-stone-100 rounded-xl text-brand-orange hover:text-brand-orange hover:shadow-lg transition-all shadow-sm flex items-center justify-center">
                                  <span className="material-symbols-outlined text-lg font-black">qr_code_2</span>
                                </button>
                                <button onClick={() => { setEditingItem({type:'instrument', data:inst}); setEquipmentForm({...inst}); setImagePreview(inst.thumbnail?getImageUrl(inst.thumbnail):null); setShowEquipmentModal(true); }} className="p-2.5 bg-white border border-stone-100 rounded-xl text-stone-400 hover:text-brand-gold hover:shadow-lg transition-all shadow-sm">
                                  <span className="material-symbols-outlined text-lg font-black">edit</span>
                                </button>
                                <button onClick={() => setShowDeleteConfirm({type:'instrument', id:inst.id, name:inst.name})} className="p-2.5 bg-white border border-stone-100 rounded-xl text-stone-300 hover:text-red-500 hover:shadow-lg transition-all shadow-sm">
                                  <span className="material-symbols-outlined text-lg font-black">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <Modal 
        isOpen={!!showQrModal} 
        onClose={() => setShowQrModal(null)} 
        title="QR Code สำหรับลงทะเบียน"
        maxWidth="max-w-sm"
      >
        {showQrModal && (
          <div className="space-y-6 text-center p-4">
            <QRCode value={showQrModal.qr_token} />
            <div className="bg-brand-sand/10 p-5 rounded-3xl space-y-1 text-left border border-brand-sand/20 shadow-inner">
              <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-1">Equipment Registration</p>
              <p className="text-base font-black text-brand-charcoal tracking-tight">{showQrModal.name}</p>
              <p className="text-[10px] text-stone-500 font-bold font-mono">CODE: {showQrModal.code}</p>
            </div>
            <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest leading-relaxed px-4">
              * สแกนเพื่อลงทะเบียนเข้าใช้งานเครื่องมือในระบบ LabFlow *
            </p>
          </div>
        )}
      </Modal>

      {/* Equipment Modal (BRANDED DESIGN) */}
      <Modal isOpen={showEquipmentModal} onClose={()=>setShowEquipmentModal(false)} title={editingItem ? 'แก้ไขข้อมูลเครื่องมือ' : 'เพิ่มเครื่องมือวิจัยใหม่'} maxWidth="max-w-5xl">
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar max-h-[80vh]">
          <form onSubmit={handleSaveEquipment} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* ส่วนซ้าย: รูปภาพและคำอธิบาย */}
              <div className="lg:col-span-5 space-y-7">
                <div>
                  <label className="text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] mb-4 block">Visual Specification</label>
                  <div onClick={() => document.getElementById('imgInp').click()} className="group relative border-2 border-dashed border-brand-sand rounded-[2.5rem] aspect-square flex flex-col items-center justify-center bg-stone-50/50 hover:bg-white hover:border-brand-orange hover:shadow-2xl hover:shadow-brand-orange/5 transition-all duration-500 cursor-pointer overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-white shadow-md flex items-center justify-center mb-5 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-brand-orange">
                          <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                        </div>
                        <p className="text-sm font-black text-brand-charcoal uppercase tracking-tight">Upload Photo</p>
                        <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-widest">PNG, JPG or WEBP</p>
                      </div>
                    )}
                    <input id="imgInp" className="hidden" accept="image/*" type="file" onChange={handleImageChange} />
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] block ml-1">Technical Notes</label>
                  <textarea rows="5" placeholder="ระบุรายละเอียดทางเทคนิค สเปค หรือจุดเด่นของเครื่องมือ..." className="w-full border-none bg-stone-50 rounded-[2rem] text-sm p-6 focus:ring-4 focus:ring-brand-gold/10 focus:bg-white transition-all min-h-[160px] placeholder:text-stone-300 font-medium" value={equipmentForm.description || ''} onChange={e => setEquipmentForm({...equipmentForm, description: e.target.value})} />
                </div>
              </div>

              {/* ส่วนขวา: ข้อมูลรายละเอียด */}
              <div className="lg:col-span-7 space-y-8">
                <div className="bg-brand-sand/10 p-1.5 rounded-[3rem]">
                  <div className="bg-white rounded-[2.5rem] border border-brand-sand/30 p-8 md:p-10 shadow-sm space-y-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-black text-brand-charcoal uppercase tracking-widest ml-1 opacity-60">ชื่อเครื่องมือ</label>
                        <input required className="w-full border-stone-100 bg-stone-50 rounded-2xl text-sm px-5 py-4 focus:ring-4 focus:ring-brand-orange/5 focus:bg-white focus:border-brand-orange/20 transition-all placeholder:text-stone-300 font-bold" type="text" placeholder="UV-Vis Spectrometer" value={equipmentForm.name || ''} onChange={e => setEquipmentForm({...equipmentForm, name: e.target.value})} />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-black text-brand-charcoal uppercase tracking-widest ml-1 opacity-60">รหัสควบคุม</label>
                        <input className="w-full border-stone-100 bg-stone-50 rounded-2xl text-sm px-5 py-4 focus:ring-4 focus:ring-brand-orange/5 focus:bg-white transition-all font-mono font-bold text-brand-gold" type="text" placeholder="IS-2024-XXXX" value={equipmentForm.code || ''} onChange={e => setEquipmentForm({...equipmentForm, code: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-black text-brand-charcoal uppercase tracking-widest ml-1 opacity-60">ยี่ห้อ (Brand)</label>
                        <input className="w-full border-stone-100 bg-stone-50 rounded-2xl text-sm px-5 py-4 focus:ring-4 focus:ring-brand-orange/5 focus:bg-white transition-all font-bold" type="text" placeholder="Shimadzu" value={equipmentForm.brand || ''} onChange={e => setEquipmentForm({...equipmentForm, brand: e.target.value})} />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-black text-brand-charcoal uppercase tracking-widest ml-1 opacity-60">รุ่น (Model)</label>
                        <input className="w-full border-stone-100 bg-stone-50 rounded-2xl text-sm px-5 py-4 focus:ring-4 focus:ring-brand-orange/5 focus:bg-white transition-all font-bold" type="text" placeholder="UV-2600i" value={equipmentForm.model || ''} onChange={e => setEquipmentForm({...equipmentForm, model: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-black text-brand-charcoal uppercase tracking-widest ml-1 opacity-60">ราคา (บาท)</label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-gold font-black text-sm">฿</span>
                          <input className="w-full border-stone-100 bg-stone-50 rounded-2xl text-sm pl-9 pr-5 py-4 focus:ring-4 focus:ring-brand-orange/5 focus:bg-white transition-all font-black text-brand-orange" type="number" placeholder="0.00" value={equipmentForm.purchase_price || ''} onChange={e => setEquipmentForm({...equipmentForm, purchase_price: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-black text-brand-charcoal uppercase tracking-widest ml-1 opacity-60">สถานะเริ่มต้น</label>
                        <select className="w-full border-stone-100 bg-stone-50 rounded-2xl text-sm px-5 py-4 focus:ring-4 focus:ring-brand-orange/5 focus:bg-white transition-all appearance-none font-bold text-brand-charcoal" value={equipmentForm.status || 'available'} onChange={e => setEquipmentForm({...equipmentForm, status: e.target.value})}>
                          <option value="available">🟢 Ready to Use</option>
                          <option value="in_use">🔵 Busy / In Use</option>
                          <option value="maintenance">🟡 Maintenance</option>
                          <option value="retired">🔴 Decommissioned</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-[11px] font-black text-brand-charcoal uppercase tracking-widest ml-1 opacity-60">กฎการใช้งาน / Safety Rules</label>
                      <textarea rows="3" placeholder="ระบุข้อระวังความปลอดภัย หรือขั้นตอนการใช้งาน..." className="w-full border-stone-100 bg-stone-50 rounded-2xl text-sm p-5 focus:ring-4 focus:ring-brand-orange/5 focus:bg-white transition-all placeholder:text-stone-300 font-medium" value={equipmentForm.usage_rules || ''} onChange={e => setEquipmentForm({...equipmentForm, usage_rules: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-5 pt-8 border-t border-stone-100">
              <button type="button" onClick={() => setShowEquipmentModal(false)} className="px-10 py-4 text-sm font-black text-stone-400 hover:text-brand-charcoal hover:bg-stone-50 rounded-2xl transition-all uppercase tracking-widest">Cancel</button>
              <button type="submit" className="bg-brand-charcoal text-charcoal-gray px-14 py-4 rounded-[1.5rem] text-sm font-black shadow-2xl shadow-stone-200 hover:bg-brand-orange hover:-translate-y-1 active:scale-95 transition-all duration-500 uppercase tracking-widest">
                {editingItem ? 'Update Device' : 'Register Instrument'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Small Modals (Branded) */}
      <Modal isOpen={showBuildingModal} onClose={()=>setShowBuildingModal(false)} title={editingItem ? 'Edit Building' : 'Add New Building'}>
        <form onSubmit={handleSaveBuilding} className="space-y-5 p-2">
          <div className="space-y-1.5"><label className="text-[11px] font-black text-brand-gold uppercase tracking-widest ml-1">Building Name</label><input type="text" required className="w-full border-stone-100 bg-stone-50 rounded-2xl text-sm px-4 py-3.5 focus:ring-4 focus:ring-brand-gold/10 font-bold" value={buildingForm.name || ''} onChange={e=>setBuildingForm({...buildingForm, name: e.target.value})} /></div>
          <div className="space-y-1.5"><label className="text-[11px] font-black text-brand-gold uppercase tracking-widest ml-1">Building Code</label><input type="text" className="w-full border-stone-100 bg-stone-50 rounded-2xl text-sm px-4 py-3.5 focus:ring-4 focus:ring-brand-gold/10 font-mono font-bold" value={buildingForm.code || ''} onChange={e=>setBuildingForm({...buildingForm, code: e.target.value})} /></div>
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={()=>setShowBuildingModal(false)} className="px-5 py-3 text-sm font-bold text-stone-400">Cancel</button>
            {editingItem && <button type="button" onClick={()=>setShowDeleteConfirm({type:'building', id:editingItem.data.id, name:editingItem.data.name})} className="text-red-500 text-sm font-bold px-4">Delete</button>}
            <button type="submit" className="bg-brand-charcoal text-white px-8 py-3 rounded-xl text-sm font-black shadow-lg shadow-stone-100 hover:bg-brand-orange transition-all">Save Building</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showRoomModal} onClose={()=>setShowRoomModal(false)} title={editingItem ? 'Edit Room' : 'Add New Room'}>
        <form onSubmit={handleSaveRoom} className="space-y-5 p-2">
          <div className="grid grid-cols-2 gap-5"><div className="space-y-1.5"><label className="text-[11px] font-black text-brand-gold uppercase tracking-widest ml-1">Room No.</label><input type="text" required className="w-full border-stone-100 bg-stone-50 rounded-2xl text-sm px-4 py-3.5 focus:ring-4 focus:ring-brand-gold/10 font-bold" value={roomForm.room_number || ''} onChange={e=>setRoomForm({...roomForm, room_number: e.target.value})} /></div><div className="space-y-1.5"><label className="text-[11px] font-black text-brand-gold uppercase tracking-widest ml-1">Floor</label><input type="text" className="w-full border-stone-100 bg-stone-50 rounded-2xl text-sm px-4 py-3.5 focus:ring-4 focus:ring-brand-gold/10 font-bold text-center" value={roomForm.floor || ''} onChange={e=>setRoomForm({...roomForm, floor: e.target.value})} /></div></div>
          <div className="space-y-1.5"><label className="text-[11px] font-black text-brand-gold uppercase tracking-widest ml-1">Display Name</label><input type="text" className="w-full border-stone-100 bg-stone-50 rounded-2xl text-sm px-4 py-3.5 focus:ring-4 focus:ring-brand-gold/10 font-bold" value={roomForm.name || ''} onChange={e=>setRoomForm({...roomForm, name: e.target.value})} /></div>
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={()=>setShowRoomModal(false)} className="px-5 py-3 text-sm font-bold text-stone-400">Cancel</button>
            {editingItem && <button type="button" onClick={()=>setShowDeleteConfirm({type:'room', id:editingItem.data.id, name:editingItem.data.name||editingItem.data.room_number})} className="text-red-500 text-sm font-bold px-4">Delete</button>}
            <button type="submit" className="bg-brand-charcoal text-white px-8 py-3 rounded-xl text-sm font-black shadow-lg shadow-stone-100 hover:bg-brand-orange transition-all">Save Room</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!showDeleteConfirm} onClose={()=>setShowDeleteConfirm(null)} title="Confirm Destruction">
        <div className="space-y-6 text-center py-4">
          <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl shadow-red-100">
            <span className="material-symbols-outlined text-4xl">warning</span>
          </div>
          <p className="text-sm text-stone-600 font-medium px-4 leading-relaxed">
            Are you sure you want to delete <span className="font-black text-brand-charcoal">"{showDeleteConfirm?.name}"</span>? <br/>This action is permanent and cannot be reversed.
          </p>
          <div className="flex flex-col gap-3 px-4 pt-4">
            <button onClick={handleDelete} className="w-full bg-red-500 text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-red-200 hover:bg-red-600 transition-all uppercase tracking-widest">Delete Forever</button>
            <button onClick={()=>setShowDeleteConfirm(null)} className="w-full bg-stone-50 text-stone-400 py-4 rounded-2xl text-sm font-black hover:text-brand-charcoal transition-all uppercase tracking-widest">Keep It</button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}

function StatCard({ icon, label, value, color, bgColor }) {
  return (
    <div className="bg-white p-7 rounded-[2rem] border border-stone-100 flex items-center gap-5 shadow-sm hover:shadow-xl hover:shadow-stone-100 transition-all duration-500 group cursor-default">
      <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}><span className={`material-symbols-outlined ${color} text-2xl font-black`}>{icon}</span></div>
      <div><p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] mb-0.5">{label}</p><p className="text-xl font-black text-brand-charcoal tracking-tight group-hover:text-brand-orange transition-colors">{value}</p></div>
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    available: { label: 'Ready', class: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' },
    in_use: { label: 'In Use', class: 'bg-brand-orange/5 text-brand-orange border-brand-orange/10', dot: 'bg-brand-orange' },
    maintenance: { label: 'Fixing', class: 'bg-brand-gold/5 text-brand-gold border-brand-gold/10', dot: 'bg-brand-gold' },
    retired: { label: 'Retired', class: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-500' }
  };
  const config = configs[status] || configs.available;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${config.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`}></span>
      {config.label}
    </span>
  );
}

export default EquipmentManager;
