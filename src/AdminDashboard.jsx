import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [repairs, setRepairs] = useState([]); // State สำหรับงานซ่อม
  const [loading, setLoading] = useState(true);
  const [memberForm, setMemberForm] = useState({ 
    id: null, full_name: '', username: '', phone: '', line_id: '', address: '', role: 'customer' 
  });

  const fetchData = async () => {
    setLoading(true);
    // 1. ดึงข้อมูลสมาชิก
    const { data: mData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    // 2. ดึงข้อมูลงานซ่อม (ต้องมั่นใจว่าชื่อตารางคือ repair_tasks)
    const { data: rData } = await supabase.from('repair_tasks').select('*').order('created_at', { ascending: false });
    
    if (mData) setMembers(mData);
    if (rData) setRepairs(rData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSaveMember = async () => {
    const payload = { ...memberForm };
    delete payload.id; // ลบ id ออกก่อนส่งไป Supabase

    let result;
    if (memberForm.id) {
      result = await supabase.from('profiles').update(payload).eq('id', memberForm.id);
    } else {
      result = await supabase.from('profiles').insert([payload]);
    }

    if (result.error) alert("Error: " + result.error.message);
    else {
      alert("✅ ดำเนินการสำเร็จ");
      setMemberForm({ id: null, full_name: '', username: '', phone: '', line_id: '', address: '', role: 'customer' });
      fetchData();
    }
  };

  // คำนวณตัวเลข Dashboard
  const stats = {
    pending: repairs.filter(r => r.status === 'pending').length,
    fixing: repairs.filter(r => r.status === 'fixing').length,
    success: repairs.filter(r => r.status === 'success').length
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>🚀 กำลังโหลดข้อมูลทั้งหมด...</div>;

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh', fontFamily: 'Kanit, sans-serif' }}>
      
      {/* 🔝 Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#ff4d4d' }}>🚩 Promcare Admin</h1>
        <button onClick={handleLogout} style={btnLogout}>Logout</button>
      </div>

      {/* 📊 หน้าจอแสดงสถานะ (Dashboard) ที่หายไป ดึงกลับมาแล้วครับ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={statCard}><h4 style={{color:'#888'}}>⏳ รอซ่อม</h4><h2 style={{color:'#fbbf24'}}>{stats.pending}</h2></div>
        <div style={statCard}><h4 style={{color:'#888'}}>🔧 กำลังซ่อม</h4><h2 style={{color:'#60a5fa'}}>{stats.fixing}</h2></div>
        <div style={statCard}><h4 style={{color:'#888'}}>✅ เสร็จแล้ว</h4><h2 style={{color:'#4ade80'}}>{stats.success}</h2></div>
      </div>

      {/* 👥 ส่วนจัดการสมาชิก (CRUD) */}
      <section style={sectionBox}>
        <h3 style={{color: '#ff4d4d'}}>จัดการสมาชิก</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <input placeholder="ชื่อ" value={memberForm.full_name} onChange={e => setMemberForm({...memberForm, full_name: e.target.value})} style={inputStyle} />
          <input placeholder="เบอร์โทร" value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} style={inputStyle} />
          <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} style={inputStyle}>
            <option value="customer">ลูกค้า</option>
            <option value="technician">ช่าง</option>
            <option value="admin">แอดมิน</option>
          </select>
        </div>
        <button onClick={handleSaveMember} style={btnPrimary}>💾 บันทึกข้อมูลสมาชิก</button>
      </section>

      {/* 🛠️ รายการงานซ่อมที่สมาชิกส่งมา (ดึงกลับมาโชว์ที่นี่) */}
      <section style={{marginTop: '30px'}}>
        <h3 style={{color: '#ff4d4d'}}>🔧 รายการแจ้งซ่อมล่าสุด</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {repairs.length === 0 ? <p style={{color:'#444'}}>ไม่มีข้อมูลการแจ้งซ่อม</p> : 
            repairs.map(task => (
              <div key={task.id} style={repairCard}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <strong>{task.brand} {task.device_name}</strong>
                    <p style={{fontSize:'12px', color:'#888', margin:'5px 0'}}>อาการ: {task.issue}</p>
                    <p style={{fontSize:'12px', color:'#ff4d4d'}}>ราคาเสนอซ่อม: {task.price || 'รอกำหนดราคา'}</p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span style={{fontSize:'10px', background:'#333', padding:'3px 8px', borderRadius:'5px'}}>{task.status}</span>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </section>
    </div>
  );
}

// Styles
const statCard = { background: '#161616', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #333' };
const sectionBox = { background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #222' };
const repairCard = { background: '#161616', padding: '15px', borderRadius: '10px', border: '1px solid #333' };
const inputStyle = { width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' };
const btnPrimary = { width: '100%', marginTop: '10px', padding: '12px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const btnLogout = { background: '#333', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' };

export default AdminDashboard;