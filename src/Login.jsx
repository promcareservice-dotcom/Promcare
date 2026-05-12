import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(false);
    setLoading(true);

    // 1. ตรวจสอบการ Login ผ่านระบบ Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      alert('เข้าสู่ระบบไม่สำเร็จ: ' + authError.message);
      setLoading(false);
      return;
    }

    // 2. ดึงข้อมูล Role จากตาราง profiles เพื่อแยกหน้าไปตามตำแหน่ง
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      alert('ไม่สามารถดึงข้อมูลสิทธิ์ผู้ใช้งานได้');
      setLoading(false);
      return;
    }

    // 3. ระบบนำทางตาม Role (Admin / Technician / Customer)
    const role = profile.role?.toUpperCase(); // ปรับให้เป็นตัวพิมพ์ใหญ่เพื่อความแม่นยำ

    if (role === 'ADMIN') {
      alert('เข้าสู่ระบบในฐานะ: ผู้ดูแลระบบ');
      navigate('/admin');
    } else if (role === 'TECHNICIAN') {
      alert('เข้าสู่ระบบในฐานะ: ช่างเทคนิค');
      navigate('/admin'); // หรือหน้าสำหรับช่างโดยเฉพาะที่คุณเตรียมไว้
    } else {
      alert('เข้าสู่ระบบในฐานะ: ลูกค้าสมาชิก');
      navigate('/member-dashboard');
    }
  };

  const styles = {
    wrapper: { backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#111', padding: '40px', borderRadius: '24px', border: '1px solid #222', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' },
    title: { color: '#ff4d4d', fontSize: '32px', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '1px' },
    subTitle: { color: '#666', fontSize: '14px', marginBottom: '30px' },
    input: { width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #333', backgroundColor: '#1a1a1a', color: '#fff', boxSizing: 'border-box', outline: 'none' },
    button: { width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#ff4d4d', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', transition: 'opacity 0.3s' }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>PROMCARE</h2>
        <p style={styles.subTitle}>เข้าสู่ระบบเพื่อจัดการงานซ่อมของคุณ</p>
        <form onSubmit={handleLogin}>
          <input 
            style={styles.input} 
            type="email" 
            placeholder="อีเมลผู้ใช้งาน" 
            required 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            style={styles.input} 
            type="password" 
            placeholder="รหัสผ่าน" 
            required 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <p 
          onClick={() => navigate('/')} 
          style={{ color: '#444', marginTop: '25px', cursor: 'pointer', fontSize: '14px' }}
        >
          ← กลับไปหน้าหลัก
        </p>
      </div>
    </div>
  );
};

export default Login;