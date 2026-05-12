import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Import หน้าเดิมที่มีอยู่
import Login from './Login';

// Import หน้าที่มีอยู่ใน src
import Home from './Home';
import RequestRepair from './RequestRepair';
import TrackStatus from './TrackStatus';
// แก้ไขจุดนี้: ชี้ชื่อ AdminPage ไปที่ไฟล์ AdminDashboard.jsx ที่คุณมีอยู่จริง
import AdminPage from './AdminDashboard'; 

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

  // หน้าจอรอโหลดสไตล์ Dark Mode
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
          {/* หน้าแรก (Public): ให้ทุกคนเข้าถึงได้ */}
          <Route path="/" element={<Home />} />
          
          {/* หน้าแจ้งซ่อม และ หน้าเช็คสถานะ */}
          <Route path="/request" element={<RequestRepair />} />
          <Route path="/track" element={<TrackStatus />} />
          
          {/* หน้า Login: ถ้า Login แล้วให้ไปหน้า Admin */}
          <Route 
            path="/login" 
            element={session ? <Navigate to="/admin" /> : <Login />} 
          />
          
          {/* หน้า Admin Dashboard: ตรวจสอบสิทธิ์การเข้าถึง */}
          <Route 
            path="/admin" 
            element={session ? <AdminPage /> : <Navigate to="/login" />} 
          />

          {/* กรณีพิมพ์ URL ผิด ให้กลับไปหน้าแรก */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;