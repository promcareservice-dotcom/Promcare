import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // ตรวจสอบว่ามีไฟล์นี้ในโปรเจกต์

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State สำหรับเก็บข้อมูลสมัครสมาชิก
  const [regData, setRegData] = useState({
    full_name: '',
    phone: '',
    line_id: '',
    email: '',
    address: '',
    role: 'customer' // กำหนดเริ่มต้นเป็นลูกค้า
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // ส่งข้อมูลไปยังตาราง profiles ใน Supabase
    const { error } = await supabase.from('profiles').insert([regData]);

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      alert('ลงทะเบียนสำเร็จ! ข้อมูลของคุณถูกส่งไปยังแอดมินเรียบร้อยแล้ว');
      setIsModalOpen(false);
      setRegData({ full_name: '', phone: '', line_id: '', email: '', address: '', role: 'customer' });
    }
    setLoading(false);
  };

  const styles = {
    container: {
      backgroundColor: '#000',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: "'Kanit', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px'
    },
    header: { textAlign: 'center', marginBottom: '50px' },
    brandName: { fontSize: '56px', fontWeight: 'bold', color: '#ff4d4d', letterSpacing: '2px', margin: 0 },
    subTitle: { fontSize: '18px', color: '#888', marginTop: '10px', marginBottom: '5px' },
    slogan: { fontSize: '20px', color: '#ff4d4d', fontWeight: '300' },
    cardContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '25px',
      width: '100%',
      maxWidth: '1200px'
    },
    card: {
      backgroundColor: '#111',
      borderRadius: '25px',
      padding: '40px 30px',
      textAlign: 'center',
      border: '1px solid #222',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'all 0.3s ease'
    },
    icon: { fontSize: '50px', marginBottom: '20px' },
    cardTitle: { fontSize: '24px', marginBottom: '15px', fontWeight: '600' },
    cardDetail: { fontSize: '15px', color: '#777', marginBottom: '30px', lineHeight: '1.6', height: '45px' },
    button: {
      padding: '14px 20px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      width: '100%',
      fontSize: '16px',
      transition: 'transform 0.2s'
    },
    // Modal Styles
    modalOverlay: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: '#111',
      width: '100%',
      maxWidth: '500px',
      padding: '30px',
      borderRadius: '30px',
      border: '1px solid #333',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '10px',
      color: '#fff',
      marginBottom: '15px',
      fontSize: '15px',
      boxSizing: 'border-box'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h1 style={styles.brandName}>PROMCARE</h1>
        <p style={styles.subTitle}>Professional Service & Repair Management</p>
        <p style={styles.slogan}>— เราพร้อมดูแลคุณ —</p>
      </div>

      <div style={styles.cardContainer}>
        {/* 1. แจ้งซ่อมอุปกรณ์ */}
        <div style={styles.card}>
          <div style={styles.icon}>🔧</div>
          <h3 style={styles.cardTitle}>แจ้งซ่อมอุปกรณ์</h3>
          <p style={styles.cardDetail}>ส่งข้อมูลแจ้งซ่อมได้ทันที รวดเร็ว ไม่ต้องเป็นสมาชิก</p>
          <button 
            style={{ ...styles.button, backgroundColor: '#ff4d4d', color: '#fff' }}
            onClick={() => navigate('/repair-guest')}
          >
            คลิกแจ้งซ่อม
          </button>
        </div>

        {/* 2. ติดตามสถานะ */}
        <div style={styles.card}>
          <div style={styles.icon}>🔍</div>
          <h3 style={styles.cardTitle}>ติดตามสถานะ</h3>
          <p style={styles.cardDetail}>ตรวจสอบความคืบหน้างานซ่อมของคุณได้ตลอด 24 ชม.</p>
          <button 
            style={{ ...styles.button, backgroundColor: '#222', color: '#fff', border: '1px solid #444' }}
            onClick={() => alert('ฟีเจอร์ติดตามสถานะกำลังจะเปิดให้บริการเร็วๆ นี้')}
          >
            ตรวจสอบงาน
          </button>
        </div>

        {/* 3. สมัครสมาชิก (New Feature) */}
        <div style={styles.card}>
          <div style={styles.icon}>📝</div>
          <h3 style={styles.cardTitle}>สมัครสมาชิก</h3>
          <p style={styles.cardDetail}>ลงทะเบียนเพื่อรับสิทธิพิเศษและบันทึกประวัติการซ่อม</p>
          <button 
            style={{ ...styles.button, backgroundColor: '#28a745', color: '#fff' }}
            onClick={() => setIsModalOpen(true)}
          >
            สมัครสมาชิกใหม่
          </button>
        </div>

        {/* 4. เจ้าหน้าที่ / สมาชิก */}
        <div style={styles.card}>
          <div style={styles.icon}>👤</div>
          <h3 style={styles.cardTitle}>เข้าสู่ระบบ</h3>
          <p style={styles.cardDetail}>สำหรับเจ้าหน้าที่และสมาชิกเพื่อจัดการงานซ่อม</p>
          <button 
            style={{ ...styles.button, backgroundColor: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d' }}
            onClick={() => navigate('/login')}
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>

      {/* Register Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '25px' }}>สมัครสมาชิก</h2>
            <form onSubmit={handleRegister}>
              <label style={{ fontSize: '13px', color: '#888' }}>ชื่อ-นามสกุล</label>
              <input 
                required style={styles.input} type="text" placeholder="ระบุชื่อจริง-นามสกุล"
                value={regData.full_name} onChange={(e) => setRegData({...regData, full_name: e.target.value})}
              />

              <label style={{ fontSize: '13px', color: '#888' }}>เบอร์โทรศัพท์</label>
              <input 
                required style={styles.input} type="tel" placeholder="08x-xxx-xxxx"
                value={regData.phone} onChange={(e) => setRegData({...regData, phone: e.target.value})}
              />

              <label style={{ fontSize: '13px', color: '#888' }}>Line ID</label>
              <input 
                style={styles.input} type="text" placeholder="ไอดีไลน์ของคุณ"
                value={regData.line_id} onChange={(e) => setRegData({...regData, line_id: e.target.value})}
              />

              <label style={{ fontSize: '13px', color: '#888' }}>อีเมล</label>
              <input 
                style={styles.input} type="email" placeholder="example@mail.com"
                value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})}
              />

              <label style={{ fontSize: '13px', color: '#888' }}>ที่อยู่</label>
              <textarea 
                style={{ ...styles.input, height: '80px', fontFamily: 'inherit' }} placeholder="บ้านเลขที่, ถนน, ตำบล..."
                value={regData.address} onChange={(e) => setRegData({...regData, address: e.target.value})}
              />

              <button 
                type="submit" disabled={loading}
                style={{ ...styles.button, backgroundColor: '#ff4d4d', color: '#fff', marginTop: '10px' }}
              >
                {loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลสมัครสมาชิก'}
              </button>
              
              <button 
                type="button" 
                style={{ ...styles.button, backgroundColor: 'transparent', color: '#888', marginTop: '10px', fontSize: '14px' }}
                onClick={() => setIsModalOpen(false)}
              >
                ยกเลิก
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;