import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับฟอร์มจัดการสมาชิก
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

  // --- จัดการสมาชิก ---
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
      const { error: err } = await supabase.from('profiles').update(payload).eq('id', memberForm.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('profiles').insert([payload]);
      error = err;
    }

    if (error) {
      alert("❌ ผิดพลาด: " + error.message);
    } else {
      alert("✅ บันทึกสมาชิกสำเร็จ");
      setMemberForm({ id: null, full_name: '', username: '', tel: '', line_id: '', address: '', role: 'customer' });
      fetchData();
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm("🗑️ ยืนยันการลบสมาชิกรายนี้?")) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) alert(error.message);
      else fetchData();
    }
  };

  // --- จัดการงานซ่อม (เพิ่มใหม่) ---
  const handleUpdateRepair = async (id, newStatus, price) => {
    const { error } = await supabase
      .from('repair_tasks')
      .update({ status: newStatus, price: price })
      .eq('id', id);
    
    if (error) {
      alert("❌ ไม่สามารถอัปเดตงานซ่อมได้: " + error.message);
    } else {
      fetchData(); // โหลดข้อมูลใหม่หลังจากอัปเดต
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
        <div style={statCard}><h5>ซ่อมเสร็จแล้ว</h5><h2 style={{color: '#4ade80'}}>{repairs.filter(r => r.status === 'done').length}</h2></div>
        <div style={statCard}><h5>สมาชิกทั้งหมด</h5><h2 style={{color: '#eee'}}>{members.length}</h2></div>
      </div>

      <div style={mainLayout}>
        {/* ส่วนที่ 1: ฟอร์มจัดการสมาชิก */}
        <section style={cardStyle}>
          <h3 style={cardTitle}>{memberForm.id ? '📝 แก้ไขสมาชิก' : '➕ เพิ่มสมาชิกใหม่'}</h3>
          <div style={formGrid}>
            <div style={inputGroup}>
              <label style={labelStyle}>ชื่อ-นามสกุล</label>
              <input value={memberForm.full_name} onChange={e => setMemberForm({...memberForm, full_name: e.target.value})} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Username</label>
              <input value={memberForm.username} onChange={e => setMemberForm({...memberForm, username: e.target.value})} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>เบอร์โทรศัพท์</label>
              <input value={memberForm.tel} onChange={e => setMemberForm({...memberForm, tel: e.target.value})} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Line ID</label>
              <input value={memberForm.line_id} onChange={e => setMemberForm({...memberForm, line_id: e.target.value})} style={inputStyle} />
            </div>
            <div style={{...inputGroup, gridColumn: 'span 2'}}>
              <label style={labelStyle}>ตำแหน่ง/บทบาท</label>
              <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} style={inputStyle}>
                <option value="customer">ลูกค้า (Customer)</option>
                <option value="technician">ช่าง (Technician)</option>
                <option value="admin">ผู้ดูแล (Admin)</option>
              </select>
            </div>
          </div>
          <button onClick={handleSaveMember} style={btnPrimary}>💾 บันทึกข้อมูลสมาชิก</button>
          {memberForm.id && (
            <button onClick={() => setMemberForm({ id: null, full_name: '', username: '', tel: '', line_id: '', address: '', role: 'customer' })} style={btnCancel}>ยกเลิก</button>
          )}
        </section>

        {/* ส่วนที่ 2: ตารางรายชื่อสมาชิก */}
        <section style={cardStyle}>
          <h3 style={cardTitle}>👥 รายชื่อสมาชิกในระบบ</h3>
          <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={thStyle}>
                  <th>บทบาท</th>
                  <th>ชื่อ-นามสกุล / ติดต่อ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} style={trStyle}>
                    <td><span style={roleBadge(m.role)}>{m.role}</span></td>
                    <td>
                      <strong>{m.full_name}</strong>
                      <div style={{fontSize:'12px', color:'#777'}}>📞 {m.tel}</div>
                    </td>
                    <td>
                      <button onClick={() => setMemberForm(m)} style={btnEdit}>แก้ไข</button>
                      <button onClick={() => handleDeleteMember(m.id)} style={btnDelete}>ลบ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ส่วนที่ 3: รายการงานซ่อม (เพิ่มใหม่ด้านล่างเต็มความกว้าง) */}
      <section style={{...cardStyle, marginTop: '25px'}}>
        <h3 style={cardTitle}>🔧 รายการงานซ่อมและการดำเนินการ</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={thStyle}>
                <th>วันที่แจ้ง</th>
                <th>อุปกรณ์ / แบรนด์</th>
                <th>อาการที่แจ้ง</th>
                <th>สถานะงาน</th>
                <th>ราคา (฿)</th>
                <th>บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map(task => (
                <tr key={task.id} style={trStyle}>
                  <td style={{fontSize: '12px'}}>{new Date(task.created_at).toLocaleDateString('th-TH')}</td>
                  <td>
                    <strong>{task.device_name}</strong>
                    <div style={{fontSize: '11px', color: '#666'}}>{task.brand}</div>
                  </td>
                  <td style={{fontSize: '13px'}}>{task.issue}</td>
                  <td>
                    <select 
                      value={task.status} 
                      onChange={(e) => handleUpdateRepair(task.id, e.target.value, task.price)}
                      style={statusSelectStyle(task.status)}
                    >
                      <option value="pending">🟡 รอรับงาน</option>
                      <option value="fixing">🔵 กำลังซ่อม</option>
                      <option value="done">🟢 ซ่อมเสร็จแล้ว</option>
                      <option value="canceled">🔴 ยกเลิก</option>
                    </select>
                  </td>
                  <td>
                    <input 
                      type="number" 
                      defaultValue={task.price} 
                      onBlur={(e) => handleUpdateRepair(task.id, task.status, e.target.value)}
                      style={priceInputStyle}
                      placeholder="0"
                    />
                  </td>
                  <td style={{color: '#4ade80', fontSize: '12px'}}>
                     {task.price > 0 ? '✔️ บันทึกราคาแล้ว' : '⌛ รอใส่ราคา'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {repairs.length === 0 && <p style={{textAlign:'center', color:'#555', padding:'20px'}}>ยังไม่มีรายการแจ้งซ่อมในระบบ</p>}
        </div>
      </section>
    </div>
  );
}

// --- Styles (คงความเพอร์เฟกต์เดิม และเพิ่มส่วนใหม่) ---
const containerStyle = { padding: '20px', maxWidth: '1300px', margin: '0 auto', color: '#eee', backgroundColor: '#000', minHeight: '100vh', fontFamily: "'Kanit', sans-serif" };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '15px' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' };
const statCard = { background: '#0e0e0e', padding: '20px', borderRadius: '15px', border: '1px solid #222', textAlign: 'center' };
const mainLayout = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px' };
const cardStyle = { background: '#0a0a0a', padding: '25px', borderRadius: '20px', border: '1px solid #222', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
const cardTitle = { color: '#ff4d4d', marginTop: 0, marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid #222', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' };
const labelStyle = { fontSize: '12px', color: '#666', marginBottom: '2px' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '2px' };
const inputStyle = { padding: '12px', background: '#161616', border: '1px solid #333', color: 'white', borderRadius: '10px', fontSize: '14px', outline: 'none' };
const btnPrimary = { width: '100%', marginTop: '20px', padding: '15px', background: 'linear-gradient(45deg, #ff4d4d, #b30000)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' };
const btnCancel = { width: '100%', marginTop: '10px', padding: '10px', background: '#222', color: '#888', border: 'none', borderRadius: '10px', cursor: 'pointer' };
const btnLogout = { background: '#111', color: '#eee', border: '1px solid #333', padding: '8px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { textAlign: 'left', color: '#444', fontSize: '12px', padding: '10px', textTransform: 'uppercase' };
const trStyle = { borderBottom: '1px solid #111', transition: '0.2s' };
const roleBadge = (role) => ({ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', background: role === 'admin' ? '#ff4d4d' : '#333', color: 'white', fontWeight: 'bold' });
const btnEdit = { color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px', fontWeight: 'bold' };
const btnDelete = { color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' };

// --- Styles สำหรับส่วนงานซ่อม (ใหม่) ---
const statusSelectStyle = (status) => ({
  padding: '8px',
  background: '#161616',
  color: status === 'done' ? '#4ade80' : status === 'pending' ? '#fbbf24' : '#60a5fa',
  border: '1px solid #333',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  cursor: 'pointer'
});
const priceInputStyle = {
  width: '80px',
  padding: '8px',
  background: '#161616',
  border: '1px solid #333',
  color: '#ff4d4d',
  borderRadius: '8px',
  textAlign: 'right',
  fontSize: '14px',
  fontWeight: 'bold'
};
const loaderStyle = { color: 'white', textAlign: 'center', marginTop: '100px', fontSize: '20px' };

export default AdminDashboard;