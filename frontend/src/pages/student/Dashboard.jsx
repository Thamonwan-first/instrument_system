import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { apiEndpoints, getImageUrl } from '../../api';
import MainLayout from '../../components/MainLayout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import StaffPanel from '../staff/StaffPanel';

// Import split student components
import StudentHome from './StudentHome';
import BookingView from './BookingView';
import ReportIssueView from './ReportIssueView';
import UsageHistoryView from './UsageHistoryView';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'home';
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [repairData, setRepairData] = useState({ description: '', image: null });
  const [bookingForm, setBookingForm] = useState({ start_date: '', start_time: '09:00', end_time: '12:00' });
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
        navigate('/');
    } else {
        const u = JSON.parse(savedUser);
        setUser(u);
        fetchData(u);
    }
  }, [navigate]);

  useEffect(() => {
    if (user && (view === 'booking' || view === 'report' || view === 'history')) {
      if (treeData.length === 0) fetchTree();
    }
  }, [user, view, treeData.length]);

  const fetchData = async (u) => {
    try {
      const [lRes, bRes, sRes] = await Promise.all([
        fetch(`${apiEndpoints.usageLog()}?user_id=${u.id}`),
        fetch(`${apiEndpoints.booking()}?user_id=${u.id}`),
        fetch(`${apiEndpoints.getUsageReports()}?type=active&user_id=${u.id}`)
      ]);
      const lData = await lRes.json();
      const bData = await bRes.json();
      const sData = await sRes.json();
      setLogs(Array.isArray(lData) ? lData : []);
      setMyBookings(Array.isArray(bData) ? bData : []);
      setActiveSession(Array.isArray(sData) && sData.length > 0 ? sData[0] : null);
    } catch (e) { console.error("Fetch Data Error:", e); }
  };

  const fetchTree = async () => {
    setLoadingTree(true);
    try {
      const res = await fetch(apiEndpoints.getTree());
      const result = await res.json();
      const flatData = result.data?.data || result.data || [];
      
      if (Array.isArray(flatData)) {
        const tree = [];
        const buildingMap = {};

        flatData.forEach(item => {
          if (!buildingMap[item.b_id]) {
            buildingMap[item.b_id] = { b_id: item.b_id, b_name: item.b_name, rooms: [], roomMap: {} };
            tree.push(buildingMap[item.b_id]);
          }
          const b = buildingMap[item.b_id];
          if (!b.roomMap[item.r_id]) {
            b.roomMap[item.r_id] = { r_id: item.r_id, r_name: item.r_name, instruments: [] };
            b.rooms.push(b.roomMap[item.r_id]);
          }
          b.roomMap[item.r_id].instruments.push(item);
        });
        setTreeData(tree);
      }
    } catch (e) { console.error("Tree Fetch Error:", e); }
    finally { setLoadingTree(false); }
  };

  const handleCheckOut = async (logId) => {
    try {
      const res = await fetch(apiEndpoints.usageLog(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_out', log_id: logId })
      });
      const data = await res.json();
      alert(data.message);
      fetchData(user);
    } catch (e) { alert("เกิดข้อผิดพลาดในการเช็คเอาท์"); }
  };

  const handleRepairSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInstrument) {
      alert("กรุณาเลือกเครื่องมือที่ต้องการแจ้งซ่อม");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('equipment_id', selectedInstrument.id);
      formData.append('description', repairData.description);
      if (repairData.image) {
        formData.append('image', repairData.image);
      }

      const res = await fetch(apiEndpoints.reportIssue(), {
        method: 'POST',
        body: formData
      });
      
      const result = await res.json();
      if (res.ok) {
        alert(result.message || "ส่งข้อมูลแจ้งซ่อมสำเร็จ!");
        setRepairData({ description: '', image: null });
        setSelectedInstrument(null);
        navigate('/dashboard');
      } else {
        alert(result.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }
    } catch (err) {
      console.error("Repair Submit Error:", err);
      alert("ไม่สามารถเชื่อมต่อกับระบบได้");
    }
  };

  const toggleScanner = async () => {
    if (isScanning) {
        if (scannerRef.current) {
            try { await scannerRef.current.stop(); } catch (err) { }
            scannerRef.current = null;
        }
        setIsScanning(false);
    } else {
        setIsScanning(true);
        setTimeout(async () => {
            try {
                const html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;
                await html5QrCode.start(
                    { facingMode: "environment" }, 
                    { fps: 10, qrbox: 250 }, 
                    async (text) => {
                        await html5QrCode.stop();
                        scannerRef.current = null;
                        setIsScanning(false);
                        const res = await fetch(`${apiEndpoints.getInstrumentDetails()}?id=${text}`);
                        const result = await res.json();
                        const instrumentData = result.data?.data || result.data;
                        if (instrumentData) {
                          setSelectedInstrument(instrumentData);
                          setShowDetailModal(true);
                        } else {
                          alert(result.message || "ไม่พบข้อมูลเครื่องมือ");
                        }
                    }
                );
            } catch (err) { 
                console.error("Scanner error:", err);
                alert("ไม่สามารถเปิดกล้องได้"); 
                setIsScanning(false);
            }
        }, 100);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiEndpoints.booking(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, 
          instrument_id: selectedInstrument.id, 
          start_date: `${bookingForm.start_date} ${bookingForm.start_time}:00`, 
          end_date: `${bookingForm.start_date} ${bookingForm.end_time}:00` 
        })
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) {
          setShowBookingModal(false); 
          fetchData(user);
      }
    } catch (e) { alert("เกิดข้อผิดพลาดในการจอง"); }
  };

  if (!user) return null;

  return (
    <MainLayout 
      title={view === 'home' ? (user.role === 'student' ? 'หน้าแรก' : 'แผงควบคุมเจ้าหน้าที่') : (view === 'booking' ? 'จองเครื่องมือ' : view === 'history' ? 'ประวัติการใช้งาน' : 'แจ้งซ่อมเครื่องมือ')}
      subtitle={view === 'home' ? `ยินดีต้อนรับกลับมา, ${user.first_name}` : view === 'booking' ? 'ค้นหาและเลือกเครื่องมือวิจัยที่ต้องการ' : view === 'history' ? 'ตรวจสอบประวัติการเข้าใช้งานย้อนหลัง' : 'ระบุรายละเอียดปัญหาที่พบ'}
    >
      {user.role === 'student' && view === 'home' && (
        <StudentHome 
          logs={logs} 
          activeSession={activeSession}
          handleCheckOut={handleCheckOut}
          myBookings={myBookings}
          onScanClick={toggleScanner}
        />
      )}
      
      {user.role === 'student' && view === 'booking' && (
        <BookingView 
          treeData={treeData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSelectedInstrument={setSelectedInstrument} 
          setShowBookingModal={setShowBookingModal} 
          loadingTree={loadingTree}
        />
      )}

      {user.role === 'student' && view === 'report' && (
        <ReportIssueView 
          treeData={treeData}
          selectedInstrument={selectedInstrument}
          setSelectedInstrument={setSelectedInstrument}
          repairData={repairData}
          setRepairData={setRepairData}
          handleRepairSubmit={handleRepairSubmit}
        />
      )}

      {user.role === 'student' && view === 'history' && (
        <UsageHistoryView logs={logs} />
      )}
      
      {(user.role === 'staff' || user.role === 'admin') && view === 'home' && <StaffPanel user={user} />}

      {/* Floating UI for Student */}
      {user.role === 'student' && (
        <div className="fixed bottom-10 right-10 z-[80] flex flex-col items-end gap-6">
          {/* Scanner Popup */}
          <div className={`w-80 bg-white rounded-[2.5rem] border-4 border-brand-charcoal shadow-2xl overflow-hidden transition-all duration-500 transform origin-bottom-right ${isScanning ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
            <div className="bg-brand-charcoal p-5 text-white flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest">QR Check-in</p>
              <button onClick={toggleScanner} className="material-symbols-outlined text-lg hover:text-brand-orange transition-colors">close</button>
            </div>
            <div className="p-2 bg-stone-100">
               <div id="reader" className="w-full aspect-square rounded-2xl overflow-hidden shadow-inner border-2 border-white"></div>
            </div>
            <div className="p-6 text-center">
              <p className="text-xs font-bold text-stone-400 leading-relaxed italic">เล็งกล้องไปที่ QR Code ของเครื่องมือเพื่อเข้าใช้งาน</p>
            </div>
          </div>

          {/* FAB Button */}
          <button 
            onClick={toggleScanner}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white transition-all duration-500 active:scale-90 group ${isScanning ? 'bg-[#2B2B2B] rotate-45' : 'bg-[#F27C38] hover:bg-[#2B2B2B]'}`}
          >
            <span className="material-symbols-outlined text-white text-4xl font-black group-hover:scale-110 transition-transform">{isScanning ? 'close' : 'qr_code_scanner'}</span>
          </button>
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal && !!selectedInstrument}
        onClose={() => setShowBookingModal(false)}
        title="ระบุเวลาที่ต้องการจอง"
      >
        {selectedInstrument && (
          <div className="space-y-8">
            <div className="bg-brand-sand/10 p-6 rounded-[2rem] flex items-center gap-5 border border-brand-sand/20 shadow-inner">
              <div className="text-4xl bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">🔬</div>
              <div>
                <p className="font-black text-brand-charcoal text-lg tracking-tight">{selectedInstrument.name}</p>
                <p className="text-[10px] font-black text-brand-gold uppercase tracking-widest mt-1">{selectedInstrument.building_name} • {selectedInstrument.room_name}</p>
              </div>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">วันที่ต้องการใช้งาน</label>
                <input 
                    type="date" 
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-4 focus:ring-brand-orange/5 focus:bg-white outline-none transition-all font-bold text-brand-charcoal" 
                    required 
                    onChange={e => setBookingForm({...bookingForm, start_date: e.target.value})} 
                    min={new Date().toISOString().split('T')[0]} 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">เวลาเริ่ม</label>
                  <input type="time" className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-4 focus:ring-brand-orange/5 focus:bg-white outline-none transition-all font-bold text-brand-charcoal" value={bookingForm.start_time} onChange={e => setBookingForm({...bookingForm, start_time: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] ml-1">เวลาสิ้นสุด</label>
                  <input type="time" className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-4 focus:ring-brand-orange/5 focus:bg-white outline-none transition-all font-bold text-brand-charcoal" value={bookingForm.end_time} onChange={e => setBookingForm({...bookingForm, end_time: e.target.value})} />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-brand-charcoal text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-stone-200 hover:bg-brand-orange hover:-translate-y-1 transition-all duration-500">ยืนยันการจองคิว</button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal && !!selectedInstrument}
        onClose={() => setShowDetailModal(false)}
        title="ข้อมูลเครื่องมือ"
        maxWidth="max-w-4xl"
      >
        {selectedInstrument && (
          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:w-5/12 bg-stone-50 relative rounded-[2.5rem] overflow-hidden min-h-[350px] border border-stone-100 shadow-inner group">
              {selectedInstrument.thumbnail ? (
                <img src={getImageUrl(selectedInstrument.thumbnail)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={selectedInstrument.name} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-200">
                  <span className="material-symbols-outlined text-8xl">image</span>
                  <p className="font-black text-[10px] uppercase tracking-widest mt-4">No Image Available</p>
                </div>
              )}
              <div className="absolute top-6 left-6">
                <StatusBadge status={selectedInstrument.status} />
              </div>
            </div>
            <div className="md:w-7/12 flex flex-col">
              <div className="mb-8">
                <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-2">{selectedInstrument.building_name} • {selectedInstrument.room_number || selectedInstrument.room_name}</p>
                <h3 className="text-4xl font-black text-brand-charcoal tracking-tighter leading-none">{selectedInstrument.name}</h3>
              </div>
              
              <div className="flex-1 space-y-8">
                <div className="bg-stone-50/50 p-8 rounded-[2rem] border border-stone-100 shadow-inner space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span>
                      Responsible Staff
                    </p>
                    <p className="text-brand-charcoal font-black text-xl tracking-tight">{selectedInstrument.responsible_staff || 'Lab Staff'}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-xs text-stone-500 flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-stone-50">
                      <span className="material-symbols-outlined text-brand-gold text-lg">mail</span> 
                      <span className="font-bold">{selectedInstrument.staff_email || 'contact@lab.com'}</span>
                    </p>
                    <p className="text-xs text-stone-500 flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-stone-50">
                      <span className="material-symbols-outlined text-brand-orange text-lg">call</span> 
                      <span className="font-bold">{selectedInstrument.staff_phone || '02-XXX-XXXX'}</span>
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => { setShowDetailModal(false); navigate('/dashboard?view=report'); }} 
                  className="w-full bg-red-50 text-red-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">report_problem</span>
                  แจ้งเครื่องมือเสีย / ชำรุด
                </button>
              </div>

              <div className="mt-10 flex gap-4">
                <button onClick={() => setShowDetailModal(false)} className="flex-1 py-4 bg-stone-100 text-stone-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-stone-200 transition-all">ย้อนกลับ</button>
                <button 
                  onClick={async () => { 
                    try {
                      const res = await fetch(apiEndpoints.usageLog(), { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'check_in', user_id: user.id, qr_token: selectedInstrument.qr_token }) 
                      }); 
                      const data = await res.json();
                      alert(data.message); 
                      if (res.ok) {
                        setShowDetailModal(false); 
                        fetchData(user);
                      }
                    } catch (e) { alert("เกิดข้อผิดพลาดในการบันทึก"); }
                  }} 
                  className="flex-[2] py-4 bg-brand-charcoal text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-brand-orange transition-all shadow-xl shadow-stone-200"
                >
                  เริ่มบันทึกการใช้งาน
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}

export default Dashboard;
