import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [memberForm, setMemberForm] = useState({ 
    id: null, full_name: '', username: '', phone: '', line_id: '', address: '', role: 'customer' 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: mData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: rData } = await supabase.from('repair_tasks').select('*').order('created_at', { ascending: false });
      if (mData) setMembers(mData);
      if (rData) setRepairs(rData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
      // โหมดแก้ไข
      result = await supabase.from('profiles').update(payload).eq('id', memberForm.id);
    } else {
      // โหมดเพิ่มใหม่
      result = await supabase.from('profiles').insert([payload]);
    }

    if (result.error) {
      alert("⚠️ เกิดข้อผิดพลาด: " + result.error.message);
    } else {
      alert(memberForm.id ? "✅ อัปเดตข้อมูลสำเร็จ" : "✅ เพิ่มสมาชิกสำเร็จ");
      setMemberForm({ id: null, full_name: '', username: '', phone: '', line_id: '', address: '', role: 'customer' });
      fetchData();
    }
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>⚡ กำลังเชื่อมต่อฐานข้อมูล...</div>;

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh', fontFamily: 'Kanit, sans-serif' }}>
      
      {/* 👤 ส่วนจัดการสมาชิก (UI ใหม่ที่ดูง่ายกว่าเดิม) */}
      <section style={{ background: '#111', padding: '25px', borderRadius: '15px', border: '1px solid #222', marginBottom: '30px' }}>
        <h2 style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '20px' }}>👤 จัดการข้อมูลสมาชิกและกำหนดสิทธิ์</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div><label style={labelStyle}>ชื่อ-นามสกุล</label><input value={memberForm.full_name} onChange={e => setMemberForm({...memberForm, full_name: e.target.value})} style={inputStyle} /></div>
          <div><label style={labelStyle}>Username</label><input value={memberForm.username} onChange={e => setMemberForm({...memberForm, username: e.target.value})} style={inputStyle} /></div>
          <div><label style={labelStyle}>เบอร์โทรศัพท์</label><input value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} style={inputStyle} /></div>
          <div><label style={labelStyle}>ไอดีไลน์</label><input value={memberForm.line_id} onChange={e => setMemberForm({...memberForm, line_id: e.target.value})} style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>ตำแหน่งสมาชิก</label>
            <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} style={inputStyle}>
              <option value="customer">ลูกค้า (Customer)</option>
              <option value="technician">ช่าง (Technician)</option>
              <option value="admin">แอดมิน (Admin)</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>ที่อยู่</label><textarea value={memberForm.address} onChange={e => setMemberForm({...memberForm, address: e.target.value})} style={{...inputStyle, height: '45px'}} /></div>
        </div>
        
        <button onClick={handleSaveMember} style={btnPrimary}>
          {memberForm.id ? '💾 บันทึกการเปลี่ยนแปลง' : '➕ ลงทะเบียนสมาชิกใหม่'}
        </button>

        {/* ตารางแสดงผล */}
        <div style={{ marginTop: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr style={{ color: '#888', borderBottom: '1px solid #333', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>สิทธิ์</th>
              <th>รายชื่อ</th>
              <th>ติดต่อ</th>
              <th>จัดการ</th>
            </tr>
            {members.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: m.role === 'admin' ? '#ff4d4d' : m.role === 'technician' ? '#60a5fa' : '#444', padding: '3px 8px', borderRadius: '8px', fontSize: '11px' }}>{m.role}</span>
                </td>
                <td>{m.full_name}</td>
                <td style={{ fontSize: '12px' }}>{m.phone} <br/> {m.line_id}</td>
                <td>
                  <button onClick={() => setMemberForm(m)} style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}>แก้</button>
                </td>
              </tr>
            ))}
          </table>
        </div>
      </section>

      {/* 🔧 ส่วนงานซ่อม (Quotation System) */}
      <section>
        <h2 style={{ color: '#ff4d4d', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>🔧 งานซ่อมและเสนอราคา</h2>
        {repairs.length === 0 ? <p style={{textAlign: 'center', color: '#444'}}>ไม่มีข้อมูลการแจ้งซ่อม</p> : 
          repairs.map(task => (
            <div key={task.id} style={{ background: '#161616', padding: '15px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #333' }}>
               <h3>{task.brand} {task.device_name}</h3>
               <p style={{ color: '#888' }}>อาการ: {task.issue}</p>
            </div>
          ))
        }
      </section>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' };
const btnPrimary = { width: '100%', marginTop: '20px', padding: '15px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };

export default AdminDashboard;