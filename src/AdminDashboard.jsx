import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับฟอร์ม (ต้องมีครบทุก Field)
  const [memberForm, setMemberForm] = useState({ 
    id: null, full_name: '', username: '', phone: '', line_id: '', address: '', role: 'customer' 
  });

  const fetchData = async () => {
    setLoading(true);
    // ดึงข้อมูลจากตาราง profiles
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching members:", error);
    } else {
      setMembers(data || []);
    }
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
    if (!memberForm.full_name) return alert("กรุณาระบุชื่อ-นามสกุล");

    const payload = {
      full_name: memberForm.full_name,
      username: memberForm.username,
      phone: memberForm.phone,
      line_id: memberForm.line_id,
      address: memberForm.address,
      role: memberForm.role
    };

    let result;
    if (memberForm.id) {
      // โหมดแก้ไข (Update)
      result = await supabase.from('profiles').update(payload).eq('id', memberForm.id);
    } else {
      // โหมดเพิ่มใหม่ (Insert)
      result = await supabase.from('profiles').insert([payload]);
    }

    if (result.error) {
      alert("❌ ไม่สำเร็จ: " + result.error.message);
    } else {
      alert("✅ บันทึกข้อมูลเรียบร้อย");
      // ล้างฟอร์มและรีเฟรชตารางทันที
      setMemberForm({ id: null, full_name: '', username: '', phone: '', line_id: '', address: '', role: 'customer' });
      fetchData(); 
    }
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>⚡ กำลังโหลดข้อมูลสมาชิก...</div>;

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh', fontFamily: 'Kanit, sans-serif' }}>
      
      {/* ส่วนหัวหน้าจอ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#ff4d4d', margin: 0 }}>🚩 Admin Panel</h1>
        <button onClick={handleLogout} style={btnLogout}>ออกจากระบบ Logout</button>
      </div>

      {/* ฟอร์มกรอกข้อมูล */}
      <section style={formBox}>
        <h2 style={{ textAlign: 'center', color: '#ff4d4d' }}>👥 จัดการข้อมูลสมาชิก</h2>
        <div style={gridInput}>
          <input placeholder="ชื่อ-นามสกุล" value={memberForm.full_name} onChange={e => setMemberForm({...memberForm, full_name: e.target.value})} style={inputStyle} />
          <input placeholder="Username" value={memberForm.username} onChange={e => setMemberForm({...memberForm, username: e.target.value})} style={inputStyle} />
          <input placeholder="เบอร์โทรศัพท์" value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} style={inputStyle} />
          <input placeholder="ไอดีไลน์" value={memberForm.line_id} onChange={e => setMemberForm({...memberForm, line_id: e.target.value})} style={inputStyle} />
          <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} style={inputStyle}>
            <option value="customer">ลูกค้า (Customer)</option>
            <option value="technician">ช่าง (Technician)</option>
            <option value="admin">แอดมิน (Admin)</option>
          </select>
          <textarea placeholder="ที่อยู่ปัจจุบัน" value={memberForm.address} onChange={e => setMemberForm({...memberForm, address: e.target.value})} style={{...inputStyle, gridColumn: 'span 2'}} />
        </div>
        <button onClick={handleSaveMember} style={btnPrimary}>💾 บันทึกการเปลี่ยนแปลง</button>
      </section>

      {/* ตารางแสดงผลที่แก้ไขแล้ว */}
      <div style={{ marginTop: '30px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#888', borderBottom: '1px solid #333', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>สิทธิ์</th>
              <th>ชื่อสมาชิก</th>
              <th>การติดต่อ / ที่อยู่</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                <td style={{ padding: '15px' }}>
                  <span style={{ background: m.role === 'admin' ? '#ff4d4d' : '#444', padding: '4px 10px', borderRadius: '5px', fontSize: '11px' }}>{m.role}</span>
                </td>
                <td>
                  <strong>{m.full_name}</strong><br/>
                  <small style={{color: '#666'}}>@{m.username}</small>
                </td>
                <td style={{ fontSize: '13px' }}>
                  {m.phone ? <a href={`tel:${m.phone}`} style={{ color: '#4ade80', textDecoration: 'none' }}>📞 {m.phone}</a> : 'ไม่มีเบอร์'}<br/>
                  <span style={{color: '#888'}}>📍 {m.address || 'ไม่มีที่อยู่'}</span>
                </td>
                <td>
                  <button onClick={() => setMemberForm(m)} style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer' }}>📝 แก้รายละเอียด</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const formBox = { background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #222' };
const gridInput = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' };
const inputStyle = { width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' };
const btnPrimary = { width: '100%', marginTop: '15px', padding: '12px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const btnLogout = { background: '#333', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' };

export default AdminDashboard;