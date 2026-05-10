import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Register';
import Login from './Login'; // เพิ่มบรรทัดนี้
import AdminDashboard from './AdminDashboard'; // เพิ่มบรรทัดนี้

function App() {
  return (
    <Router>
      <Routes>
        {/* หน้าแรกให้ไปที่ Register เหมือนเดิม หรือจะเปลี่ยนเป็น Login ก็ได้ครับ */}
        <Route path="/" element={<Register />} />
        
        {/* เพิ่มเส้นทางสำหรับหน้า Login */}
        <Route path="/login" element={<Login />} />
        
        {/* เพิ่มเส้นทางสำหรับหน้า Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;