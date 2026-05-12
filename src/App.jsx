import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// นำเข้า Component ทั้งหมด
import Home from './Home';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import CustomerRepair from './CustomerRepair';
import GuestRepair from './GuestRepair';
import MemberDashboard from './MemberDashboard'; // นำเข้าหน้าสมาชิกใหม่

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 1. หน้าแรกสุด: เมนูหลัก 3 ช่อง (แจ้งซ่อม/ติดตาม/เข้าระบบ) */}
          <Route path="/" element={<Home />} />

          {/* 2. หน้าแจ้งซ่อมสำหรับลูกค้าทั่วไป (ไม่ต้องล็อกอิน) */}
          <Route path="/repair-guest" element={<GuestRepair />} />

          {/* 3. หน้า Login สำหรับเจ้าหน้าที่ และสมาชิก */}
          <Route path="/login" element={<Login />} />

          {/* 4. หน้าสำหรับสมาชิก (ดูโปรไฟล์, แก้ไขข้อมูล, ติดตามสถานะงานซ่อมของตัวเอง) */}
          <Route path="/member-dashboard" element={<MemberDashboard />} />

          {/* 5. หน้าสำหรับ Admin จัดการระบบหลังบ้าน */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 6. หน้าสำหรับสมาชิกแจ้งซ่อม (เวอร์ชันที่ต้องล็อกอิน) */}
          <Route path="/repair-member" element={<CustomerRepair />} />

          {/* 7. กรณีระบุ URL ไม่ถูกต้อง ให้ดีดกลับไปหน้าเมนูหลัก (Home) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;