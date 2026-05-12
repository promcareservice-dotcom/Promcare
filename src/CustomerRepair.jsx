import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const CustomerRepair = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    device_type: '',
    brand: '',
    model: '',
    license_plate: '',
    color: '',
    description: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      } else {
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('repair_tasks').insert([
      { 
        ...formData, 
        customer_name: profile.full_name,
        phone: profile.phone,
        status: 'pending',
        created_at: new Date()
      }
    ]);

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      alert('ส่งข้อมูลแจ้งซ่อมสำเร็จ!');
      navigate('/member-dashboard');
    }
    setLoading(false);
  };

  const styles = {
    wrapper: { backgroundColor: '#0a0a0a', minHeight: '100vh', padding: '40px 20px', color: '#fff', fontFamily: 'sans-serif' },
    container: { maxWidth: '600px', margin: '0 auto', backgroundColor: '#111', padding: '40px', borderRadius: '24px', border: '1px solid #222' },
    title: { color: '#ff4d4d', fontSize: '28px', marginBottom: '10px', fontWeight: 'bold' },
    infoBox: { backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '12px', marginBottom: '25px', border: '1px dotted #333' },
    input: { width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #333', backgroundColor: '#1a1a1a', color: '#fff', boxSizing: 'border-box' },
    button: { width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#ff4d4d', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }
  };

  if (!profile) return <div style={styles.wrapper}>กำลังโหลดข้อมูลโปรไฟล์...</div>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>แจ้งซ่อมอุปกรณ์ใหม่</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>ระบบดึงข้อมูลสมาชิกของคุณให้อัตโนมัติ</p>

        <div style={styles.infoBox}>
          <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>ชื่อผู้แจ้ง: <strong>{profile.full_name}</strong></p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#888' }}>เบอร์โทรศัพท์: <strong>{profile.phone}</strong></p>
        </div>

        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="ประเภทอุปกรณ์ (เช่น รถยนต์, โน้ตบุ๊ก)" required 
            onChange={e => setFormData({...formData, device_type: e.target.value})} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input style={styles.input} placeholder="ยี่ห้อ" required 
              onChange={e => setFormData({...formData, brand: e.target.value})} />
            <input style={styles.input} placeholder="รุ่น" required 
              onChange={e => setFormData({...formData, model: e.target.value})} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input style={styles.input} placeholder="เลขทะเบียน / Serial No." required 
              onChange={e => setFormData({...formData, license_plate: e.target.value})} />
            <input style={styles.input} placeholder="สี" required 
              onChange={e => setFormData({...formData, color: e.target.value})} />
          </div>

          <textarea style={{ ...styles.input, height: '100px' }} placeholder="อาการเสีย / รายละเอียดเพิ่มเติม" required 
            onChange={e => setFormData({...formData, description: e.target.value})} />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'กำลังส่งข้อมูล...' : 'ยืนยันการแจ้งซ่อม'}
          </button>
        </form>

        <center>
          <button onClick={() => navigate('/member-dashboard')} style={{ background: 'none', border: 'none', color: '#444', marginTop: '20px', cursor: 'pointer' }}>
            ← ยกเลิกและกลับหน้าเดิม
          </button>
        </center>
      </div>
    </div>
  );
};

export default CustomerRepair;