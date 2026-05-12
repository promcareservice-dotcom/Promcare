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

      // ดึงข้อมูลโปรไฟล์
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // ดึงข้อมูลงานซ่อม (กรองตามเบอร์โทรศัพท์ของสมาชิก)
      const { data: repairData } = await supabase
        .from('repair_tasks')
        .select('*')
        .eq('phone', profileData?.phone || '')
        .order('created_at', { ascending: false });

      setRepairs(repairData || []);
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

    if (error) alert(error.message);
    else {
      alert('อัปเดตข้อมูลสำเร็จ');
      setIsEditing(false);
    }
  };

  const styles = {
    wrapper: { backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', padding: '40px 20px', fontFamily: 'sans-serif' },
    container: { maxWidth: '900px', margin: '0 auto' },
    section: { backgroundColor: '#111', borderRadius: '20px', padding: '30px', border: '1px solid #222', marginBottom: '30px' },
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#ff4d4d' },
    input: { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '8px', width: '100%', marginBottom: '10px' },
    statusBadge: (status) => ({
      padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
      backgroundColor: status === 'pending' ? '#333' : '#ff4d4d',
      color: '#fff'
    }),
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
    th: { textAlign: 'left', color: '#666', padding: '10px', fontSize: '14px', borderBottom: '1px solid #222' },
    td: { padding: '15px 10px', borderBottom: '1px solid #222', fontSize: '14px' }
  };

  if (loading) return <div style={styles.wrapper}>กำลังโหลด...</div>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        
        {/* ส่วนที่ 1: ข้อมูลสมาชิก */}
        <div style={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={styles.title}>Member Profile</h2>
            <button 
              onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
              style={{ backgroundColor: isEditing ? '#ff4d4d' : 'transparent', color: '#fff', border: '1px solid #444', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <label style={{ fontSize: '12px', color: '#666' }}>Full Name</label>
            {isEditing ? (
              <input style={styles.input} value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
            ) : <p style={{ fontSize: '18px', margin: '5px 0 20px 0' }}>{profile.full_name || 'ไม่ได้ระบุ'}</p>}

            <label style={{ fontSize: '12px', color: '#666' }}>Phone Number</label>
            {isEditing ? (
              <input style={styles.input} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
            ) : <p style={{ fontSize: '18px', margin: '5px 0 0 0' }}>{profile.phone || 'ไม่ได้ระบุ'}</p>}
          </div>
        </div>

        {/* ส่วนที่ 2: ติดตามสถานะงานซ่อม */}
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
                  <td style={styles.td}>{item.brand} {item.model} <br/><span style={{color: '#666'}}>{item.license_plate}</span></td>
                  <td style={styles.td}>{item.color}</td>
                  <td style={styles.td}><span style={styles.statusBadge(item.status)}>{item.status}</span></td>
                  <td style={styles.td}>{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{...styles.td, textAlign: 'center', color: '#666'}}>ไม่พบรายการแจ้งซ่อม</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <button onClick={() => navigate('/')} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}>← Back to Home</button>
      </div>
    </div>
  );
};

export default MemberDashboard;