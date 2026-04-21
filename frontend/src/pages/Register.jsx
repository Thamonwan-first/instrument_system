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
      const response = await fetch('http://localhost/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert('สมัครสมาชิกสำเร็จ!');
        navigate('/'); // กลับไปหน้า Login
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับ Server ได้');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">ลงทะเบียนสมาชิก</h2>
        </div>
        {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center">{error}</div>}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleRegister}>
          <input type="text" placeholder="First Name" className="p-3 rounded-lg border" onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
          <input type="text" placeholder="Last Name" className="p-3 rounded-lg border" onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
          <input type="text" placeholder="Student ID (ถ้ามี)" className="p-3 rounded-lg border" onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} />
          <input type="email" placeholder="Email" className="p-3 rounded-lg border" onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <input type="text" placeholder="Phone" className="p-3 rounded-lg border" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          <select className="p-3 rounded-lg border" onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
            <option value="student">นักศึกษา</option>
            <option value="staff">เจ้าหน้าที่ศูนย์</option>
            <option value="ceo">CEO</option>
          </select>
          <input type="text" placeholder="Username" className="p-3 rounded-lg border" onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
          <input type="password" placeholder="Password" className="p-3 rounded-lg border" onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          
          <button type="submit" className="md:col-span-2 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            สมัครสมาชิก
          </button>
        </form>
        <div className="text-center">
          <Link to="/" className="text-sm text-blue-600 hover:underline">มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;