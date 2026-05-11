import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับฟอร์มสมาชิก (รองรับทั้ง เพิ่ม และ แก้ไข)
  const [memberForm, setMemberForm] = useState({ 
    id: null, full_name: '', username: '', phone: '', line_id: '', address: '', role: 'customer' 
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: mData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: rData } = await supabase.from('repair_tasks').select('*').order('created_at', { ascending: false });
    if (mData) setMembers(mData);
    if (rData) setRepairs(rData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- 👥 ระบบจัดการสมาชิก (Add/Update/Delete) ---
  const handleSaveMember = async () => {
    if (!memberForm.full_name || !memberForm.username) {
      alert("⚠️ กรุณากรอกชื่อและ Username");
      return;
    }

    if (memberForm.id) {
      // โหมดแก้ไข (Update)
      const { error } = await supabase.from('profiles').update({
        full_name: memberForm.full_name,
        username: memberForm.username,
        phone: memberForm.phone,
        line_id: memberForm.line_id,
        address: memberForm.address,
        role: memberForm.role
      }).eq('id', memberForm.id);

      if (error) alert("❌ แก้ไขไม่สำเร็จ: " + error.message);
      else alert("✅ อัปเดตข้อมูลสำเร็จ!");
    } else {
      // โหมดเพิ่มใหม่ (Insert)
      const { error } = await supabase.from('profiles').insert([memberForm]);
      if (error) alert("❌ เพิ่มสมาชิกไม่สำเร็จ: " + error.message);
      else alert("✅ ลงทะเบียนสมาชิกใหม่เรียบร้อย!");
    }
    
    setMemberForm({ id: null, full_name: '', username: '', phone: '', line_id: '', address: '', role: 'customer' });
    fetchData();
  };

  const deleteMember = async (id) => {
    if (window.confirm('⚠️ ยืนยันการลบสมาชิกรายนี้?')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchData();
    }
  };

  // --- 🔧 ระบบจัดการงานซ่อม (Status & Quote) ---
  const updateRepairData = async (id, payload) => {
    const { error } = await supabase.from('repair_tasks').update(payload).eq('id', id);
    if (!error) fetchData();
  };

  const stats = {
    pending: repairs.filter(r => r.status === 'pending').length,
    fixing: repairs.filter(r => r.status === 'fixing').length,
    success: repairs.filter(r => r.status === 'success').length
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>🚀 กำลังโหลดระบบจัดการ...</div>;

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh', fontFamily: 'Kanit, sans-serif' }}>
      
      {/* 📊 สรุปสถานะงานซ่อม (Dashboard ที่คุณต้องการ) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={statCard}><h4 style={{margin:0, color:'#888'}}>⏳ รอซ่อม</h4><h2 style={{color:'#fbbf24'}}>{stats.pending}</h2></div>
        <div style={statCard}><h4 style={{margin:0, color:'#888'}}>🔧 กำลังซ่อม</h4><h2 style={{color:'#60a5fa'}}>{stats.fixing}</h2></div>
        <div style={statCard}><h4 style={{margin:0, color:'#888'}}>✅ เสร็จแล้ว</h4><h2 style={{color:'#4ade80'}}>{stats.success}</h2></div>
      </div>

      {/* 👥 ส่วนจัดการสมาชิก (CRUD + Role) */}
      <section style={sectionBox}>
        <h2 style={{ color: '#ff4d4d', marginBottom: '25px', textAlign: 'center' }}>👥 จัดการสมาชิกและกำหนดสิทธิ์</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          <input placeholder="ชื่อ-นามสกุล" value={memberForm.full_name} onChange={e => setMemberForm({...memberForm, full_name: e.target.value})} style={inputStyle} />
          <input placeholder="Username" value={memberForm.username} onChange={e => setMemberForm({...memberForm, username: e.target.value})} style={inputStyle} />
          <input placeholder="เบอร์โทรศัพท์" value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} style={inputStyle} />
          <input placeholder="ไอดีไลน์" value={memberForm.line_id} onChange={e => setMemberForm({...memberForm, line_id: e.target.value})} style={inputStyle} />
          
          <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} style={inputStyle}>
            <option value="customer">👤 ลูกค้า (Customer)</option>
            <option value="technician">👨‍🔧 ช่าง (Technician)</option>
            <option value="admin">🚩 แอดมิน (Admin)</option>
          </select>

          <textarea placeholder="ที่อยู่" value={memberForm.address} onChange={e => setMemberForm({...memberForm, address: e.target.value})} style={{...inputStyle, gridColumn: 'span 2'}} />
        </div>
        
        <button onClick={handleSaveMember} style={btnPrimary}>
          {memberForm.id ? '💾 บันทึกการแก้ไข' : '➕ เพิ่มสมาชิกใหม่'}
        </button>

        <div style={{ marginTop: '25px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#888' }}>
                <th style={{ padding: '10px' }}>บทบาท</th>
                <th>รายชื่อสมาชิก</th>
                <th>ติดต่อ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                      background: m.role === 'admin' ? '#ff4d4d' : m.role === 'technician' ? '#60a5fa' : '#444', 
                      padding: '3px 8px', borderRadius: '10px', fontSize: '0.65rem' 
                    }}>
                      {m.role?.toUpperCase()}
                    </span>
                  </td>
                  <td><strong>{m.full_name}</strong></td>
                  <td>{m.phone}</td>
                  <td>
                    <button onClick={() => setMemberForm(m)} style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}>แก้</button>
                    <button onClick={() => deleteMember(m.id)} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 🛠️ ส่วนงานซ่อม (Quotation System) */}
      <section style={{marginTop: '40px'}}>
        <h2 style={{ color: '#ff4d4d', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>🔧 จัดการงานซ่อมและเสนอราคา</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          {repairs.map(task => (
            <div key={task.id} style={repairCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ background: '#ff4d4d', padding: '2px 10px', borderRadius: '10px', fontSize: '0.7rem' }}>{task.device_type}</span>
                  <h3 style={{ margin: '10px 0' }}>{task.brand} - {task.device_name} (สี: {task.color})</h3>
                  <p style={{ color: '#888' }}>อาการเสีย: {task.issue}</p>
                  
                  {/* ระบบเสนอราคาที่คุณต้องการ */}
                  <div style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="number" placeholder="ใส่ราคาเสนอซ่อม" value={task.price || ''} onChange={(e) => updateRepairData(task.id, { price: e.target.value })} style={smallInput} />
                      <input placeholder="ความเห็นช่างเพิ่มเติม" value={task.admin_comment || ''} onChange={(e) => updateRepairData(task.id, { admin_comment: e.target.value })} style={{...smallInput, flex: 2}} />
                    </div>
                    <p style={{ fontSize: '0.8rem', marginTop: '5px', color: task.customer_confirmed ? '#4ade80' : '#fbbf24' }}>
                      {task.customer_confirmed ? '✅ ลูกค้ายืนยันการซ่อมแล้ว' : '⏳ รอการยืนยันราคาจากลูกค้า'}
                    </p>
                  </div>
                </div>

                <div style={{ width: '180px', textAlign: 'right' }}>
                  <select value={task.status} onChange={(e) => updateRepairData(task.id, { status: e.target.value })} style={selectStyle}>
                    <option value="pending">⏳ รอดำเนินการ</option>
                    <option value="fixing">🔧 กำลังซ่อม</option>
                    <option value="success">✅ เสร็จสิ้น</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// --- Styles ---
const statCard = { background: '#161616', padding: '20px', borderRadius: '15px', textAlign: 'center', border: '1px solid #333' };
const sectionBox = { background: '#111', padding: '30px', borderRadius: '20px', border: '1px solid #222' };
const repairCard = { background: '#161616', padding: '20px', borderRadius: '15px', border: '1px solid #333' };
const inputStyle = { width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' };
const smallInput = { padding: '8px', background: '#000', border: '1px solid #444', color: 'white', borderRadius: '5px' };
const btnPrimary = { width: '100%', padding: '15px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const selectStyle = { width: '100%', background: '#000', color: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #ff4d4d' };

export default AdminDashboard;