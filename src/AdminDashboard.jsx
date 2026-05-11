import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับฟอร์ม (ใช้ชื่อคอลัมน์ที่สร้างใหม่ใน Supabase)
  const [memberForm, setMemberForm] = useState({ 
    id: null, full_name: '', username: '', tel: '', line_id: '', address: '', role: 'customer' 
  });

  const fetchData = async () => {
    setLoading(true);
    // ดึงข้อมูลจากตาราง profiles และ repair_tasks
    const { data: mData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: rData } = await supabase.from('repair_tasks').select('*').order('created_at', { ascending: false });
    
    if (mData) setMembers(mData);
    if (rData) setRepairs(rData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveMember = async () => {
    if (!memberForm.full_name || !memberForm.username) return alert("⚠️ กรุณากรอกข้อมูลที่จำเป็นให้ครบ");

    const payload = {
      full_name: memberForm.full_name, // อิงตามคอลัมน์ใหม่ที่เพิ่ม
      username: memberForm.username,
      tel: memberForm.tel,
      line_id: memberForm.line_id,
      address: memberForm.address,
      role: memberForm.role
    };

    let error;
    if (memberForm.id) {
      const { error: err } = await supabase.from('profiles').update(payload).eq('id', memberForm.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('profiles').insert([payload]);
      error = err;
    }

    if (error) {
      alert("❌ ผิดพลาด: " + error.message);
    } else {
      alert("✅ บันทึกข้อมูลเรียบร้อย");
      setMemberForm({ id: null, full_name: '', username: '', tel: '', line_id: '', address: '', role: 'customer' });
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("🗑️ คุณแน่ใจใช่ไหมที่จะลบสมาชิกคนนี้?")) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  if (loading) return <div style={loaderStyle}>🚀 กำลังดึงข้อมูลจากฐานข้อมูล...</div>;

  return (
    <div style={containerStyle}>
      {/* Header Section */}
      <header style={headerStyle}>
        <div>
          <h1 style={{ color: '#ff4d4d', margin: 0 }}>Promcare Service</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Admin Management System</p>
        </div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={btnLogout}>ออกจากระบบ</button>
      </header>

      {/* Dashboard Stats */}
      <div style={statsGrid}>
        <div style={statCard}><h5>รอซ่อม</h5><h3>{repairs.filter(r => r.status === 'pending').length}</h3></div>
        <div style={statCard}><h5>กำลังดำเนินการ</h5><h3>{repairs.filter(r => r.status === 'fixing').length}</h3></div>
        <div style={statCard}><h5>สมาชิกทั้งหมด</h5><h3>{members.length}</h3></div>
      </div>

      <div style={mainContentGrid}>
        {/* Form Section */}
        <section style={cardStyle}>
          <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>จัดการสมาชิก</h3>
          <div style={formGrid}>
            <input placeholder="ชื่อ-นามสกุล" value={memberForm.full_name} onChange={e => setMemberForm({...memberForm, full_name: e.target.value})} style={inputStyle} />
            <input placeholder="ชื่อผู้ใช้งาน (Username)" value={memberForm.username} onChange={e => setMemberForm({...memberForm, username: e.target.value})} style={inputStyle} />
            <input placeholder="เบอร์โทรศัพท์" value={memberForm.tel} onChange={e => setMemberForm({...memberForm, tel: e.target.value})} style={inputStyle} />
            <input placeholder="Line ID" value={memberForm.line_id} onChange={e => setMemberForm({...memberForm, line_id: e.target.value})} style={inputStyle} />
            <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} style={inputStyle}>
              <option value="customer">ลูกค้า (Customer)</option>
              <option value="technician">ช่าง (Technician)</option>
              <option value="admin">ผู้ดูแล (Admin)</option>
            </select>
            <textarea placeholder="ที่อยู่ปัจจุบัน" value={memberForm.address} onChange={e => setMemberForm({...memberForm, address: e.target.value})} style={{...inputStyle, gridColumn: 'span 2', height: '60px'}} />
          </div>
          <button onClick={handleSaveMember} style={btnSave}>💾 บันทึกการเปลี่ยนแปลง</button>
        </section>

        {/* Member Table Section */}
        <section style={cardStyle}>
          <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>รายชื่อสมาชิก</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>ระดับ</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ติดต่อ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td><span style={roleBadge(m.role)}>{m.role}</span></td>
                    <td>{m.full_name}</td>
                    <td><a href={`tel:${m.tel}`} style={{color: '#4ade80', textDecoration: 'none'}}>📞 {m.tel}</a></td>
                    <td>
                      <button onClick={() => setMemberForm(m)} style={btnIconEdit}>แก้ไข</button>
                      <button onClick={() => handleDelete(m.id)} style={btnIconDelete}>ลบ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Recent Repairs Section */}
      <section style={{...cardStyle, marginTop: '20px'}}>
        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>🔧 รายการแจ้งซ่อมล่าสุด</h3>
        <div style={repairGrid}>
          {repairs.length > 0 ? repairs.map(task => (
            <div key={task.id} style={repairCard}>
              <strong>{task.brand} {task.device_name}</strong>
              <p style={{ fontSize: '13px', color: '#aaa', margin: '5px 0' }}>อาการ: {task.issue}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={statusStyle(task.status)}>{task.status}</span>
                <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>฿{task.price || 0}</span>
              </div>
            </div>
          )) : <p style={{color: '#555', textAlign: 'center'}}>ยังไม่มีข้อมูลการแจ้งซ่อม</p>}
        </div>
      </section>
    </div>
  );
}

// --- Styles ---
const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#eee', backgroundColor: '#000', minHeight: '100vh', fontFamily: "'Kanit', sans-serif" };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #1a1a1a', paddingBottom: '15px' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' };
const statCard = { background: '#111', padding: '20px', borderRadius: '15px', textAlign: 'center', border: '1px solid #222' };
const mainContentGrid = { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' };
const cardStyle = { background: '#0a0a0a', padding: '20px', borderRadius: '15px', border: '1px solid #222', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' };
const inputStyle = { padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px', fontSize: '14px' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const btnSave = { width: '100%', marginTop: '20px', padding: '15px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
const btnLogout = { background: '#333', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const roleBadge = (role) => ({ padding: '3px 8px', borderRadius: '5px', fontSize: '11px', background: role === 'admin' ? '#ef4444' : '#3b82f6', color: 'white' });
const btnIconEdit = { color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' };
const btnIconDelete = { color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' };
const repairGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginTop: '15px' };
const repairCard = { background: '#161616', padding: '15px', borderRadius: '12px', border: '1px solid #333' };
const statusStyle = (s) => ({ color: s === 'success' ? '#4ade80' : '#fbbf24', fontSize: '12px' });
const loaderStyle = { color: 'white', textAlign: 'center', marginTop: '100px', fontSize: '18px' };

export default AdminDashboard;