import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ full_name: '', phone: '' });
  const [repairs, setRepairs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      // 1. ดึงข้อมูลโปรไฟล์สมาชิก
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);

        // 2. ดึงข้อมูลรายการแจ้งซ่อม (กรองตามเบอร์โทรศัพท์เพื่อให้สัมพันธ์กับรูปภาพ image_f0f73b.png)
        const { data: repairData } = await supabase
          .from('repair_tasks')
          .select('*')
          .eq('phone', profileData.phone)
          .order('created_at', { ascending: false });

        setRepairs(repairData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: profile.full_name, phone: profile.phone })
      .eq('id', user.id);

    if (error) {
      alert(error.message);
    } else {
      alert('อัปเดตข้อมูลโปรไฟล์สำเร็จ');
      setIsEditing(false);
      fetchUserData(); // โหลดข้อมูลใหม่หลังจากอัปเดต
    }
  };

  const styles = {
    wrapper: { backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', padding: '40px 20px', fontFamily: "'Inter', sans-serif" },
    container: { maxWidth: '800px', margin: '0 auto' },
    section: { backgroundColor: '#111', borderRadius: '24px', padding: '35px', border: '1px solid #222', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
    title: { fontSize: '24px', fontWeight: '600', marginBottom: '25px', color: '#ff4d4d', letterSpacing: '0.5px' },
    label: { display: 'block', fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' },
    dataText: { fontSize: '18px', marginBottom: '20px', color: '#fff', fontWeight: '500' },
    input: { width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '16px', outline: 'none' },
    repairButton: {
      width: '100%',
      backgroundColor: '#ff4d4d',
      color: '#fff',
      padding: '16px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: 'bold',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'transform 0.2s',
      boxShadow: '0 4px 15px rgba(255, 77, 77, 0.3)'
    },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { textAlign: 'left', color: '#444', padding: '12px 10px', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #222' },
    td: { padding: '15px 10px', borderBottom: '1px solid #222', fontSize: '14px' },
    badge: (status) => ({
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: 'bold',
      backgroundColor: status === 'pending' ? '#222' : '#ff4d4d',
      color: '#fff',
      textTransform: 'uppercase'
    })
  };

  if (loading) return <div style={styles.wrapper}>กำลังโหลดข้อมูล...</div>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        
        {/* ส่วนที่ 1: ข้อมูลสมาชิก (Member Profile) */}
        <div style={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ ...styles.title, margin: 0 }}>Member Profile</h2>
            <button 
              onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
              style={{ backgroundColor: 'transparent', color: isEditing ? '#ff4d4d' : '#888', border: '1px solid #333', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}
            >
              {isEditing ? 'ยืนยันการแก้ไข' : 'Edit Profile'}
            </button>
          </div>
          
          <div>
            <label style={styles.label}>Full Name</label>
            {isEditing ? (
              <input style={styles.input} value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
            ) : <p style={styles.dataText}>{profile.full_name || 'ไม่ระบุชื่อ'}</p>}

            <label style={styles.label}>Phone Number</label>
            {isEditing ? (
              <input style={styles.input} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
            ) : <p style={{ ...styles.dataText, marginBottom: 0 }}>{profile.phone || 'ไม่ระบุเบอร์โทร'}</p>}
          </div>

          {/* ปุ่มแจ้งซ่อมใหม่ (เพิ่มตามคำขอ) */}
          <button 
            onClick={() => navigate('/repair-member')} 
            style={styles.repairButton}
            onMouseOver={(e) => e.target.style.opacity = '0.9'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            + แจ้งซ่อมอุปกรณ์ใหม่
          </button>
        </div>

        {/* ส่วนที่ 2: ติดตามสถานะ (Repair Tracking) */}
        <div style={styles.section}>
          <h2 style={styles.title}>Repair Tracking</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Device / License</th>
                <th style={styles.th}>Color</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {repairs.length > 0 ? repairs.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>
                    <span style={{ fontWeight: '600' }}>{item.brand} {item.model}</span>
                    <br/>
                    <span style={{ color: '#666', fontSize: '12px' }}>{item.license_plate}</span>
                  </td>
                  <td style={styles.td}>{item.color}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(item.status)}>{item.status}</span>
                  </td>
                  <td style={styles.td}>{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ ...styles.td, textAlign: 'center', color: '#444', padding: '40px 0' }}>
                    ไม่พบข้อมูลการแจ้งซ่อมของคุณ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ color: '#444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            ← กลับหน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;