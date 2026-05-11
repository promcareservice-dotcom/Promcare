import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับฟอร์ม (ปรับชื่อให้ตรงกับ Database ของคุณ: tel, line_id)
  const [memberForm, setMemberForm] = useState({ 
    id: null, full_name: '', username: '', tel: '', line_id: '', address: '', role: 'customer' 
  });

  const fetchData = async () => {
    setLoading(true);
    // ดึงข้อมูลสมาชิกจากตาราง profiles
    const { data: mData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    // ดึงข้อมูลงานซ่อมจากตาราง repair_tasks
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
    if (!memberForm.full_name) return alert("⚠️ กรุณากรอกชื่อ-นามสกุล");

    const payload = {
      full_name: memberForm.full_name,
      username: memberForm.username,
      tel: memberForm.tel, // ใช้ tel ตาม Database
      line_id: memberForm.line_id,
      address: memberForm.address,
      role: memberForm.role
    };

    let result;
    if (memberForm.id) {
      result = await supabase.from('profiles').update(payload).eq('id', memberForm.id);
    } else {
      result = await supabase.from('profiles').insert([payload]);
    }

    if (result.error) {
      alert("❌ ผิดพลาด: " + result.error.message);
    } else {
      alert("✅ บันทึกข้อมูลสำเร็จ");
      setMemberForm({ id: null, full_name: '', username: '', tel: '', line_id: '', address: '', role: 'customer' });
      fetchData();
    }
  };

  const stats = {
    pending: repairs.filter(r => r.status === 'pending').length,
    fixing: repairs.filter(r => r.status === 'fixing').length,
    success: repairs.filter(r => r.status === 'success').length
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>🚀 กำลังโหลดข้อมูล...</div>;

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh', fontFamily: 'Kanit, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ color: '#ff4d4d', margin: 0 }}>🚩 Promcare Admin Dashboard</h1>
        <button onClick={handleLogout} style={btnLogout}>Logout</button>
      </div>

      {/* 📊 ส่วนแสดงสถานะการส่งซ่อม (Dashboard) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={statCard}><h4 style={{color:'#888'}}>⏳ รอซ่อม</h4><h2 style={{color:'#fbbf24'}}>{stats.pending}</h2></div>
        <div style={statCard}><h4 style={{color:'#888'}}>🔧 กำลังซ่อม</h4><h2 style={{color:'#60a5fa'}}>{stats.fixing}</h2></div>
        <div style={statCard}><h4 style={{color:'#888'}}>✅ เสร็จสิ้น</h4><h2 style={{color:'#4ade80'}}>{stats.success}</h2></div>
      </div>

      {/* 👥 ส่วนจัดการสมาชิก (ช่องกรอกครบถ้วน) */}
      <section style={sectionBox}>
        <h3 style={{ color: '#ff4d4d', marginBottom: '20px' }}>จัดการข้อมูลสมาชิก</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <input placeholder="ชื่อ-นามสกุล" value={memberForm.full_name} onChange={e => setMemberForm({...memberForm, full_name: e.target.value})} style={inputStyle} />
          <input placeholder="Username" value={memberForm.username} onChange={e => setMemberForm({...memberForm, username: e.target.value})} style={inputStyle} />
          <input placeholder="เบอร์โทรศัพท์" value={memberForm.tel} onChange={e => setMemberForm({...memberForm, tel: e.target.value})} style={inputStyle} />
          <input placeholder="ไอดีไลน์" value={memberForm.line_id} onChange={e => setMemberForm({...memberForm, line_id: e.target.value})} style={inputStyle} />
          <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} style={inputStyle}>
            <option value="customer">ลูกค้า</option>
            <option value="technician">ช่าง</option>
            <option value="admin">แอดมิน</option>
          </select>
          <textarea placeholder="ที่อยู่" value={memberForm.address} onChange={e => setMemberForm({...memberForm, address: e.target.value})} style={{...inputStyle, gridColumn: 'span 2'}} />
        </div>
        <button onClick={handleSaveMember} style={btnPrimary}>💾 บันทึกข้อมูลสมาชิก</button>
      </section>

      {/* 📋 ตารางสมาชิกและการโทรออก */}
      <div style={{ marginTop: '30px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#888', borderBottom: '1px solid #333', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>สิทธิ์</th>
              <th>ชื่อสมาชิก</th>
              <th>ติดต่อ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                <td style={{ padding: '12px' }}>{m.role}</td>
                <td><strong>{m.full_name}</strong></td>
                <td>
                  <a href={`tel:${m.tel}`} style={{ color: '#4ade80', textDecoration: 'none' }}>📞 {m.tel || 'ไม่มีเบอร์'}</a>
                </td>
                <td>
                  <button onClick={() => setMemberForm(m)} style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer' }}>แก้ไข</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔧 รายการแจ้งซ่อมที่สมาชิกส่งมา */}
      <section style={{ marginTop: '40px' }}>
        <h3 style={{ color: '#ff4d4d' }}>🔧 รายการแจ้งซ่อมล่าสุด</h3>
        <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
          {repairs.map(task => (
            <div key={task.id} style={repairCard}>
              <strong>{task.brand} {task.device_name}</strong>
              <p style={{ fontSize: '13px', color: '#888' }}>อาการ: {task.issue}</p>
              <span style={{ fontSize: '12px', color: '#fbbf24' }}>สถานะ: {task.status}</span>
            </div>
          ))}
          {repairs.length === 0 && <p style={{color:'#444'}}>ไม่มีรายการแจ้งซ่อม</p>}
        </div>
      </section>
    </div>
  );
}

const statCard = { background: '#161616', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #333' };
const sectionBox = { background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #222' };
const repairCard = { background: '#161616', padding: '15px', borderRadius: '10px', border: '1px solid #333' };
const inputStyle = { width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' };
const btnPrimary = { width: '100%', marginTop: '15px', padding: '15px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnLogout = { background: '#333', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' };

export default AdminDashboard;