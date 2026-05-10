import React, { useState, useEffect, useMemo } from 'react';
import { apiEndpoints, getImageUrl } from '../../api';

/**
 * Modern Staff Dashboard & Analytics
 * Includes: Summary Cards, Bar Chart for Repairs, and Top Users Analysis
 */
function StaffPanel({ user }) {
  const [activeTab, setActiveTab] = useState('maintenance');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [bookings, setBookings] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);

  // Modal states
  const [showRepairResolveModal, setShowRepairResolveModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [resolveData, setResolveData] = useState({ status: 'resolved', spare_parts: [] });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, mRes, sRes, lRes] = await Promise.all([
        fetch(`${apiEndpoints.getBookings()}?status=pending`),
        fetch(apiEndpoints.reportMaintenance()),
        fetch(apiEndpoints.manageSpareParts()),
        fetch(`${apiEndpoints.getUsageReports()}?type=logs`)
      ]);

      const bData = bRes.ok ? await bRes.json() : [];
      const mData = mRes.ok ? await mRes.json() : [];
      const sData = sRes.ok ? await sRes.json() : [];
      const lData = lRes.ok ? await lRes.json() : [];

      setBookings(Array.isArray(bData) ? bData : []);
      setMaintenance(Array.isArray(mData) ? mData : []);
      setSpareParts(Array.isArray(sData) ? sData : []);
      setUsageLogs(Array.isArray(lData) ? lData : []);
    } catch (err) {
      console.error("Staff Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = {
    pending_repairs: maintenance.filter(r => r.status === 'open' || r.status === 'in_progress').length,
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
      <p className="text-stone-400 font-bold font-inter animate-pulse uppercase tracking-widest text-xs">Analytics Generating...</p>
    </div>
  );

  return (
    <div className="space-y-10 font-inter">
      {/* Dynamic Tabs */}
      <div className="flex bg-white p-1.5 rounded-3xl border border-stone-100 shadow-sm w-fit">
        {[
          { id: 'maintenance', label: 'รายการแจ้งซ่อม', icon: 'build', count: stats.pending_repairs },
          { id: 'spare_parts', label: 'คลังอะไหล่', icon: 'inventory_2' },
          { id: 'usage', label: 'ประวัติการเข้าใช้', icon: 'history' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl active:scale-95 font-bold text-sm whitespace-nowrap ${
              activeTab === tab.id 
              ? 'bg-brand-charcoal text-white shadow-xl shadow-stone-200' 
              : 'text-stone-400 hover:text-brand-orange hover:bg-stone-50'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count > 0 && <span className="bg-brand-orange text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-bounce ml-1">{tab.count}</span>}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Existing Maintenance Tab (Branded) */}
        {activeTab === 'maintenance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {maintenance.length === 0 ? (
              <div className="col-span-full py-20 text-center opacity-20"><span className="material-symbols-outlined text-6xl">build_circle</span><p className="font-black mt-4">NO PENDING REPAIRS</p></div>
            ) : maintenance.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                <div className="w-28 h-28 bg-stone-100 rounded-2xl overflow-hidden flex-shrink-0 border border-stone-200 shadow-inner">
                  {r.image_path ? <img src={getImageUrl(r.image_path)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Repair" /> : <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">📷</div>}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-black text-brand-charcoal tracking-tight">{r.instrument_name}</h4>
                      <p className="text-[10px] text-brand-gold font-black uppercase tracking-widest">ID: {r.equipment_id}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-stone-500 font-medium line-clamp-2 mt-1 mb-4 leading-relaxed">{r.description}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-[10px] text-stone-300 font-black tracking-widest">{new Date(r.created_at).toLocaleDateString('th-TH')}</span>
                    {r.status !== 'resolved' && r.status !== 'closed' && (
                      <button 
                        onClick={() => { setSelectedRepair(r); setShowRepairResolveModal(true); }}
                        className="bg-brand-charcoal text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-brand-orange transition-all uppercase tracking-widest shadow-lg shadow-stone-100"
                      >
                        Resolve Issue
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Existing Spare Parts Tab (Branded) */}
        {activeTab === 'spare_parts' && (
          <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/30">
              <div>
                <h3 className="font-black text-brand-charcoal uppercase">สต็อกอะไหล่สำรอง</h3>
                <p className="text-[10px] text-stone-400 font-bold tracking-widest">Spare Parts Inventory</p>
              </div>
              <button className="bg-brand-charcoal text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-brand-orange shadow-xl shadow-stone-100 transition-all">+ Add Stock</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 uppercase tracking-[0.15em] text-[9px] font-black text-stone-400">
                    <th className="px-8 py-5">Item Name</th>
                    <th className="px-8 py-5">Stock Level</th>
                    <th className="px-8 py-5">Unit</th>
                    <th className="px-8 py-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {spareParts.length === 0 ? (
                    <tr><td colSpan="4" className="px-8 py-20 text-center text-stone-300 font-black uppercase tracking-widest">No stock data</td></tr>
                  ) : spareParts.map(p => (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-8 py-6 font-black text-brand-charcoal text-sm">{p.name}</td>
                      <td className={`px-8 py-6 text-base font-black ${p.quantity < 5 ? 'text-red-500' : 'text-brand-charcoal'}`}>{p.quantity}</td>
                      <td className="px-8 py-6 text-xs text-stone-400 font-bold uppercase">{p.unit}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${p.quantity < 5 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {p.quantity < 5 ? 'Low Stock' : 'Stable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Existing Usage Log Tab (Branded) */}
        {activeTab === 'usage' && (
          <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50/50 border-b border-stone-100 uppercase tracking-widest text-[9px] font-black text-stone-400">
                    <th className="px-8 py-6">ผู้ใช้งาน</th>
                    <th className="px-8 py-6">เครื่องมือ</th>
                    <th className="px-8 py-6 text-center">เวลาที่ใช้งาน</th>
                    <th className="px-8 py-6 text-right">ระยะเวลา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {usageLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center text-stone-300 font-black uppercase tracking-widest">
                        <span className="material-symbols-outlined text-4xl block mb-2 opacity-20">history</span>
                        ไม่พบประวัติการใช้งาน
                      </td>
                    </tr>
                  ) : usageLogs.map(l => (
                    <tr key={l.id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-sand/20 text-brand-gold flex items-center justify-center font-black text-sm border border-brand-sand/30">{l.first_name?.[0] || 'U'}</div>
                          <div>
                            <p className="text-sm font-black text-brand-charcoal">{l.first_name} {l.last_name}</p>
                            <p className="text-[10px] text-stone-400 font-bold font-mono uppercase tracking-tighter">{l.student_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-stone-600 text-sm">{l.instrument_name}</td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-2xl border border-stone-100 shadow-inner">
                          <span className="text-[10px] font-black text-brand-charcoal">{new Date(l.check_in).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})}</span>
                          <span className="text-[10px] text-stone-300">→</span>
                          <span className="text-[10px] font-black text-brand-gold">{l.check_out ? new Date(l.check_out).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : 'กำลังใช้งาน'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {l.duration_min ? <span className="bg-brand-charcoal text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-stone-100">{l.duration_min} นาที</span> : <span className="text-emerald-500 font-black text-[9px] animate-pulse uppercase">ใช้งานอยู่</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Existing Resolve Repair Modal (Branded) */}
      {showRepairResolveModal && selectedRepair && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl relative border border-stone-100 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-black text-brand-charcoal tracking-tight">บันทึกการซ่อม</h3>
                <p className="text-xs text-brand-gold font-bold uppercase tracking-widest mt-1">{selectedRepair.instrument_name}</p>
              </div>
              <button onClick={() => setShowRepairResolveModal(false)} className="text-stone-300 hover:text-brand-orange transition-colors"><span className="material-symbols-outlined text-3xl font-black">close</span></button>
            </div>
            
            <form onSubmit={handleResolveRepair} className="space-y-8">
              <div className="space-y-4">
                <label className="block text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Status Post-Repair</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'resolved', label: 'Ready to Use', emoji: '✅' },
                    { id: 'closed', label: 'Decommission', emoji: '🔒' }
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setResolveData({ ...resolveData, status: s.id })}
                      className={`py-4 px-6 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${
                        resolveData.status === s.id ? 'border-brand-orange bg-brand-orange/5 text-brand-orange shadow-lg shadow-brand-orange/10' : 'border-stone-50 text-stone-400 hover:border-stone-100 hover:bg-stone-50'
                      }`}
                    >
                      <span className="block text-lg mb-1">{s.emoji}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">Spare Parts Used</label>
                <div className="space-y-3 max-h-48 overflow-y-auto p-1 custom-scrollbar pr-2">
                  {spareParts.map(part => (
                    <div key={part.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div>
                        <span className="text-xs font-black text-brand-charcoal block">{part.name}</span>
                        <span className="text-[9px] text-stone-400 font-bold uppercase">Stock: {part.quantity}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number" min="0" max={part.quantity} placeholder="0"
                          className="w-16 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-center font-black text-brand-orange focus:ring-4 focus:ring-brand-orange/5"
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 0;
                            const newParts = [...resolveData.spare_parts];
                            const idx = newParts.findIndex(p => p.id === part.id);
                            if (qty > 0) {
                              if (idx > -1) newParts[idx].quantity = qty;
                              else newParts.push({ id: part.id, quantity: qty });
                            } else if (idx > -1) newParts.splice(idx, 1);
                            setResolveData({ ...resolveData, spare_parts: newParts });
                          }}
                        />
                        <span className="text-[10px] text-stone-400 font-black uppercase">{part.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="submit" className="w-full py-4 bg-brand-charcoal text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-stone-200 hover:bg-brand-orange hover:-translate-y-1 transition-all duration-500">
                  Update Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components (StatusBadge)
function StatusBadge({ status }) {
  const configs = {
    open: { label: 'รอซ่อม', class: 'bg-red-50 text-red-500 border-red-100' },
    in_progress: { label: 'กำลังซ่อม', class: 'bg-brand-orange/5 text-brand-orange border-brand-orange/10' },
    resolved: { label: 'เสร็จสิ้น', class: 'bg-emerald-50 text-emerald-500 border-emerald-100' },
    closed: { label: 'แทงจำหน่าย', class: 'bg-stone-50 text-stone-400 border-stone-100' }
  };
  const config = configs[status] || configs.open;
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${config.class}`}>
      {config.label}
    </span>
  );
}

export default StaffPanel;
