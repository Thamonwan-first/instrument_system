import React, { useMemo } from 'react';
import StatusBadge from '../../components/StatusBadge';

const BookingView = ({ treeData, searchQuery, setSearchQuery, setSelectedInstrument, setShowBookingModal, loadingTree }) => {
  const filteredTree = useMemo(() => {
    if (!searchQuery) return treeData;
    const q = searchQuery.toLowerCase();
    return treeData.map(b => ({
      ...b,
      rooms: (b.rooms || []).map(r => ({
        ...r,
        instruments: (r.instruments || []).filter(i => 
          (i.i_name || "").toLowerCase().includes(q) || 
          (r.r_name || "").toLowerCase().includes(q) || 
          (b.b_name || "").toLowerCase().includes(q)
        )
      })).filter(r => r.instruments.length > 0)
    })).filter(b => b.rooms.length > 0);
  }, [treeData, searchQuery]);

  return (
    <div className="space-y-10 font-inter">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-stone-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-brand-charcoal tracking-tight">ค้นหาและจองเครื่องมือ</h2>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Building → Room → Instrument</p>
          </div>
          <span className="material-symbols-outlined text-brand-gold bg-brand-gold/5 p-4 rounded-3xl text-3xl">travel_explore</span>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="relative mb-10 group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-stone-300 group-focus-within:text-brand-orange transition-colors">search</span>
          </div>
          <input 
            type="text" 
            placeholder="พิมพ์ชื่อเครื่องมือ, เลขห้อง, หรืออาคาร..." 
            className="w-full pl-16 pr-24 py-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-orange/5 focus:bg-white focus:border-brand-orange/20 text-brand-charcoal transition-all font-bold text-lg shadow-inner" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
             <button type="button" className="bg-brand-charcoal text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-orange transition-all active:scale-95">ค้นหา</button>
          </div>
        </form>
        
        {loadingTree ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">กำลังโหลดข้อมูลเครื่องมือ...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredTree.length > 0 ? filteredTree.map(b => (
              <div key={b.b_id} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <span className="material-symbols-outlined text-brand-gold bg-brand-gold/5 p-2 rounded-xl text-sm">apartment</span>
                  <h4 className="text-sm font-black text-brand-gold uppercase tracking-[0.2em]">{b.b_name}</h4>
                  <div className="flex-1 h-px bg-brand-sand/20"></div>
                </div>
                
                <div className="grid grid-cols-1 gap-6 pl-4">
                  {b.rooms.map(r => (
                    <div key={r.r_id} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-orange/30"></div>
                        <span className="text-xs font-black text-brand-charcoal uppercase tracking-widest">ห้อง {r.r_name}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-5">
                        {r.instruments.map(i => (
                          <div key={i.i_id} className="p-6 bg-white border border-stone-100 rounded-3xl flex justify-between items-center hover:border-brand-orange hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                              <span className="material-symbols-outlined text-4xl">precision_manufacturing</span>
                            </div>
                            <div className="relative z-10">
                              <p className="font-black text-brand-charcoal text-base mb-1 tracking-tight">{i.i_name}</p>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={i.i_status} />
                                {i.i_status === 'available' && <span className="text-[9px] font-black text-emerald-500 uppercase">พร้อมจอง</span>}
                              </div>
                            </div>
                            <button 
                              onClick={() => { setSelectedInstrument({ ...i, building_name: b.b_name, room_name: r.r_name, id: i.i_id, name: i.i_name }); setShowBookingModal(true); }} 
                              className="relative z-10 bg-stone-50 text-brand-charcoal hover:bg-brand-charcoal hover:text-white font-black px-5 py-3 rounded-2xl transition-all text-xs uppercase tracking-widest shadow-sm"
                              disabled={i.i_status === 'maintenance'}
                            >
                              จองคิว
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="text-center py-20 border-2 border-dashed border-stone-100 rounded-[2.5rem] bg-stone-50/50">
                <span className="material-symbols-outlined text-5xl text-stone-200 block mb-4">search_off</span>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-sm">ไม่พบรายการเครื่องมือที่คุณต้องการ</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingView;
