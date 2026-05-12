import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const CustomerRepair = ({ session }) => {
  const navigate = useNavigate();
  const [deviceType, setDeviceType] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ตรวจสอบความปลอดภัย: ถ้าไม่มี session (ไม่ได้ login) จะไม่ให้ส่งข้อมูล
    if (!session?.user?.id) {
      alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('repair_tasks')
        .insert([
          {
            device_type: deviceType,
            brand: brand,
            color: color,
            details: details,
            status: 'รอรับงาน',
            member_id: session.user.id, // *** จุดสำคัญที่สุด: บันทึก ID ของสมาชิกที่ล็อกอินอยู่ ***
            customer_confirmation: 'pending' // ตั้งค่าเริ่มต้นให้รอการยืนยัน
          }
        ]);

      if (error) throw error;

      alert("ส่งข้อมูลแจ้งซ่อมสำเร็จ!");
      navigate('/member-dashboard'); // เมื่อส่งเสร็จ ให้กลับไปหน้าโปรไฟล์สมาชิกทันที
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#fff', fontFamily: 'sans-serif' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', color: '#888', fontSize: '14px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #333', backgroundColor: '#111', color: '#fff', fontSize: '16px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #333', backgroundColor: '#111', color: '#fff', fontSize: '16px', minHeight: '100px', boxSizing: 'border-box' },
    btnSubmit: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#ff4d4d', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', color: '#ff4d4d', marginBottom: '30px' }}>แจ้งซ่อมอุปกรณ์ใหม่</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>ประเภทอุปกรณ์ (เช่น รถยนต์, คอมพิวเตอร์)</label>
          <input 
            style={styles.input} 
            value={deviceType} 
            onChange={(e) => setDeviceType(e.target.value)} 
            required 
            placeholder="ระบุประเภทอุปกรณ์"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>ยี่ห้อ / รุ่น</label>
          <input 
            style={styles.input} 
            value={brand} 
            onChange={(e) => setBrand(e.target.value)} 
            required 
            placeholder="ระบุยี่ห้อและรุ่น"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>สี</label>
          <input 
            style={styles.input} 
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
            placeholder="ระบุสี (ถ้ามี)"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>อาการเสีย / รายละเอียดเพิ่มเติม</label>
          <textarea 
            style={styles.textarea} 
            value={details} 
            onChange={(e) => setDetails(e.target.value)} 
            placeholder="อธิบายอาการเสียเบื้องต้น"
          />
        </div>
        <button 
          type="submit" 
          style={styles.btnSubmit} 
          disabled={loading}
        >
          {loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลแจ้งซ่อม'}
        </button>
      </form>
    </div>
  );
};

export default CustomerRepair;