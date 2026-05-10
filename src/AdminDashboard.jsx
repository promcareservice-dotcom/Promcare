import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับจัดการสมาชิก (Add/Edit)
  const [memberForm, setMemberForm] = useState({ id: null, full_name: '', username: '', phone: '', line_id: '', address: '' });

  const fetchData = async () => {
    setLoading(true);
    const { data: mData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: rData } = await supabase.from('repair_tasks').select('*').order('created_at', { ascending: false });
    if (mData) setMembers(mData);
    if (rData) setRepairs(rData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- ส่วนจัดการสมาชิก (CRUD) ---
  const handleSaveMember = async () => {
    if (memberForm.id) {
      await supabase.from('profiles').update(memberForm).eq('id', memberForm.id);
    } else {
      await supabase.from('profiles').insert([memberForm]);
    }
    setMemberForm({ id: null, full_name: '', username: '', phone: '', line_id: '', address: '' });
    fetchData();
  };

  const deleteMember = async (id) => {
    if (window.confirm('ยืนยันการลบสมาชิกรายนี้?')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchData();
    }
  };

  // --- ส่วนจัดการงานซ่อม (Status & Quote) ---
  const updateRepairData = async (id, payload) => {
    const { error } = await supabase.from('repair_tasks').update(payload).eq('id', id);
    if (!error) fetchData();
  };

  // ตัวเลขสรุปสถานะ (Summary)
  const stats = {
    pending: repairs.filter(r => r.status === 'pending').length,
    fixing: repairs.filter(r => r.status === 'fixing').length,
    success: repairs.filter(r => r.status === 'success').length
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>⚡ กำลังเตรียมข้อมูล...</div>;

  return (
    <div style={{ padding: '30px', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh', fontFamily: 'Kanit, sans-serif' }}>
      
      {/* 📊 ส่วนสรุปสถานะ (Dashboard Summary) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#161616', padding: '20px', borderRadius: '15px', textAlign: 'center', border: '1px solid #333' }}>
          <h4 style={{ color: '#888', margin: 0 }}>⏳ รอดำเนินการ</h4>
          <h2 style={{ color: '#fbbf24', fontSize: '2.5rem', margin: '10px 0' }}>{stats.pending}</h2>
        </div>
        <div style={{ background: '#161616', padding: '20px', borderRadius: '15px', textAlign: 'center', border: '1px solid #333' }}>
          <h4 style={{ color: '#888', margin: 0 }}>🔧 อยู่ระหว่างซ่อม</h4>
          <h2 style={{ color: '#60a5fa', fontSize: '2.5rem', margin: '10px 0' }}>{stats.fixing}</h2>
        </div>
        <div style={{ background: '#161616', padding: '20px', borderRadius: '15px', textAlign: 'center', border: '1px solid #333' }}>
          <h4 style={{ color: '#888', margin: 0 }}>✅ ซ่อมเสร็จแล้ว</h4>
          <h2 style={{ color: '#4ade80', fontSize: '2.5rem', margin: '10px 0' }}>{stats.success}</h2>
        </div>
      </div>

      {/* 👥 ส่วนจัดการสมาชิก (Member Management) */}
      <section style={{ marginBottom: '60px', background: '#111', padding: '30px', borderRadius: '20px', border: '1px solid #222' }}>
        <h2 style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '30px' }}>👤 จัดการข้อมูลสมาชิก ({members.length})</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <input placeholder="ชื่อ-นามสกุล" value={memberForm.full_name} onChange={e => setMemberForm({...memberForm, full_name: e.target.value})} style={inputStyle} />
          <input placeholder="ชื่อผู้ใช้งาน (User)" value={memberForm.username} onChange={e => setMemberForm({...memberForm, username: e.target.value})} style={inputStyle} />
          <input placeholder="เบอร์โทรศัพท์" value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} style={inputStyle} />
          <input placeholder="ไอดีไลน์" value={memberForm.line_id} onChange={e => setMemberForm({...memberForm, line_id: e.target.value})} style={inputStyle} />
          <textarea placeholder="ที่อยู่" value={memberForm.address} onChange={e => setMemberForm({...memberForm, address: e.target.value})} style={{...inputStyle, gridColumn: 'span 2'}} />
        </div>
        <button onClick={handleSaveMember} style={btnPrimary}>
          {memberForm.id ? '💾 อัปเดตข้อมูลสมาชิก' : '➕ ลงทะเบียนสมาชิกใหม่'}
        </button>

        <div style={{ marginTop: '30px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ccc' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>สมาชิก</th>
                <th>ติดต่อ</th>
                <th>ที่อยู่</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '15px' }}><strong>{m.full_name}</strong><br/><small style={{color: '#666'}}>@{m.username}</small></td>
                  <td>📞 {m.phone}<br/>🆔 {m.line_id}</td>
                  <td style={{ fontSize: '0.85rem' }}>{m.address}</td>
                  <td>
                    <button onClick={() => setMemberForm(m)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', marginRight: '10px' }}>แก้ไข</button>
                    <button onClick={() => deleteMember(m.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 🛠️ ส่วนจัดการงานซ่อม (Repair Management) */}
      <section>
        <h2 style={{ color: '#ff4d4d', borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>📑 รายการจัดการงานซ่อม</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          {repairs.map(task => (
            <div key={task.id} style={{ background: '#161616', padding: '25px', borderRadius: '15px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ background: '#ff4d4d', padding: '3px 12px', borderRadius: '20px', fontSize: '0.7rem' }}>{task.device_type}</span>
                    <span style={{ color: '#aaa', fontSize: '0.85rem' }}>ลูกค้า: <strong>{task.customer_name || 'ไม่ระบุ'}</strong></span>
                  </div>
                  <h3 style={{ margin: '15px 0' }}>{task.brand} (สี: {task.color || 'ไม่ระบุ'})</h3>
                  <p style={{ background: '#222', padding: '10px', borderRadius: '8px', color: '#ddd' }}>
                    <strong>อาการ:</strong> {task.issue}
                  </p>
                  
                  {/* --- ส่วนเสนอราคา --- */}
                  <div style={{ marginTop: '20px', borderTop: '1px dashed #333', paddingTop: '15px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#888' }}>เสนอราคาและแจ้งความเห็น</label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <input type="number" placeholder="ราคา (บาท)" value={task.price || ''} onChange={(e) => updateRepairData(task.id, { price: e.target.value })} style={smallInput} />
                      <input placeholder="ความเห็นช่าง / อะไหล่เพิ่มเติม" value={task.admin_comment || ''} onChange={(e) => updateRepairData(task.id, { admin_comment: e.target.value })} style={{...smallInput, flex: 2}} />
                    </div>
                    {task.customer_confirmed ? (
                      <p style={{ color: '#4ade80', fontSize: '0.85rem', marginTop: '10px' }}>✅ ลูกค้ายืนยันการซ่อมแล้ว</p>
                    ) : (
                      <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '10px' }}>⏳ รอการยืนยันราคาจากลูกค้า</p>
                    )}
                  </div>
                </div>

                <div style={{ width: '200px', textAlign: 'right' }}>
                  <label style={{ fontSize: '0.8rem', color: '#888' }}>อัปเดตสถานะงาน</label>
                  <select 
                    value={task.status} 
                    onChange={(e) => updateRepairData(task.id, { status: e.target.value })}
                    style={selectStyle}
                  >
                    <option value="pending">⏳ รอดำเนินการ</option>
                    <option value="fixing">🔧 กำลังซ่อม</option>
                    <option value="success">✅ ซ่อมเสร็จแล้ว</option>
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

// CSS-in-JS Styles
const inputStyle = { width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' };
const smallInput = { padding: '8px', background: '#000', border: '1px solid #444', color: 'white', borderRadius: '6px', fontSize: '0.9rem' };
const btnPrimary = { width: '100%', padding: '15px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const selectStyle = { width: '100%', background: '#000', color: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #ff4d4d', marginTop: '10px' };

export default AdminDashboard;