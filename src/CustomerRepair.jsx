import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const CustomerRepair = ({ session }) => {
  const navigate = useNavigate();
  const [deviceType, setDeviceType] = useState('');
  const [brand, setBrand] = useState('');
  const [plateNumber, setPlateNumber] = useState(''); // เพิ่มสถานะสำหรับหมายเลขทะเบียน
  const [color, setColor] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      alert("กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
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
            plate_number: plateNumber, // บันทึกหมายเลขทะเบียน (เช็คชื่อคอลัมน์ใน DB ให้ตรงกัน)
            color: color,
            details: details, // ** ตรวจสอบว่าใน Supabase ชื่อคอลัมน์นี้คือ 'details' หรือไม่ **
            status: 'รอรับงาน',
            member_id: session.user.id,
          }
        ]);

      if (error) throw error;

      alert("ส่งข้อมูลแจ้งซ่อมสำเร็จ!");
      navigate('/member-dashboard');
    } catch (error) {
      // แสดง error ให้ชัดเจนขึ้นเพื่อการ debug
      alert("เกิดข้อผิดพลาด: " + error.message);
      console.error("Error details:", error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#fff' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', color: '#888', fontSize: '14px', textAlign: 'center' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #333', backgroundColor: '#111', color: '#fff', textAlign: 'center' },
    textarea: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #333', backgroundColor: '#111', color: '#fff', minHeight: '100px' },
    btnSubmit: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#ff4d4d', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', color: '#ff4d4d' }}>แจ้งซ่อมอุปกรณ์ใหม่</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>ประเภทอุปกรณ์ (เช่น รถยนต์, คอมพิวเตอร์)</label>
          <input style={styles.input} value={deviceType} onChange={(e) => setDeviceType(e.target.value)} required placeholder="ระบุประเภทอุปกรณ์" />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>ยี่ห้อ / รุ่น</label>
          <input style={styles.input} value={brand} onChange={(e) => setBrand(e.target.value)} required placeholder="ระบุยี่ห้อและรุ่น" />
        </div>

        {/* --- เพิ่มช่องกรอกหมายเลขทะเบียน --- */}
        <div style={styles.formGroup}>
          <label style={styles.label}>หมายเลขทะเบียน</label>
          <input style={styles.input} value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="เช่น กข 1234 กรุงเทพฯ" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>สี</label>
          <input style={styles.input} value={color} onChange={(e) => setColor(e.target.value)} placeholder="ระบุสี" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>อาการเสีย / รายละเอียดเพิ่มเติม</label>
          <textarea style={styles.textarea} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="อธิบายอาการเสียเบื้องต้น" />
        </div>

        <button type="submit" style={styles.btnSubmit} disabled={loading}>
          {loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลแจ้งซ่อม'}
        </button>
      </form>
    </div>
  );
};

export default CustomerRepair;