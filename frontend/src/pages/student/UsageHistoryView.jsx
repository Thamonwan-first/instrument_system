import React from 'react';

const UsageHistoryView = ({ logs = [] }) => {
  return (
    <div className="space-y-10 font-inter">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden relative">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-black text-brand-charcoal tracking-tight">ประวัติการเข้าใช้งาน</h3>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Detailed Access Logs & Research Sessions</p>
          </div>
          <div className="w-12 h-12 bg-stone-50 text-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-stone-100">history</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 uppercase tracking-widest text-[9px] font-black text-stone-400 border-b border-stone-100">
                <th className="px-8 py-5">เครื่องมือ</th>
                <th className="px-8 py-5 text-center">วันที่ใช้งาน</th>
                <th className="px-8 py-5 text-center">เวลาเข้า-ออก</th>
                <th className="px-8 py-5 text-right">ระยะเวลา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <span className="material-symbols-outlined text-6xl mb-4">history_toggle_off</span>
                      <p className="font-black uppercase tracking-widest text-xs">ไม่พบประวัติการใช้งานในระบบ</p>
                    </div>
                  </td>
                </tr>
              ) : logs.map((l, idx) => (
                <tr key={idx} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-lg shadow-inner group-hover:bg-emerald-50 transition-colors">🔬</div>
                      <div>
                        <p className="text-sm font-black text-brand-charcoal">{l.instrument_name}</p>
                        <p className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">Completed Session</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center text-xs font-bold text-stone-600">
                    {new Date(l.check_in).toLocaleDateString('th-TH', {day:'numeric', month:'long', year:'numeric'})}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100 text-[10px] font-black">
                      <span className="text-brand-charcoal">{new Date(l.check_in).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})}</span>
                      <span className="text-stone-300">→</span>
                      <span className="text-brand-gold">{l.check_out ? new Date(l.check_out).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : 'กำลังใช้'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="bg-brand-charcoal text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-lg shadow-stone-100 uppercase">
                      {l.duration_min || '0'} นาที
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsageHistoryView;
