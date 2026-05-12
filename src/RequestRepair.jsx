import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const RequestRepair = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    device_type: '', // เพิ่มใหม่
    registration_number: '',
    color: '', // เพิ่มใหม่
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const repairPayload = {
        device_type: formData.device_type, // ส่งประเภทอุปกรณ์
        registration_number: formData.registration_number,
        color: formData.color, // ส่งข้อมูลสี
        description: formData.description,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      if (user) {
        repairPayload.phone = formData.contact_number;
        repairPayload.member_id = user.id;
      } else {
        repairPayload.guest_tel = formData.contact_number;
        repairPayload.guest_name = formData.name;
      }

      const { error } = await supabase.from('repair_tasks').insert([repairPayload]);
      if (error) throw error;

      alert('ส่งข้อมูลแจ้งซ่อมสำเร็จ!');
      setFormData({ name: '', contact_number: '', device_type: '', registration_number: '', color: '', description: '' });

    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif" },
    card: { background: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '550px' },
    title: { textAlign: 'center', color: '#2c3e50', marginBottom: '30px', fontSize: '24px', fontWeight: '600' },
    inputGroup: { marginBottom: '18px' },
    label: { display: 'block', marginBottom: '8px', color: '#5d6d7e', fontSize: '14px', fontWeight: '500', textAlign: 'center' },
    input: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #dcdde1', fontSize: '16px', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #dcdde1', fontSize: '16px', backgroundColor: 'white', cursor: 'pointer', outline: 'none', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #dcdde1', fontSize: '16px', minHeight: '100px', outline: 'none', boxSizing: 'border-box' },
    button: { width: '100%', padding: '15px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>แจ้งซ่อมอุปกรณ์</h2>
        <form onSubmit={handleSubmit}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>ชื่อผู้แจ้ง</label>
            <input style={styles.input} type="text" name="name" placeholder="กรุณากรอกชื่อ-นามสกุล" value={formData.name} onChange={handleChange} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>เบอร์โทรศัพท์ติดต่อ</label>
            <input style={styles.input} type="text" name="contact_number" placeholder="08X-XXXXXXX" value={formData.contact_number} onChange={handleChange} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>ประเภทอุปกรณ์</label>
            <select style={styles.select} name="device_type" value={formData.device_type} onChange={handleChange} required>
              <option value="">-- เลือกประเภท --</option>
              <option value="รถยนต์">รถยนต์</option>
              <option value="รถจักรยานยนต์">รถจักรยานยนต์</option>
              <option value="รถจักรยาน">รถจักรยาน</option>
              <option value="แอร์">แอร์</option>
              <option value="พัดลม">พัดลม</option>
              <option value="ทีวี">ทีวี</option>
              <option value="เครื่องซักผ้า">เครื่องซักผ้า</option>
              <option value="ไมโครเวฟ">ไมโครเวฟ</option>
              <option value="เตารีด">เตารีด</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>เลขทะเบียน / หมายเลขเครื่อง</label>
            <input style={styles.input} type="text" name="registration_number" placeholder="ระบุหมายเลขเพื่อการตรวจสอบ" value={formData.registration_number} onChange={handleChange} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>สี</label>
            <input style={styles.input} type="text" name="color" placeholder="ระบุสีของอุปกรณ์ (ถ้ามี)" value={formData.color} onChange={handleChange} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>รายละเอียดอาการเสีย</label>
            <textarea style={styles.textarea} name="description" placeholder="ระบุอาการเบื้องต้นที่พบ..." value={formData.description} onChange={handleChange} required />
          </div>

          <button type="submit" disabled={loading} style={{...styles.button, opacity: loading ? 0.7 : 1}}>
            {loading ? 'กำลังบันทึก...' : 'ยืนยันการแจ้งซ่อม'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestRepair;