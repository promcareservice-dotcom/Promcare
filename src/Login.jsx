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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      alert('✅ เข้าสู่ระบบสำเร็จ');
      navigate('/admin'); 
    } catch (error) {
      alert('❌ เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#111', padding: '40px', borderRadius: '15px', border: '1px solid #333', width: '350px', color: '#fff' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px' }}>Admin Access</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="อีเมล" required style={{ padding: '12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px' }}
            onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="รหัสผ่าน" required style={{ padding: '12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px' }}
            onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" disabled={loading} style={{ padding: '15px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
            {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;