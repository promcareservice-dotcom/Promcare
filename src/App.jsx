import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// นำเข้า Component ต่างๆ (ตรวจสอบให้มั่นใจว่าชื่อไฟล์ในโฟลเดอร์ src ตรงตามนี้)
import Home from './Home';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import CustomerRepair from './CustomerRepair';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 1. ตั้งค่าหน้าแรกสุด (/) ให้เปิดหน้า Home (เมนู 3 ช่อง) ทันที */}
          <Route path="/" element={<Home />} />

          {/* 2. หน้า Login สำหรับเจ้าหน้าที่/สมาชิก เข้าผ่านปุ่มในหน้า Home */}
          <Route path="/login" element={<Login />} />

          {/* 3. หน้าสำหรับ Admin (จะถูกส่งมาที่นี่ถ้า Login สำเร็จและเป็น admin) */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 4. หน้าสำหรับสมาชิกแจ้งซ่อม (จะถูกส่งมาที่นี่ถ้า Login สำเร็จและเป็น customer) */}
          <Route path="/repair" element={<CustomerRepair />} />

          {/* 5. กรณีเข้า URL อื่นที่ไม่ถูกต้อง ให้ดีดกลับไปหน้า Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;