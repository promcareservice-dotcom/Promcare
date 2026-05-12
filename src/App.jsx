import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// นำเข้า Component ต่างๆ
import Home from './Home';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import CustomerRepair from './CustomerRepair';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 1. หน้าหลัก (Landing Page) ตามภาพ image_fc5c45.png */}
          <Route path="/home" element={<Home />} />

          {/* 2. หน้า Login สำหรับเจ้าหน้าที่และสมาชิก */}
          <Route path="/" element={<Login />} />

          {/* 3. หน้าสำหรับ Admin จัดการระบบ */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 4. หน้าสำหรับสมาชิกแจ้งซ่อม */}
          <Route path="/repair" element={<CustomerRepair />} />

          {/* 5. กรณีระบุ URL ไม่ถูกต้อง ให้เด้งกลับไปหน้า Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;