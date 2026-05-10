import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';
import MainLayout from '../../components/MainLayout';

function BookingApproval() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiEndpoints.getBookings()}?status=pending`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingUpdate = async (id, status) => {
    try {
      const formData = new FormData();
      formData.append('booking_id', id);
      formData.append('status', status);

      const res = await fetch(apiEndpoints.updateBooking(), {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <MainLayout title="✅ อนุมัติการจอง" subtitle="ตรวจสอบและจัดการคิวการเข้าใช้งานเครื่องมือ">
      <div className="space-y-8 font-inter">
        
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
              <span className="material-symbols-outlined text-2xl font-black">pending_actions</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">รอดำเนินการ</p>
              <p className="text-2xl font-black text-brand-charcoal">{bookings.length} รายการ</p>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-100 uppercase tracking-widest text-[10px] font-black text-stone-400">
                  <th className="px-8 py-6">ข้อมูลผู้จอง</th>
                  <th className="px-8 py-6">เครื่องมือวิจัย</th>
                  <th className="px-8 py-6 text-center">วัน-เวลาที่จอง</th>
                  <th className="px-8 py-6 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
                        <p className="text-sm font-bold text-stone-400">กำลังโหลดรายการ...</p>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <span className="material-symbols-outlined text-6xl">calendar_today</span>
                        <p className="text-base font-black text-brand-charcoal uppercase tracking-widest">ไม่มีรายการรออนุมัติ</p>
                      </div>
                    </td>
                  </tr>
                ) : bookings.map(b => (
                  <tr key={b.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-charcoal text-white flex items-center justify-center font-black text-sm shadow-lg shadow-stone-200">
                          {b.first_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-brand-charcoal">{b.first_name} {b.last_name}</p>
                          <p className="text-[10px] font-black text-brand-gold uppercase tracking-tighter opacity-80">{b.student_id || 'STAFF USER'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-brand-charcoal">{b.instrument_name}</p>
                        <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">ID: {b.equipment_id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex flex-col items-center bg-stone-50 px-4 py-2 rounded-2xl border border-stone-100 shadow-inner">
                        <p className="text-xs font-black text-brand-charcoal">{new Date(b.start_time).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                        <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest">
                          {new Date(b.start_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleBookingUpdate(b.id, 'rejected')}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                        >
                          ปฏิเสธ
                        </button>
                        <button 
                          onClick={() => handleBookingUpdate(b.id, 'approved')}
                          className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                        >
                          อนุมัติการจอง
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Policy Notice */}
        <div className="bg-brand-sand/10 border border-brand-sand/20 rounded-[2rem] p-6 flex items-start gap-4">
          <span className="material-symbols-outlined text-brand-gold">info</span>
          <div className="space-y-1">
            <p className="text-xs font-black text-brand-charcoal uppercase tracking-widest">คำแนะนำการอนุมัติ</p>
            <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
              การกดอนุมัติจะเป็นการจองเครื่องมือให้สำเร็จ และระบบจะส่งการแจ้งเตือนไปยังนักศึกษาผู้จองโดยอัตโนมัติ กรุณาตรวจสอบความพร้อมของเครื่องมือก่อนดำเนินการ
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default BookingApproval;
