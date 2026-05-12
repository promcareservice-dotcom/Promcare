import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // ตรวจสอบว่าใช้ ./ หรือ ../ ตามโครงสร้างจริง

const RequestRepair = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    registration_number: '',
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
        description: formData.description,
        registration_number: formData.registration_number,
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
      setFormData({ name: '', contact_number: '', registration_number: '', description: '' });

    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // สไตล์แบบ Quiet Luxury
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // พื้นหลังสดใสแต่หรูหรา
      padding: '20px',
      fontFamily: "'Segoe UI', Roboto, sans-serif"
    },
    card: {
      background: '#ffffff',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      width: '100%',
      maxWidth: '500px',
    },
    title: {
      textAlign: 'center',
      color: '#2c3e50',
      marginBottom: '30px',
      fontSize: '24px',
      fontWeight: '600',
      letterSpacing: '1px'
    },
    inputGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#5d6d7e',
      fontSize: '14px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1px solid #dcdde1',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.3s',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1px solid #dcdde1',
      fontSize: '16px',
      minHeight: '120px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '15px',
      backgroundColor: '#2c3e50', // สีกรมท่าหรูหราแบบ Old Money
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.3s',
      marginTop: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>แจ้งซ่อมอุปกรณ์</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>ชื่อผู้แจ้ง</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="กรุณากรอกชื่อ-นามสกุล"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>เบอร์โทรศัพท์ติดต่อ</label>
            <input
              style={styles.input}
              type="text"
              name="contact_number"
              placeholder="08X-XXXXXXX"
              value={formData.contact_number}
              onChange={handleChange}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>เลขทะเบียน / หมายเลขเครื่อง</label>
            <input
              style={styles.input}
              type="text"
              name="registration_number"
              placeholder="ระบุหมายเลขเพื่อการตรวจสอบ"
              value={formData.registration_number}
              onChange={handleChange}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>รายละเอียดอาการเสีย</label>
            <textarea
              style={styles.textarea}
              name="description"
              placeholder="ระบุอาการเบื้องต้นที่พบ..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
          >
            {loading ? 'กำลังส่งข้อมูล...' : 'ยืนยันการแจ้งซ่อม'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestRepair;