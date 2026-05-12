import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// นำเข้า Component ต่างๆ (ตรวจสอบชื่อไฟล์ให้ตรงกับที่คุณตั้งไว้นะครับ)
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import CustomerRepair from './CustomerRepair';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 1. หน้าแรกคือหน้า Login */}
          <Route path="/" element={<Login />} />

          {/* 2. หน้าสำหรับ Admin จัดการระบบ */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 3. หน้าสำหรับสมาชิกแจ้งซ่อม (หน้าใหม่ที่คุณเพิ่งสร้าง) */}
          <Route path="/repair" element={<CustomerRepair />} />

          {/* 4. ถ้าใส่ URL มั่ว ให้เด้งกลับไปหน้า Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;