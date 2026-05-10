import React, { useState, useMemo, useEffect } from 'react';

const ReportIssueView = ({ treeData = [], selectedInstrument, setSelectedInstrument, repairData, setRepairData, handleRepairSubmit }) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Sync internal state if selectedInstrument is already set (e.g. from QR scan)
  useEffect(() => {
    if (selectedInstrument && treeData.length > 0) {
      // Find building and room for the selected instrument to pre-fill dropdowns
      for (const b of treeData) {
        for (const r of b.rooms) {
          if (r.instruments.some(i => String(i.i_id) === String(selectedInstrument.id))) {
            setSelectedBuildingId(String(b.b_id));
            setSelectedRoomId(String(r.r_id));
            return;
          }
        }
      }
    }
  }, [selectedInstrument, treeData]);

  // Options for Buildings
  const buildings = treeData;

  // Options for Rooms based on selected Building
  const rooms = useMemo(() => {
    const building = treeData.find(b => String(b.b_id) === String(selectedBuildingId));
    return building ? building.rooms : [];
  }, [treeData, selectedBuildingId]);

  // Options for Instruments based on selected Room
  const instruments = useMemo(() => {
    const room = rooms.find(r => String(r.r_id) === String(selectedRoomId));
    return room ? room.instruments : [];
  }, [rooms, selectedRoomId]);

  const onBuildingChange = (e) => {
    setSelectedBuildingId(e.target.value);
    setSelectedRoomId(''); // Reset room
    setSelectedInstrument(null); // Reset instrument
  };

  const onRoomChange = (e) => {
    setSelectedRoomId(e.target.value);
    setSelectedInstrument(null); // Reset instrument
  };

  const onInstrumentChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setSelectedInstrument(null);
      return;
    }
    const found = instruments.find(i => String(i.i_id) === String(val));
    if (found) {
      setSelectedInstrument({ ...found, id: found.i_id, name: found.i_name });
    }
  };

  return (
    <div className="space-y-10 font-inter">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-stone-100">
        <div className="flex items-center gap-5 mb-10">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-[1.5rem] flex items-center justify-center text-3xl border border-red-100 shadow-sm">⚠️</div>
            <div>
              <h3 className="text-2xl font-black text-brand-charcoal tracking-tight">รายงานแจ้งซ่อมเครื่องมือ</h3>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Maintenance & Issue Report</p>
            </div>
        </div>

        <form onSubmit={handleRepairSubmit} className="space-y-8 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1: Select Building */}
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">1. เลือกอาคาร</label>
              <select 
                className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-4 focus:ring-brand-orange/5 focus:bg-white outline-none transition-all font-bold text-brand-charcoal"
                required
                value={selectedBuildingId}
                onChange={onBuildingChange}
              >
                <option value="">-- เลือกอาคาร --</option>
                {buildings.map(b => (
                  <option key={b.b_id} value={b.b_id}>{b.b_name}</option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Room */}
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">2. เลือกห้อง</label>
              <select 
                className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-4 focus:ring-brand-orange/5 focus:bg-white outline-none transition-all font-bold text-brand-charcoal disabled:opacity-50"
                required
                disabled={!selectedBuildingId}
                value={selectedRoomId}
                onChange={onRoomChange}
              >
                <option value="">-- เลือกห้อง --</option>
                {rooms.map(r => (
                  <option key={r.r_id} value={r.r_id}>ห้อง {r.r_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 3: Select Instrument */}
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">3. เลือกเครื่องมือ</label>
            <select 
              className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-4 focus:ring-red-500/5 focus:bg-white outline-none transition-all font-bold text-brand-charcoal disabled:opacity-50"
              required
              disabled={!selectedRoomId}
              value={selectedInstrument?.id || ''}
              onChange={onInstrumentChange}
            >
              <option value="">-- เลือกเครื่องมือ --</option>
              {instruments.map(i => (
                <option key={i.i_id} value={i.i_id}>{i.i_name}</option>
              ))}
            </select>
          </div>

          <div className="h-px bg-stone-100 my-8"></div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">รายละเอียดอาการ</label>
            <textarea placeholder="อธิบายอาการเสีย เช่น หน้าจอไม่ติด, ปุ่มกดไม่ทำงาน..." className="w-full p-6 bg-stone-50 border border-stone-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-red-500/5 focus:bg-white focus:border-red-500/20 transition-all min-h-[150px] text-sm font-bold text-brand-charcoal shadow-inner" required value={repairData.description} onChange={e => setRepairData({...repairData, description: e.target.value})} />
          </div>
          
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">แนบรูปภาพประกอบ</label>
            <label className="w-full text-center p-12 border-2 border-dashed border-stone-200 rounded-[2rem] cursor-pointer hover:bg-stone-50 hover:border-brand-orange/30 transition-all block group relative overflow-hidden">
                <span className="text-[11px] font-black text-stone-400 uppercase tracking-[0.15em] group-hover:text-brand-orange transition-colors relative z-10">{repairData.image ? `ไฟล์ที่เลือก: ${repairData.image.name}` : '📎 คลิกเพื่อเลือกรูปภาพประกอบ'}</span>
                <input type="file" className="hidden" onChange={e => setRepairData({...repairData, image: e.target.files[0]})} />
                <div className="absolute inset-0 bg-brand-orange/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </label>
          </div>
          
          <div className="pt-4">
            <button type="submit" className="w-full py-5 bg-red-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-red-100 hover:bg-brand-charcoal hover:-translate-y-1 transition-all duration-500">ส่งข้อมูลแจ้งซ่อม</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssueView;
