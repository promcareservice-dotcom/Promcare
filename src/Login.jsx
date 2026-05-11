import React, { useState } from 'react';
import { supabase } from './supabaseClient';
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
      // 1. ตรวจสอบอีเมลและรหัสผ่านผ่าน Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // 2. ถ้าล็อกอินผ่าน ให้ไปดึงข้อมูล 'role' จากตาราง profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      // 3. ตรวจสอบว่าเป็นแอดมินหรือไม่
      if (profile?.role === 'admin') {
        alert('ยินดีต้อนรับแอดมิน!');
        navigate('/admin'); // ไปยังหน้า AdminDashboard
      } else {
        alert('ขออภัย: บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบแอดมิน');
        await supabase.auth.signOut(); // บังคับ Logout ออกถ้าไม่ใช่แอดมิน
      }
    } catch (error) {
      alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <form onSubmit={handleLogin} style={{ background: '#161616', padding: '40px', borderRadius: '20px', border: '1px solid #333', width: '350px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#ff4d4d', margin: 0, fontSize: '1.8rem' }}>PROMCARE</h1>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>ระบบจัดการงานซ่อม (แอดมิน)</p>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '0.85rem', color: '#aaa' }}>อีเมลพนักงาน</label>
          <input 
            type="email" 
            placeholder="example@mail.com" 
            required
            onChange={(e) => setEmail(e.target.value)} 
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ fontSize: '0.85rem', color: '#aaa' }}>รหัสผ่าน</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            required
            onChange={(e) => setPassword(e.target.value)} 
            style={inputStyle}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '10px', 
            border: 'none', 
            background: loading ? '#555' : '#ff4d4d', 
            color: '#fff', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: '0.3s'
          }}
        >
          {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบแอดมิน'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = { 
  width: '100%', 
  padding: '12px', 
  marginTop: '5px', 
  borderRadius: '10px', 
  background: '#222', 
  color: '#fff', 
  border: '1px solid #444',
  boxSizing: 'border-box',
  outline: 'none'
};

export default Login;