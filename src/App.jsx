import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Register from './Register';
import Login from './Login';
import AdminDashboard from './AdminDashboard';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // ตรวจสอบเซสชันเมื่อโหลดแอป
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // ฟังการเปลี่ยนแปลงสถานะ (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app-container" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
        <Routes>
          {/* หน้าแรก: ถ้าล็อกอินแล้วให้ไปหน้า Admin ถ้ายังไม่ล็อกอินให้ไปหน้า Login */}
          <Route path="/" element={session ? <Navigate to="/admin" /> : <Navigate to="/login" />} />
          
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* หน้า Admin: ระบบจะตรวจสอบสิทธิ์ในไฟล์ AdminDashboard อีกครั้งเพื่อความปลอดภัย */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* กรณีพิมพ์ URL มั่ว ให้เด้งไปหน้า Login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;