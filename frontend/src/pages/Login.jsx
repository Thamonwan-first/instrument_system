import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('เข้าสู่ระบบสำเร็จ!');
        // ไปยังหน้า Dashboard ตาม Role (จะทำใน Phase ถัดไป)
        // navigate('/dashboard'); 
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับ Server ได้');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">เข้าสู่ระบบ</h2>
          <p className="mt-2 text-sm text-gray-500">กรุณาใช้ Username และ Password ของคุณ</p>
        </div>
        {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center">{error}</div>}
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Login
          </button>
        </form>
        <div className="text-center">
          <Link to="/register" className="text-sm text-blue-600 hover:underline">ยังไม่มีบัญชี? สมัครสมาชิกที่นี่</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;