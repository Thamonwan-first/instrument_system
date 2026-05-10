import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiEndpoints } from '../../api';

function Register() {
  const [formData, setFormData] = useState({
    username: '', password: '', first_name: '', last_name: '', student_id: '', phone: '', email: '', faculty: '', department: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiEndpoints.register(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'สมัครสมาชิกสำเร็จ!');
        navigate('/');
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับ Server ได้');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{ backgroundColor: '#F27C38' }}></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{ backgroundColor: '#C9A44C' }}></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
         <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3" style={{ backgroundColor: '#2B2B2B' }}>
            <span className="text-white text-3xl font-bold -rotate-3">IS</span>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold tracking-tight" style={{ color: '#2B2B2B' }}>
          สมัครสมาชิกนักศึกษา
        </h2>
        <p className="mt-2 text-center text-sm" style={{ color: '#6b5a47' }}>
          กรอกข้อมูลเพื่อลงทะเบียนเข้าใช้งานระบบ (สำหรับนักศึกษาเท่านั้น)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="py-8 px-6 shadow-2xl sm:rounded-2xl sm:px-10 border" style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderColor: 'rgba(43,43,43,0.12)' }}>
          {error && (
            <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: '#ead7c2', borderLeft: '4px solid #F27C38' }}>
              <p className="text-sm font-medium" style={{ color: '#2B2B2B' }}>{error}</p>
            </div>
          )}

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ (First Name)</label>
              <input type="text" className="w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" style={{ borderColor: 'rgba(43,43,43,0.18)' }} value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล (Last Name)</label>
              <input type="text" className="w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" style={{ borderColor: 'rgba(43,43,43,0.18)' }} value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา (Student ID)</label>
              <input type="text" className="w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" style={{ borderColor: 'rgba(43,43,43,0.18)' }} value={formData.student_id} onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} placeholder="เช่น 64XXXXX" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (Email)</label>
              <input type="email" className="w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" style={{ borderColor: 'rgba(43,43,43,0.18)' }} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ (Phone)</label>
              <input type="text" className="w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" style={{ borderColor: 'rgba(43,43,43,0.18)' }} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะผู้ใช้งาน</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 sm:text-sm text-gray-500" value="นักศึกษา (Student)" disabled />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">คณะ (Faculty)</label>
              <input type="text" className="w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" style={{ borderColor: 'rgba(43,43,43,0.18)' }} value={formData.faculty} onChange={(e) => setFormData({ ...formData, faculty: e.target.value })} placeholder="เช่น คณะวิทยาศาสตร์" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สาขาวิชา/ภาควิชา (Department)</label>
              <input type="text" className="w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" style={{ borderColor: 'rgba(43,43,43,0.18)' }} value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="เช่น สาขาฟิสิกส์" required />
            </div>

            <div className="md:col-span-2 border-t border-gray-100 my-2"></div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
              <input type="text" className="w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" style={{ borderColor: 'rgba(43,43,43,0.18)' }} value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน (Password)</label>
              <input type="password" className="w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" style={{ borderColor: 'rgba(43,43,43,0.18)' }} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            </div>
            
            <div className="md:col-span-2 mt-4">
              <button type="submit" className="w-full py-3.5 text-white rounded-xl font-bold text-base shadow-sm transition-colors" style={{ backgroundColor: '#C9A44C' }}>
                สมัครสมาชิก
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <Link to="/" className="font-medium transition-colors text-sm" style={{ color: '#6b5a47' }}>
              มีบัญชีอยู่แล้ว? <span style={{ color: '#F27C38', textDecoration: 'underline' }}>เข้าสู่ระบบที่นี่</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;