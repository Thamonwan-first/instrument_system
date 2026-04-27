import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    username: '', password: '', first_name: '', last_name: '', student_id: '', phone: '', email: '', role: 'student'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/instrument_system/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert('สมัครสมาชิกสำเร็จ!');
        navigate('/');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับ Server ได้');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
         <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3">
            <span className="text-white text-3xl font-bold -rotate-3">IS</span>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          สร้างบัญชีผู้ใช้ใหม่
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          กรอกข้อมูลเพื่อลงทะเบียนเข้าใช้งานระบบ
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-white py-8 px-6 shadow-2xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ (First Name)</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล (Last Name)</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา (Student ID)</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} placeholder="ถ้ามี" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (Email)</label>
              <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ (Phone)</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทผู้ใช้งาน (Role)</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="student">นักศึกษา (Student)</option>
                <option value="staff">เจ้าหน้าที่ (Staff)</option>
                <option value="ceo">ผู้บริหาร (CEO)</option>
              </select>
            </div>
            
            <div className="md:col-span-2 border-t border-gray-100 my-2"></div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน (Password)</label>
              <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white sm:text-sm" onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            </div>
            
            <div className="md:col-span-2 mt-4">
              <button type="submit" className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 shadow-sm transition-colors">
                สมัครสมาชิก
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <Link to="/" className="font-medium text-gray-500 hover:text-blue-600 transition-colors text-sm">
              มีบัญชีอยู่แล้ว? <span className="text-blue-600 underline">เข้าสู่ระบบที่นี่</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;