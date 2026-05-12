import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomerRepair = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // รับ userId ที่ส่งมาจากหน้า Login ผ่าน state
  const userId = location.state?.userId;

  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRepair, setNewRepair] = useState({
    device_type: '', brand: '', model: '', description: ''
  });

  useEffect(() => {
    // ถ้าไม่มี userId (เช่น พิมพ์ URL เข้ามาเองโดยไม่ผ่าน Login) ให้ดีดกลับหน้าแรก
    if (!userId) {
      alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
      navigate('/');
      return;
    }
    fetchCustomerData();
  }, [userId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      // 1. ดึงข้อมูลโปรไฟล์ลูกค้า (ชื่อ, เบอร์โทร, ที่อยู่)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileData) setProfile(profileData);

      // 2. ดึงประวัติการแจ้งซ่อมเฉพาะของสมาชิกคนนี้
      const { data: taskData } = await supabase
        .from('repair_tasks')
        .select('*')
        .eq('member_id', userId)
        .order('created_at', { ascending: false });

      if (taskData) setTasks(taskData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepairSubmit = async (e) => {
    e.preventDefault();
    if (!newRepair.device_type || !newRepair.description) {
      return alert('กรุณาระบุประเภทอุปกรณ์และอาการเสีย');
    }

    // บันทึกงานซ่อมใหม่ลงตาราง repair_tasks
    const { error } = await supabase.from('repair_tasks').insert([{
      member_id: userId,
      ...newRepair,
      status: 'pending',
      price: 0
    }]);

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      alert('ส่งข้อมูลแจ้งซ่อมเรียบร้อยแล้ว!');
      setNewRepair({ device_type: '', brand: '', model: '', description: '' });
      fetchCustomerData(); // อัปเดตรายการใหม่ทันที
    }
  };

  const styles = {
    container: { backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' },
    section: { backgroundColor: '#111', borderRadius: '15px', padding: '20px', border: '1px solid #222', marginBottom: '20px' },
    title: { color: '#ff4d4d', marginBottom: '15px', fontWeight: 'bold', fontSize: '18px' },
    input: { width: '100%', backgroundColor: '#222', border: '1px solid #444', color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '10px', boxSizing: 'border-box' },
    btnRed: { width: '100%', backgroundColor: '#d92b2b', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    card: { backgroundColor: '#1a1a1a', borderLeft: '4px solid #ff4d4d', padding: '15px', marginBottom: '10px', borderRadius: '4px' },
    badge: (status) => ({
      padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
      backgroundColor: status === 'pending' ? '#ffcc00' : status === 'in_progress' ? '#00ccff' : '#00ff88',
      color: '#000'
    }),
    logoutBtn: { backgroundColor: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }
  };

  if (loading) return <div style={styles.container}>กำลังโหลดข้อมูลระบบ Promcare...</div>;

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0 }}>🛠️ แจ้งซ่อม Promcare</h2>
        <button onClick={() => navigate('/')} style={styles.logoutBtn}>ออกจากระบบ</button>
      </div>

      <div style={styles.section}>
        <h4 style={styles.title}>👤 ข้อมูลผู้แจ้ง</h4>
        <p style={{ margin: '5px 0' }}><b>{profile?.full_name}</b></p>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#ccc' }}>📞 {profile?.phone}</p>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#888' }}>📍 {profile?.address}</p>
      </div>

      <div style={styles.section}>
        <h4 style={styles.title}>➕ แจ้งซ่อมใหม่</h4>
        <form onSubmit={handleRepairSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input style={styles.input} placeholder="ประเภทอุปกรณ์" value={newRepair.device_type} onChange={e => setNewRepair({...newRepair, device_type: e.target.value})} />
            <input style={styles.input} placeholder="ยี่ห้อ" value={newRepair.brand} onChange={e => setNewRepair({...newRepair, brand: e.target.value})} />
          </div>
          <input style={styles.input} placeholder="รุ่น (Model)" value={newRepair.model} onChange={e => setNewRepair({...newRepair, model: e.target.value})} />
          <textarea style={{...styles.input, height: '80px'}} placeholder="อาการเสียที่พบ" value={newRepair.description} onChange={e => setNewRepair({...newRepair, description: e.target.value})} />
          <button type="submit" style={styles.btnRed}>ส่งข้อมูลแจ้งซ่อม</button>
        </form>
      </div>

      <h4 style={{ ...styles.title, marginTop: '30px' }}>📜 รายการซ่อมของคุณ</h4>
      {tasks.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center' }}>ไม่มีประวัติการแจ้งซ่อม</p>
      ) : (
        tasks.map(task => (
          <div key={task.id} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>{task.device_type} - {task.brand}</span>
              <span style={styles.badge(task.status)}>
                {task.status === 'pending' ? 'รอรับงาน' : task.status === 'in_progress' ? 'กำลังซ่อม' : 'เสร็จสิ้น'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#ccc', margin: '5px 0' }}>อาการ: {task.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: '#888' }}>
              <span>วันที่แจ้ง: {new Date(task.created_at).toLocaleDateString()}</span>
              {task.price > 0 && <span style={{ color: '#00ff88' }}>ค่าบริการ: ฿{task.price}</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CustomerRepair;