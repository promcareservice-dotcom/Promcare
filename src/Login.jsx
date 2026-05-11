import React, { useState } from 'react';
import { supabase } from './supabaseClient.js';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      alert('เข้าสู่ระบบสำเร็จ');
      navigate('/admin'); 
    } catch (error) {
      alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="อีเมลพนักงาน" required
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="รหัสผ่าน" required
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="submit" disabled={loading}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-bold"
          >
            {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;