import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Import หน้าเดิมที่มีอยู่
import Login from './Login';
import AdminDashboard from './AdminDashboard';

// Import หน้าใหม่ที่เพิ่งสร้างใน src
import Home from './Home';
import RequestRepair from './RequestRepair';
import TrackStatus from './TrackStatus';

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
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'Kanit' }}>
        กำลังโหลดระบบ Promcare...
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
        <Routes>
          {/* หน้าแรก (Public): ให้ทุกคนเข้าถึงได้เพื่อเลือกบริการ */}
          <Route path="/" element={<Home />} />
          
          {/* หน้าแจ้งซ่อม และ หน้าเช็คสถานะ: เปิดให้ลูกค้าทั่วไปเข้าได้ */}
          <Route path="/request" element={<RequestRepair />} />
          <Route path="/track" element={<TrackStatus />} />
          
          {/* หน้า Login: ถ้า Login แล้วให้เด้งไปหน้า Admin ทันที */}
          <Route 
            path="/login" 
            element={session ? <Navigate to="/admin" /> : <Login />} 
          />
          
          {/* หน้า Admin: ถ้าไม่ได้ Login ให้เด้งไปหน้า Login ก่อน */}
          <Route 
            path="/admin" 
            element={session ? <AdminDashboard /> : <Navigate to="/login" />} 
          />

          {/* กรณีพิมพ์ URL อื่นๆ ให้เด้งกลับไปหน้าแรก (Home) */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;