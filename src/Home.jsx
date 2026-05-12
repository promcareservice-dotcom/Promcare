import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      backgroundColor: '#000',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px'
    },
    header: { textAlign: 'center', marginBottom: '50px' },
    brandName: { fontSize: '48px', fontWeight: 'bold', color: '#ff4d4d', letterSpacing: '2px', margin: 0 },
    subTitle: { fontSize: '18px', color: '#888', marginTop: '5px' },
    cardContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      width: '100%',
      maxWidth: '1100px'
    },
    card: {
      backgroundColor: '#111',
      borderRadius: '20px',
      padding: '40px 20px',
      textAlign: 'center',
      border: '1px solid #222',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'transform 0.3s'
    },
    icon: { fontSize: '50px', marginBottom: '20px' },
    cardTitle: { fontSize: '22px', marginBottom: '15px' },
    cardDetail: { fontSize: '14px', color: '#666', marginBottom: '30px', lineHeight: '1.5' },
    button: {
      padding: '12px 30px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      width: '80%',
      transition: 'opacity 0.3s'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.brandName}>PROMCARE</h1>
        <p style={styles.subTitle}>Professional Service & Repair Management</p>
      </div>

      <div style={styles.cardContainer}>
        
        {/* 1. แจ้งซ่อมอุปกรณ์ (สำหรับลูกค้าทั่วไป - ไม่ต้องล็อกอิน) */}
        <div style={styles.card}>
          <div style={styles.icon}>🔧</div>
          <h3 style={styles.cardTitle}>แจ้งซ่อมอุปกรณ์</h3>
          <p style={styles.cardDetail}>ส่งข้อมูลแจ้งซ่อมได้ทันที ไม่ต้องเป็นสมาชิก</p>
          <button 
            style={{ ...styles.button, backgroundColor: '#ff4d4d', color: '#fff' }}
            onClick={() => navigate('/repair-guest')} // ลิงก์ไปหน้าแจ้งซ่อมทั่วไป
          >
            คลิกแจ้งซ่อม
          </button>
        </div>

        {/* 2. ติดตามสถานะ (ฟีเจอร์เพิ่มเติม) */}
        <div style={styles.card}>
          <div style={styles.icon}>🔍</div>
          <h3 style={styles.cardTitle}>ติดตามสถานะ</h3>
          <p style={styles.cardDetail}>เช็คสถานะงานซ่อมของคุณด้วยเบอร์โทรศัพท์</p>
          <button 
            style={{ ...styles.button, backgroundColor: '#333', color: '#fff' }}
            onClick={() => alert('ฟีเจอร์ติดตามสถานะกำลังจะเปิดให้บริการเร็วๆ นี้')}
          >
            ตรวจสอบงาน
          </button>
        </div>

        {/* 3. เจ้าหน้าที่ / สมาชิก (หน้า Login) */}
        <div style={styles.card}>
          <div style={styles.icon}>👤</div>
          <h3 style={styles.cardTitle}>เจ้าหน้าที่ / สมาชิก</h3>
          <p style={styles.cardDetail}>เข้าสู่ระบบเพื่อจัดการงานซ่อมและข้อมูลสมาชิก</p>
          <button 
            style={{ ...styles.button, backgroundColor: 'transparent', border: '1px solid #444', color: '#fff' }}
            onClick={() => navigate('/login')} // ลิงก์ไปหน้า Login
          >
            เข้าสู่ระบบ
          </button>
        </div>

      </div>
    </div>
  );
};

export default Home;