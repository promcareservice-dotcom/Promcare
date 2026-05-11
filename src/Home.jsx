import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={logoStyle}>PROMCARE</h1>
        <p style={subtitleStyle}>Professional Service & Repair Management</p>
      </header>

      <div style={gridStyle}>
        {/* ปุ่ม 1: สำหรับลูกค้าแจ้งซ่อม */}
        <div style={cardStyle} onClick={() => navigate('/request')}>
          <div style={iconStyle}>🔧</div>
          <h2 style={cardTitle}>แจ้งซ่อมอุปกรณ์</h2>
          <p style={cardDesc}>ส่งข้อมูลแจ้งซ่อมได้ทันที ไม่ต้องเป็นสมาชิก</p>
          <button style={btnAction}>คลิกแจ้งซ่อม</button>
        </div>

        {/* ปุ่ม 2: สำหรับเช็คสถานะ */}
        <div style={cardStyle} onClick={() => navigate('/track')}>
          <div style={iconStyle}>🔍</div>
          <h2 style={cardTitle}>ติดตามสถานะ</h2>
          <p style={cardDesc}>เช็คสถานะงานซ่อมของคุณด้วยเบอร์โทรศัพท์</p>
          <button style={{...btnAction, background: '#333'}}>ตรวจสอบงาน</button>
        </div>

        {/* ปุ่ม 3: สำหรับแอดมิน/ช่าง */}
        <div style={cardStyle} onClick={() => navigate('/login')}>
          <div style={iconStyle}>👤</div>
          <h2 style={cardTitle}>เจ้าหน้าที่ / สมาชิก</h2>
          <p style={cardDesc}>เข้าสู่ระบบเพื่อจัดการงานซ่อมและข้อมูลสมาชิก</p>
          <button style={{...btnAction, background: 'none', border: '1px solid #444'}}>เข้าสู่ระบบ</button>
        </div>
      </div>

      <footer style={footerStyle}>
        © 2026 Promcare Service. All rights reserved.
      </footer>
    </div>
  );
}

// --- CSS Styles (แบบ Inline) ---
const containerStyle = {
  backgroundColor: '#000',
  minHeight: '100vh',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '60px 20px',
  fontFamily: "'Kanit', sans-serif"
};

const headerStyle = { textAlign: 'center', marginBottom: '50px' };
const logoStyle = { color: '#ff4d4d', fontSize: '3.5rem', fontWeight: 'bold', margin: 0, letterSpacing: '4px' };
const subtitleStyle = { color: '#888', fontSize: '1.1rem', marginTop: '10px' };

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '25px',
  maxWidth: '1100px',
  width: '100%'
};

const cardStyle = {
  background: '#0a0a0a',
  padding: '40px 30px',
  borderRadius: '25px',
  border: '1px solid #222',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'transform 0.3s, border-color 0.3s',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const iconStyle = { fontSize: '50px', marginBottom: '20px' };
const cardTitle = { fontSize: '1.5rem', marginBottom: '10px', color: '#fff' };
const cardDesc = { color: '#666', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.5' };

const btnAction = {
  padding: '12px 25px',
  background: '#ff4d4d',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  width: '100%'
};

const footerStyle = { marginTop: 'auto', paddingTop: '50px', color: '#333', fontSize: '0.8rem' };

export default Home;