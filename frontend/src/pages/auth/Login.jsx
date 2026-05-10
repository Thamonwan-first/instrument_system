import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiEndpoints } from '../../api';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiEndpoints.login(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับ Server ได้');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{ backgroundColor: '#F27C38' }}></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{ backgroundColor: '#C9A44C' }}></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{ backgroundColor: '#EAD7C2' }}></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3" style={{ backgroundColor: '#2B2B2B' }}>
            <span className="text-white text-3xl font-bold -rotate-3">IS</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight" style={{ color: '#2B2B2B' }}>
          เข้าสู่ระบบ
        </h2>
        <p className="mt-2 text-center text-sm" style={{ color: '#6b5a47' }}>
          Instrument Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="py-10 px-6 shadow-2xl sm:rounded-2xl sm:px-10 border" style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderColor: 'rgba(43,43,43,0.12)' }}>
          {error && (
            <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: '#ead7c2', borderLeft: '4px solid #F27C38' }}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <span style={{ color: '#F27C38' }}>⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium" style={{ color: '#2B2B2B' }}>{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
              <input
                type="text"
                required
                className="appearance-none block w-full px-4 py-3.5 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm bg-gray-50 focus:bg-white"
                style={{ borderColor: 'rgba(43,43,43,0.18)' }}
                placeholder="กรอกชื่อผู้ใช้งาน"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน (Password)</label>
              <input
                type="password"
                required
                className="appearance-none block w-full px-4 py-3.5 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm bg-gray-50 focus:bg-white"
                style={{ borderColor: 'rgba(43,43,43,0.18)' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                style={{ backgroundColor: '#F27C38', boxShadow: '0 10px 24px rgba(242,124,56,0.24)' }}
              >
                ลงชื่อเข้าใช้
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <Link to="/register" className="font-medium transition-colors text-sm" style={{ color: '#6b5a47' }}>
              ยังไม่มีบัญชีใช่หรือไม่? <span style={{ color: '#C9A44C', textDecoration: 'underline' }}>สมัครสมาชิกที่นี่</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;