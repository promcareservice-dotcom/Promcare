import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [memberForm, setMemberForm] = useState({ 
    id: null, full_name: '', username: '', phone: '', line_id: '', address: '', role: 'customer' 
  });

  const fetchData = async () => {
    setLoading(true);
    // ดึงข้อมูลสมาชิกและงานซ่อม
    const { data: mData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: rData } = await supabase.from('repair_tasks').select('*').order('created_at', { ascending: false });
    if (mData) setMembers(mData);
    if (rData) setRepairs(rData);
    setLoading(false);
  };

  useEffect(() => {
    // เช็กสถานะ Login ก่อนเข้าหน้านี้
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login'); // ถ้าไม่มี Session ให้ไปหน้า Login
      } else {
        fetchData();
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSaveMember = async () => {
    if (!memberForm.full_name) return alert("กรุณาระบุชื่อสมาชิก");

    const payload = {
      full_name: memberForm.full_name,
      username: memberForm.username,
      phone: memberForm.phone,
      line_id: memberForm.line_id,
      address: memberForm.address,
      role: memberForm.role
    };

    if (memberForm.id) {
      // แก้ไขข้อมูลเดิม
      const { error } = await supabase.from('profiles').update(payload).eq('id', memberForm.id);
      if (error) alert("ข้อผิดพลาด: " + error.message);
      else alert("✅ อัปเดตข้อมูลสำเร็จ");
    } else {
      // เพิ่มสมาชิกใหม่
      const { error } = await supabase.from('profiles').insert([payload]);
      if (error) alert("ข้อผิดพลาด: " + error.message);
      else alert("✅ เพิ่มสมาชิกเรียบร้อย");
    }
    
    // รีเซ็ตฟอร์มและดึงข้อมูลใหม่มาโชว์ทันที
    setMemberForm({ id: null, full_name: '', username: '', phone: '', line_id: '', address: '', role: 'customer' });
    fetchData();
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>🔐 กำลังตรวจสอบสิทธิ์...</div>;

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh', fontFamily: 'Kanit, sans-serif' }}>
      
      {/* 🔝 แถบด้านบนพร้อมปุ่ม Logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ color: '#ff4d4d', margin: 0, fontSize: '1.5rem' }}>🚩 Admin Panel</h1>
        <button onClick={handleLogout} style={{ background: '#333', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>ออกจากระบบ Logout</button>
      </div>

      {/* 👤 ฟอร์มจัดการสมาชิก */}
      <section style={sectionBox}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>👥 ข้อมูลสมาชิก</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <input placeholder="ชื่อ-นามสกุล" value={memberForm.full_name} onChange={e => setMemberForm({...memberForm, full_name: e.target.value})} style={inputStyle} />
          <input placeholder="Username" value={memberForm.username} onChange={e => setMemberForm({...memberForm, username: e.target.value})} style={inputStyle} />
          <input placeholder="เบอร์โทร" value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} style={inputStyle} />
          <input placeholder="ไอดีไลน์" value={memberForm.line_id} onChange={e => setMemberForm({...memberForm, line_id: e.target.value})} style={inputStyle} />
          <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} style={inputStyle}>
            <option value="customer">ลูกค้า</option>
            <option value="technician">ช่าง</option>
            <option value="admin">แอดมิน</option>
          </select>
          <textarea placeholder="ที่อยู่" value={memberForm.address} onChange={e => setMemberForm({...memberForm, address: e.target.value})} style={{...inputStyle, gridColumn: 'span 2'}} />
        </div>
        <button onClick={handleSaveMember} style={btnPrimary}>
          {memberForm.id ? '💾 บันทึกการเปลี่ยนแปลง' : '➕ ลงทะเบียนสมาชิกใหม่'}
        </button>
      </section>

      {/* 📋 ตารางรายชื่อ */}
      <div style={{ marginTop: '30px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tr style={{ color: '#888', borderBottom: '1px solid #333', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>บทบาท</th>
            <th>รายชื่อ</th>
            <th>เบอร์โทร (คลิกเพื่อโทร)</th>
            <th>จัดการ</th>
          </tr>
          {members.map(m => (
            <tr key={m.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
              <td style={{ padding: '15px' }}>
                <span style={{ background: m.role === 'admin' ? '#ff4d4d' : '#444', padding: '3px 8px', borderRadius: '5px', fontSize: '10px' }}>{m.role}</span>
              </td>
              <td><strong>{m.full_name}</strong><br/><small style={{color:'#555'}}>@{m.username}</small></td>
              <td>
                {m.phone ? (
                  <a href={`tel:${m.phone}`} style={{ color: '#4ade80', textDecoration: 'none' }}>📞 {m.phone}</a>
                ) : '-'}
              </td>
              <td>
                <button onClick={() => setMemberForm(m)} style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer' }}>แก้รายละเอียด</button>
              </td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
}

const sectionBox = { background: '#111', padding: '25px', borderRadius: '15px', border: '1px solid #222' };
const inputStyle = { width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' };
const btnPrimary = { width: '100%', marginTop: '20px', padding: '15px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };

export default AdminDashboard;