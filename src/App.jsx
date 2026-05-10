import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import AdminDashboard from './AdminDashboard';
import MemberDashboard from './MemberDashboard';

function App() {
  const [username, setUsername] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. ฟังก์ชันสำหรับการ Login
  const handleLogin = async () => {
    if (!username) return alert('กรุณาใส่ชื่อผู้ใช้งาน');
    setLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      alert('ไม่พบรายชื่อผู้ใช้งานนี้ในระบบ');
    } else {
      setCurrentUser(data);
    }
    setLoading(false);
  };

  // 2. ฟังก์ชันสำหรับการ Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
  };

  // 3. ส่วนการแสดงผลหลัก (ใช้เงื่อนไขเช็ก Login และ Role)
  return (
    <div className="app-container" style={{ backgroundColor: '#121212', minHeight: '100vh', color: 'white', fontFamily: 'Arial, sans-serif' }}>
      {!currentUser ? (
        /* --- กรณีที่ 1: ยังไม่ได้ Login ให้โชว์หน้า Login --- */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '100px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
            PROMCARE <span style={{ color: '#ef4444' }}>APP</span>
          </h1>
          <p style={{ color: '#a1a1aa', marginBottom: '30px' }}>ระบบจัดการบริการออนไลน์ (Cloud Management)</p>
          
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '15px', border: '1px solid #27272a', width: '350px', textAlign: 'center' }}>
            <input 
              type="text" 
              placeholder="ชื่อผู้ใช้งาน (Username)"
              value={username}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#27272a', color: 'white', border: '1px solid #3f3f46', marginBottom: '15px', outline: 'none' }}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button 
              onClick={handleLogin}
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer', border: 'none', transition: '0.3s' }}
            >
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </div>
      ) : (
        /* --- กรณีที่ 2: Login สำเร็จแล้ว ให้เช็ก Role เพื่อแยกหน้า Dashboard --- */
        currentUser.role === 'Admin' ? (
          <AdminDashboard user={currentUser} onLogout={handleLogout} />
        ) : (
          <MemberDashboard user={currentUser} onLogout={handleLogout} />
        )
      )}
    </div>
  );
}

export default App;