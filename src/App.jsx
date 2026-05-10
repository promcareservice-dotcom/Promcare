import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import MemberDashboard from './MemberDashboard';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. ตรวจสอบ Session เมื่อโหลดแอปครั้งแรก
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. ติดตามการเปลี่ยนแปลงสถานะ Login/Logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // หน้าจอรอโหลด
  if (loading) {
    return (
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
        กำลังโหลดระบบ...
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
        <Routes>
          {/* หน้าแรก: ถ้า Login แล้วให้ไปหน้า Admin ถ้ายังไม่ Login ให้ไปหน้า Login */}
          <Route 
            path="/" 
            element={session ? <Navigate to="/admin" /> : <Navigate to="/login" />} 
          />
          
          {/* เส้นทางสำหรับหน้า Login */}
          <Route path="/login" element={<Login />} />
          
          {/* เส้นทางสำหรับหน้า Admin */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* กรณีพิมพ์ URL อื่นๆ ให้เด้งไปหน้า Login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;