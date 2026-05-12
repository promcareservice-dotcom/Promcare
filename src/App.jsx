import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // ตรวจสอบว่ามีไฟล์นี้เพื่อดึงข้อมูล auth

// นำเข้า Component ทั้งหมด
import Home from './Home';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import CustomerRepair from './CustomerRepair';
import GuestRepair from './GuestRepair';
import MemberDashboard from './MemberDashboard';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. ตรวจสอบ session ปัจจุบันเมื่อเปิดแอป
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. ติดตามการเปลี่ยนแปลงสถานะ (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* หน้าแรกและหน้าแจ้งซ่อมทั่วไป */}
          <Route path="/" element={<Home />} />
          <Route path="/repair-guest" element={<GuestRepair />} />
          
          {/* หน้า Login */}
          <Route path="/login" element={<Login />} />

          {/* แก้ไข: ส่ง session ไปให้ MemberDashboard และ CustomerRepair */}
          <Route 
            path="/member-dashboard" 
            element={session ? <MemberDashboard session={session} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/repair-member" 
            element={session ? <CustomerRepair session={session} /> : <Navigate to="/login" />} 
          />

          {/* หน้า Admin */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Redirect หาก URL ไม่ถูกต้อง */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;