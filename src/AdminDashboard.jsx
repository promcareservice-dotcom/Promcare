import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับฟอร์ม (ใช้ชื่อคอลัมน์ที่ตรงกับ Database)
  const [memberForm, setMemberForm] = useState({ 
    id: null, full_name: '', username: '', tel: '', line_id: '', address: '', role: 'customer' 
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

  useEffect(() => {
    fetchData();
  }, []);

  // --- ฟังก์ชันบันทึกข้อมูล (แก้ไขตามที่คุณต้องการ) ---
  const handleSaveMember = async () => {
    if (!memberForm.full_name) return alert("⚠️ กรุณากรอกชื่อ-นามสกุล");

    const payload = {
      full_name: memberForm.full_name,
      username: memberForm.username,
      tel: memberForm.tel,
      line_id: memberForm.line_id,
      address: memberForm.address,
      role: memberForm.role
    };

    let error;
    if (memberForm.id) {
      // กรณีมี ID = อัปเดตข้อมูลเดิม
      const { error: err } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', memberForm.id);
      error = err;
    } else {
      // กรณีไม่มี ID = เพิ่มสมาชิกใหม่ (Database จะสร้าง UUID ให้เอง)
      const { error: err } = await supabase
        .from('profiles')
        .insert([payload]);
      error = err;
    }

    if (error) {
      alert("❌ ผิดพลาด: " + error.message);
    } else {
      alert("✅ บันทึกสำเร็จ");
      setMemberForm({ id: null, full_name: '', username: '', tel: '', line_id: '', address: '', role: 'customer' });
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("🗑️ ยืนยันการลบสมาชิกรายนี้?")) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) alert(error.message);
      else fetchData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div style={loaderStyle}>🚀 กำลังโหลดข้อมูล...</div>;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div>
          <h1 style={{ color: '#ff4d4d', margin: 0 }}>🚩 Promcare Admin</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>ระบบจัดการหลังบ้านแบบสมบูรณ์</p>
        </div>
        <button onClick={handleLogout} style={btnLogout}>Logout</button>
      </header>

      {/* Stats Summary */}
      <div style={statsGrid}>
        <div style={statCard}><h5>รอซ่อม</h5><h2 style={{color: '#fbbf24'}}>{repairs.filter(r => r.status === 'pending').length}</h2></div>
        <div style={statCard}><h5>กำลังซ่อม</h5><h2 style={{color: '#60a5fa'}}>{repairs.filter(r => r.status === 'fixing').length}</h2></div>
        <div style={statCard}><h5>สมาชิกทั้งหมด</h5><h2 style={{color: '#4ade80'}}>{members.length}</h2></div>
      </div>

      <div style={mainLayout}>
        {/* ส่วนที่ 1: ฟอร์มจัดการสมาชิก */}
        <section style={cardStyle}>
          <h3 style={cardTitle}>{memberForm.id ? '📝 แก้ไขสมาชิก' : '➕ เพิ่มสมาชิกใหม่'}</h3>
          <div style={formGrid}>
            <div style={inputGroup}>
              <label>ชื่อ-นามสกุล</label>
              <input value={memberForm.full_name} onChange={e => setMemberForm({...memberForm, full_name: e.target.value})} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label>Username</label>
              <input value={memberForm.username} onChange={e => setMemberForm({...memberForm, username: e.target.value})} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label>เบอร์โทรศัพท์</label>
              <input value={memberForm.tel} onChange={e => setMemberForm({...memberForm, tel: e.target.value})} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label>Line ID</label>
              <input value={memberForm.line_id} onChange={e => setMemberForm({...memberForm, line_id: e.target.value})} style={inputStyle} />
            </div>
            <div style={{...inputGroup, gridColumn: 'span 2'}}>
              <label>ตำแหน่ง/บทบาท</label>
              <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} style={inputStyle}>
                <option value="customer">ลูกค้า (Customer)</option>
                <option value="technician">ช่าง (Technician)</option>
                <option value="admin">ผู้ดูแล (Admin)</option>
              </select>
            </div>
            <div style={{...inputGroup, gridColumn: 'span 2'}}>
              <label>ที่อยู่</label>
              <textarea value={memberForm.address} onChange={e => setMemberForm({...memberForm, address: e.target.value})} style={{...inputStyle, height: '60px'}} />
            </div>
          </div>
          <button onClick={handleSaveMember} style={btnPrimary}>💾 บันทึกข้อมูลสมาชิก</button>
          {memberForm.id && (
            <button onClick={() => setMemberForm({ id: null, full_name: '', username: '', tel: '', line_id: '', address: '', role: 'customer' })} style={btnCancel}>ยกเลิกการแก้ไข</button>
          )}
        </section>

        {/* ส่วนที่ 2: ตารางรายชื่อ */}
        <section style={cardStyle}>
          <h3 style={cardTitle}>👥 รายชื่อสมาชิกในระบบ</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={thStyle}>
                  <th>บทบาท</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} style={trStyle}>
                    <td><span style={roleBadge(m.role)}>{m.role}</span></td>
                    <td>
                      <div><strong>{m.full_name}</strong></div>
                      <div style={{fontSize:'12px', color:'#666'}}>{m.tel}</div>
                    </td>
                    <td>
                      <button onClick={() => setMemberForm(m)} style={btnEdit}>แก้ไข</button>
                      <button onClick={() => handleDelete(m.id)} style={btnDelete}>ลบ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

// --- Styles (มืออาชีพ & Clean) ---
const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#eee', backgroundColor: '#000', minHeight: '100vh', fontFamily: "'Kanit', sans-serif" };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '15px' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' };
const statCard = { background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #222', textAlign: 'center' };
const mainLayout = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' };
const cardStyle = { background: '#0a0a0a', padding: '25px', borderRadius: '20px', border: '1px solid #222' };
const cardTitle = { color: '#ff4d4d', marginTop: 0, marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid #222', paddingBottom: '10px' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const inputStyle = { padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px', fontSize: '14px' };
const btnPrimary = { width: '100%', marginTop: '20px', padding: '15px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnCancel = { width: '100%', marginTop: '10px', padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' };
const btnLogout = { background: '#222', color: 'white', border: '1px solid #444', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { textAlign: 'left', color: '#555', fontSize: '13px' };
const trStyle = { borderBottom: '1px solid #111' };
const roleBadge = (role) => ({ padding: '3px 8px', borderRadius: '5px', fontSize: '10px', background: role === 'admin' ? '#ef4444' : '#444', color: 'white' });
const btnEdit = { color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' };
const btnDelete = { color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' };
const loaderStyle = { color: 'white', textAlign: 'center', marginTop: '100px' };

export default AdminDashboard;