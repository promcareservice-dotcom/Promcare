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
      // 1. เข้าสู่ระบบด้วย Email และ Password ผ่าน Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      const user = data.user;

      // 2. ดึงข้อมูลบทบาท (Role) จากตาราง profiles โดยใช้ User ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Profile Fetch Error:", profileError);
        throw new Error("ไม่พบข้อมูลสิทธิ์การใช้งานในระบบ");
      }

      alert('✅ เข้าสู่ระบบสำเร็จ');

      // 3. ตรวจสอบเงื่อนไขบทบาทเพื่อแยกหน้าการใช้งาน
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        // ส่ง userId ไปยังหน้าแจ้งซ่อมเพื่อให้ระบบดึงข้อมูลส่วนตัวได้ถูกต้อง
        navigate('/repair', { state: { userId: user.id } });
      }

    } catch (err) {
      alert('❌ ล็อกอินไม่สำเร็จ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    wrapper: { backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' },
    container: { background: '#111', padding: '40px', borderRadius: '15px', border: '1px solid #333', width: '350px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
    header: { textAlign: 'center', marginBottom: '25px', color: '#ff4d4d', fontSize: '24px', fontWeight: 'bold' },
    input: { padding: '12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px', width: '100%', boxSizing: 'border-box' },
    button: { padding: '15px', background: '#d92b2b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>Promcare Service</div>
        <form onSubmit={handleLogin} style={styles.form}>
          <input 
            type="email" 
            placeholder="อีเมลผู้ใช้งาน" 
            required 
            style={styles.input}
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="รหัสผ่าน" 
            required 
            style={styles.input}
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button 
            type="submit" 
            disabled={loading} 
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
          >
            {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;