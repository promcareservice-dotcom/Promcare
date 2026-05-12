import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const GuestRepair = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: '', phone: '', device_type: '', brand: '', model: '', description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('repair_tasks').insert([
      { ...formData, status: 'pending' }
    ]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('ส่งข้อมูลแจ้งซ่อมสำเร็จ! เราจะติดต่อกลับโดยเร็วที่สุด');
      navigate('/');
    }
  };

  const styles = {
    wrapper: {
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: "'Inter', sans-serif"
    },
    container: {
      backgroundColor: '#111',
      width: '100%',
      maxWidth: '500px',
      padding: '40px',
      borderRadius: '24px',
      border: '1px solid #222',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
    },
    header: { textAlign: 'center', marginBottom: '35px' },
    title: { fontSize: '24px', fontWeight: '600', color: '#fff', margin: '0 0 10px 0', letterSpacing: '0.5px' },
    subTitle: { fontSize: '14px', color: '#666', margin: 0 },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' },
    input: {
      width: '100%',
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '14px 16px',
      color: '#fff',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      outline: 'none'
    },
    textarea: {
      width: '100%',
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '14px 16px',
      color: '#fff',
      fontSize: '15px',
      height: '120px',
      resize: 'none',
      boxSizing: 'border-box',
      outline: 'none'
    },
    submitBtn: {
      width: '100%',
      backgroundColor: '#ff4d4d',
      color: '#fff',
      padding: '16px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'transform 0.2s, opacity 0.2s'
    },
    cancelBtn: {
      width: '100%',
      backgroundColor: 'transparent',
      color: '#555',
      padding: '12px',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      marginTop: '10px',
      textDecoration: 'none'
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Service Request</h2>
          <p style={styles.subTitle}>กรุณากรอกข้อมูลเพื่อแจ้งซ่อมอุปกรณ์ของคุณ</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input 
              style={styles.input} 
              placeholder="ชื่อ-นามสกุล ของคุณ" 
              required 
              onChange={e => setFormData({...formData, customer_name: e.target.value})} 
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contact Number</label>
            <input 
              style={styles.input} 
              placeholder="08X-XXX-XXXX" 
              required 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
            />
          </div>

          <div style={{ ...styles.formGroup, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={styles.label}>Device Type</label>
              <input 
                style={styles.input} 
                placeholder="ประเภทอุปกรณ์" 
                required 
                onChange={e => setFormData({...formData, device_type: e.target.value})} 
              />
            </div>
            <div>
              <label style={styles.label}>Brand / Model</label>
              <input 
                style={styles.input} 
                placeholder="ยี่ห้อ/รุ่น" 
                onChange={e => setFormData({...formData, brand: e.target.value})} 
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Issue Description</label>
            <textarea 
              style={styles.textarea} 
              placeholder="ระบุอาการเสียโดยสังเขป..." 
              required 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <button 
            type="submit" 
            style={styles.submitBtn}
            onMouseOver={(e) => e.target.style.opacity = '0.9'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            ส่งข้อมูลแจ้งซ่อม
          </button>
          
          <button type="button" onClick={() => navigate('/')} style={styles.cancelBtn}>
            ยกเลิกและกลับหน้าหลัก
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuestRepair;