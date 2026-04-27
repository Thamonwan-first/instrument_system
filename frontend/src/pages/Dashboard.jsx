import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import Management from './Management';

const StudentDashboard = ({ user, logs, setView }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
            onClick={() => setView('booking')}
            className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col items-start group"
        >
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">📅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">จองเครื่องมือล่วงหน้า</h3>
            <p className="text-gray-500 text-sm leading-relaxed">ค้นหาเครื่องมือที่ต้องการและทำการจองคิวใช้งานล่วงหน้า เพื่อความสะดวกและมั่นใจในการใช้งาน</p>
        </div>

        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm transition-all flex flex-col items-start">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-5">📸</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">สแกน QR Code เข้าใช้งาน</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">สแกน QR Code ที่ติดอยู่กับเครื่องมือเพื่อเริ่มบันทึกเวลาการใช้งานของคุณเข้าสู่ระบบทันที</p>
            <div id="reader" className="w-full rounded-xl overflow-hidden bg-gray-50 mb-4 hidden border border-gray-200"></div>
            <button onClick={() => window.startScanner()} className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm">เปิดกล้องสแกน</button>
        </div>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-xl">📈</div>
        <h3 className="text-lg font-bold text-gray-900">สถิติการเข้าใช้งาน 30 วันย้อนหลัง</h3>
      </div>
      <div className="flex flex-wrap gap-2 p-6 bg-gray-50 rounded-xl overflow-x-auto border border-gray-100">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            {Array.from({ length: 7 }).map((_, j) => {
              const d = new Date(); d.setDate(d.getDate() - (i * 7 + j));
              const hasData = logs.some(l => l.date === d.toISOString().split('T')[0]);
              return <div key={j} className={`w-4 h-4 rounded-[4px] transition-all ${hasData ? 'bg-emerald-500 shadow-sm' : 'bg-gray-200'}`} title={d.toLocaleDateString()}></div>;
            })}
          </div>
        ))}
      </div>
      <p className="mt-4 text-gray-500 text-xs font-medium">* ช่องสีเขียวแสดงวันที่คุณมีการใช้งานระบบ</p>
    </div>
  </div>
);

const BookingView = ({ searchResults, handleSearch, setSelectedInstrument, setShowBookingModal, myBookings }) => (
  <div className="space-y-6">
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><span>🔍</span> ค้นหาเครื่องมือ</h3>
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-gray-400">🔎</span>
        </div>
        <input 
          type="text" 
          placeholder="พิมพ์ชื่อเครื่องมือที่ต้องการค้นหา..." 
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-700 transition-all font-medium" 
          onChange={(e) => handleSearch(e.target.value)} 
        />
      </div>
      
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResults.map(i => (
            <div key={i.id} className="p-6 bg-white border border-gray-200 rounded-xl flex justify-between items-center hover:border-blue-400 hover:shadow-md transition-all group">
              <div>
                <p className="font-bold text-gray-900 text-lg mb-1">{i.name}</p>
                <p className="text-sm font-medium text-gray-500">{i.building_name} • {i.room_name}</p>
              </div>
              <button 
                onClick={() => { setSelectedInstrument(i); setShowBookingModal(true); }} 
                className="bg-blue-50 text-blue-600 font-medium px-5 py-2.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"
              >
                จองคิว
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <p className="text-gray-500 font-medium">พิมพ์คำค้นหาเพื่อดูรายการเครื่องมือที่สามารถจองได้</p>
        </div>
      )}
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><span>📅</span> รายการจองของฉัน</h3>
      <div className="space-y-4">
        {myBookings.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500 font-medium">ไม่มีประวัติการจองเร็วๆ นี้</p>
            </div>
        ) : myBookings.map(b => (
          <div key={b.id} className="p-5 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl border border-gray-100">🛠️</div>
                <div>
                    <p className="font-bold text-gray-900">{b.instrument_name}</p>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        {new Date(b.start_date).toLocaleDateString('th-TH')} • {new Date(b.start_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </p>
                </div>
            </div>
            <span className={`self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-bold border ${b.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
              {b.status === 'approved' ? 'อนุมัติแล้ว' : 'รอการตรวจสอบ'}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function Dashboard() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [logs, setLogs] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [maintenanceReports, setMaintenanceReports] = useState([]);
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
    if (!savedUser) navigate('/'); 
    else {
      const u = JSON.parse(savedUser);
      setUser(u);
      fetchData(u);
    }
  }, [navigate]);

  const fetchData = async (u) => {
    try {
      const [lRes, bRes] = await Promise.all([
        fetch(`http://localhost/instrument_system/api/usage_log.php?user_id=${u.id}`),
        fetch(`http://localhost/instrument_system/api/booking.php?user_id=${u.id}`)
      ]);
      setLogs(await lRes.json());
      setMyBookings(await bRes.json());
      if (u.role === 'admin' || u.role === 'staff') {
        const mRes = await fetch('http://localhost/instrument_system/api/report_maintenance.php');
        setMaintenanceReports(await mRes.json());
      }
    } catch (e) { }
  };

  const handleSearch = async (q) => {
    if (!q) return setSearchResults([]);
    const res = await fetch('http://localhost/instrument_system/api/get_tree.php');
    const data = await res.json();
    const matches = [];
    data.forEach(b => b.rooms.forEach(r => r.instruments.forEach(i => {
      if (i.name.toLowerCase().includes(q.toLowerCase())) matches.push({ ...i, building_name: b.name, room_name: r.name });
    })));
    setSearchResults(matches);
  };

  const handleRepairSubmit = async (e) => {
    e.preventDefault();
    alert("ส่งข้อมูลแจ้งซ่อมสำเร็จ!");
    setShowRepairModal(false);
  };

  window.startScanner = async () => {
    const reader = document.getElementById('reader');
    reader.classList.remove('hidden');
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      await html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, async (text) => {
        await html5QrCode.stop();
        reader.classList.add('hidden');
        const res = await fetch(`http://localhost/instrument_system/api/get_instrument_details.php?id=${text}`);
        const data = await res.json();
        setSelectedInstrument(data);
        setShowDetailModal(true);
      });
    } catch (err) { alert("Camera Error"); }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost/instrument_system/api/booking.php', {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id, instrument_id: selectedInstrument.id, start_date: `${bookingForm.start_date} ${bookingForm.start_time}:00`, end_date: `${bookingForm.start_date} ${bookingForm.end_time}:00` })
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) {
        setShowBookingModal(false); 
        fetchData(user);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold text-xl">IS</span>
              </div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Instrument</h1>
            </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-6">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">เมนูหลัก</p>
          
          <button onClick={() => setView('home')} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-colors ${view === 'home' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
            <span className="text-xl">🏠</span>
            <span>หน้าแรก</span>
          </button>
          
          {user.role === 'student' && (
            <button onClick={() => setView('booking')} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-colors ${view === 'booking' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                <span className="text-xl">📅</span>
                <span>ระบบจองคิว</span>
            </button>
          )}

          {(user.role === 'admin' || user.role === 'staff') && (
            <>
              <button onClick={() => setView('management')} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-colors ${view === 'management' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                <span className="text-xl">🛠️</span>
                <span>จัดการคลังเครื่องมือ</span>
              </button>
              <button onClick={() => setView('reports')} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-colors ${view === 'reports' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                <span className="text-xl">📋</span>
                <span>รายการแจ้งซ่อม</span>
              </button>
            </>
          )}

          <div className="h-px bg-gray-100 my-6 mx-4"></div>

          <button onClick={() => { localStorage.removeItem('user'); navigate('/'); }} className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium">
            <span className="text-xl">🚪</span>
            <span>ออกจากระบบ</span>
          </button>
        </nav>

        <div className="p-6 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {user.first_name[0]}
                </div>
                <div className="overflow-hidden text-left">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.first_name} {user.last_name}</p>
                    <p className="text-xs font-medium text-gray-500 capitalize">{user.role}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {view === 'home' && 'ภาพรวมระบบ'}
              {view === 'booking' && 'ค้นหาและจองเครื่องมือ'}
              {view === 'management' && 'จัดการระบบ'}
              {view === 'reports' && 'รายการแจ้งซ่อมบำรุง'}
            </h2>
            <p className="text-gray-500 mt-2 font-medium">ยินดีต้อนรับกลับมา, {user.first_name}</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm self-start md:self-auto">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold text-gray-700">ระบบเชื่อมต่อปกติ</span>
          </div>
        </header>

        <div className="max-w-6xl mx-auto w-full">
          {user.role === 'student' && view === 'home' && <StudentDashboard user={user} logs={logs} setView={setView} />}
          {user.role === 'student' && view === 'booking' && <BookingView searchResults={searchResults} handleSearch={handleSearch} setSelectedInstrument={setSelectedInstrument} setShowBookingModal={setShowBookingModal} myBookings={myBookings} />}
          
          {(user.role === 'staff' || user.role === 'admin') && view === 'home' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[{l:'รอตรวจสอบซ่อม', v:maintenanceReports.filter(r=>r.status==='pending').length, c:'red', i:'⚠️'}, {l:'การจองวันนี้', v:myBookings.length, c:'blue', i:'📅'}, {l:'เครื่องมือทั้งหมด', v:'45', c:'gray', i:'🛠️'}, {l:'การใช้งานรวม', v:'128', c:'emerald', i:'📊'}].map((s,i)=>(
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                          <p className="text-sm font-bold text-gray-500">{s.l}</p>
                          <span className="text-xl bg-gray-50 p-2 rounded-lg">{s.i}</span>
                        </div>
                        <p className={`text-4xl font-extrabold text-${s.c}-600`}>{s.v}</p>
                    </div>
                ))}
            </div>
          )}
          
          {(user.role === 'staff' || user.role === 'admin') && view === 'management' && <Management />}
          {(user.role === 'staff' || user.role === 'admin') && view === 'reports' && (
            <div className="space-y-6">
              {maintenanceReports.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                    <p className="text-gray-500 font-medium text-lg">ขณะนี้ไม่มีรายการแจ้งซ่อม</p>
                  </div>
              ) : maintenanceReports.map(r => (
                <div key={r.id} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-6 items-start shadow-sm hover:shadow-md transition-shadow">
                  {r.image_path ? (
                      <img src={`http://localhost/instrument_system/api/uploads/images/${r.image_path}`} className="w-full md:w-40 h-40 rounded-xl object-cover border border-gray-100" />
                  ) : (
                      <div className="w-full md:w-40 h-40 bg-gray-50 rounded-xl flex items-center justify-center text-4xl border border-gray-100">📷</div>
                  )}
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <h4 className="font-extrabold text-gray-900 text-xl md:text-2xl">{r.instrument_name}</h4>
                      <span className={`self-start px-3 py-1 rounded-full text-xs font-bold border ${r.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                        {r.status === 'pending' ? 'รอดำเนินการ' : 'ซ่อมเสร็จสิ้น'}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm md:text-base mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">{r.description}</p>
                    <div className="flex items-center gap-3 text-xs md:text-sm text-gray-500 font-medium">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">{r.first_name[0]}</div>
                        <span>ผู้แจ้ง: {r.first_name} {r.last_name}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{new Date(r.created_at).toLocaleString('th-TH')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedInstrument && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-gray-900">จองคิวใช้งานเครื่องมือ</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="bg-blue-50/50 p-4 rounded-xl mb-6 flex items-center gap-4 border border-blue-100">
              <div className="text-3xl bg-white p-2 rounded-lg shadow-sm">🛠️</div>
              <div>
                <p className="font-extrabold text-gray-900">{selectedInstrument.name}</p>
                <p className="text-xs font-bold text-blue-600 mt-1">{selectedInstrument.building_name} • {selectedInstrument.room_name}</p>
              </div>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">วันที่ต้องการใช้งาน</label>
                <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-colors font-medium" 
                    required 
                    onChange={e => setBookingForm({...bookingForm, start_date: e.target.value})} 
                    min={new Date().toISOString().split('T')[0]} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">เวลาเริ่ม</label>
                  <input type="time" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-colors font-medium" value={bookingForm.start_time} onChange={e => setBookingForm({...bookingForm, start_time: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">เวลาสิ้นสุด</label>
                  <input type="time" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-colors font-medium" value={bookingForm.end_time} onChange={e => setBookingForm({...bookingForm, end_time: e.target.value})} />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">ยืนยันการจองคิว</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInstrument && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row border border-gray-100">
            <div className="md:w-2/5 bg-gray-100 relative">
              {selectedInstrument.image_path ? <img src={`http://localhost/instrument_system/api/uploads/images/${selectedInstrument.image_path}`} className="w-full h-full object-cover" /> : <div className="w-full h-full min-h-[250px] flex items-center justify-center text-gray-300 text-6xl">📷</div>}
              <div className="absolute top-4 left-4">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border ${selectedInstrument.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                  {selectedInstrument.status === 'active' ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}
                </span>
              </div>
            </div>
            <div className="md:w-3/5 p-8 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-3xl font-extrabold text-gray-900">{selectedInstrument.name}</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-sm font-bold text-blue-600 mb-8">{selectedInstrument.building_name} • {selectedInstrument.room_name}</p>
              
              <div className="flex-1 space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">เจ้าหน้าที่ผู้รับผิดชอบดูแล</p>
                  <p className="text-gray-900 font-bold text-lg">{selectedInstrument.responsible_staff}</p>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-600 flex items-center gap-3"><span className="bg-white p-1.5 rounded-md shadow-sm">✉️</span> <span className="font-medium">{selectedInstrument.staff_email}</span></p>
                    <p className="text-sm text-gray-600 flex items-center gap-3"><span className="bg-white p-1.5 rounded-md shadow-sm">📞</span> <span className="font-medium">{selectedInstrument.staff_phone}</span></p>
                  </div>
                </div>
                
                <button onClick={() => setShowRepairModal(true)} className="w-full bg-red-50 text-red-600 py-4 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"><span>⚠️</span> กดที่นี่เพื่อแจ้งเครื่องเสีย / ชำรุด</button>
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={() => setShowDetailModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">ย้อนกลับ</button>
                <button onClick={async () => { await fetch('http://localhost/instrument_system/api/usage_log.php', { method: 'POST', body: JSON.stringify({ action: 'check_in', user_id: user.id, instrument_id: selectedInstrument.id }) }); alert("บันทึกเข้าใช้งานสำเร็จ!"); setShowDetailModal(false); fetchData(user); }} className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-center">เริ่มบันทึกการใช้งาน</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repair Modal */}
      {showRepairModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative">
            <button onClick={() => setShowRepairModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-2xl border border-red-100">⚠️</div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">แจ้งซ่อมเครื่องมือ</h3>
                  <p className="text-sm text-gray-500 font-medium">กรุณาระบุปัญหาที่พบให้ชัดเจน</p>
                </div>
            </div>
            <form onSubmit={handleRepairSubmit} className="space-y-5">
              <textarea placeholder="อธิบายอาการเสีย เช่น หน้าจอไม่ติด, ปุ่มกดไม่ทำงาน..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors min-h-[120px] text-sm font-medium" required onChange={e => setRepairData({...repairData, description: e.target.value})} />
              <label className="w-full text-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors block group">
                  <span className="text-sm font-bold text-gray-500 group-hover:text-red-500">{repairData.image ? `แนบไฟล์: ${repairData.image.name}` : '📎 แนบรูปภาพประกอบ (คลิกที่นี่)'}</span>
                  <input type="file" className="hidden" onChange={e => setRepairData({...repairData, image: e.target.files[0]})} />
              </label>
              <div className="pt-2">
                <button type="submit" className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm">ส่งข้อมูลแจ้งซ่อม</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;