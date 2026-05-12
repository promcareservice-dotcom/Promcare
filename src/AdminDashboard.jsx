import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ pending: 0, doing: 0, done: 0, allMembers: 0 });
  const [loading, setLoading] = useState(true);

  // State สำหรับฟอร์มสมาชิกใหม่
  const [newMember, setNewMember] = useState({
    full_name: '', username: '', phone: '', line_id: '', address: '', role: 'customer'
  });

  // State สำหรับเก็บค่าที่แก้ไขในตารางงานซ่อม
  const [editTasks, setEditTasks] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // 1. ดึงข้อมูลงานซ่อม
    const { data: taskData } = await supabase.from('repair_tasks').select('*').order('created_at', { ascending: false });
    
    // 2. ดึงข้อมูลสมาชิกและจัดเรียง (Admin > Technician > Customer)
    const { data: memberData } = await supabase.from('profiles').select('*');
    if (memberData) {
      const roleOrder = { admin: 1, technician: 2, customer: 3 };
      const sortedMembers = memberData.sort((a, b) => 
        (roleOrder[a.role?.toLowerCase()] || 99) - (roleOrder[b.role?.toLowerCase()] || 99)
      );
      setMembers(sortedMembers);
    }

    if (taskData) {
      setTasks(taskData);
      // 3. อัปเดตสถิติด้านบน
      setStats({
        pending: taskData.filter(t => t.status === 'pending' || t.status === 'รอรับงาน').length,
        doing: taskData.filter(t => t.status === 'in_progress' || t.status === 'กำลังซ่อม').length,
        done: taskData.filter(t => t.status === 'completed' || t.status === 'เสร็จสิ้น').length,
        allMembers: memberData?.length || 0
      });
    }
    setLoading(false);
  };

  // --- ส่วนจัดการสมาชิก ---
  const handleAddMember = async () => {
    if (!newMember.full_name || !newMember.username) return alert('กรุณากรอกชื่อและ Username');
    const { error } = await supabase.from('profiles').insert([newMember]);
    if (error) alert('ข้อผิดพลาด: ' + error.message);
    else {
      alert('เพิ่มสมาชิกสำเร็จ');
      setNewMember({ full_name: '', username: '', phone: '', line_id: '', address: '', role: 'customer' });
      fetchData();
    }
  };

  const deleteMember = async (id, name) => {
    if (window.confirm(`ยืนยันการลบสมาชิก: ${name}?`)) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchData();
    }
  };

  // --- ส่วนจัดการงานซ่อม ---
  const handleTaskChange = (taskId, field, value) => {
    setEditTasks(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], [field]: value }
    }));
  };

  const saveTaskUpdate = async (taskId) => {
    const updates = editTasks[taskId];
    if (!updates) return alert('ไม่มีการเปลี่ยนแปลงข้อมูล');
    
    const { error } = await supabase.from('repair_tasks').update(updates).eq('id', taskId);
    if (error) alert('บันทึกไม่สำเร็จ: ' + error.message);
    else {
      alert('อัปเดตงานซ่อมและสถานะเรียบร้อยแล้ว');
      fetchData(); // ดึงข้อมูลใหม่เพื่ออัปเดต Stats ด้านบนทันที
      setEditTasks(prev => {
        const copy = { ...prev };
        delete copy[taskId];
        return copy;
      });
    }
  };

  const styles = {
    body: { backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'Kanit, sans-serif' },
    card: { backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px', textAlign: 'center' },
    section: { backgroundColor: '#111', borderRadius: '15px', padding: '20px', border: '1px solid #222', marginBottom: '20px' },
    title: { color: '#ff4d4d', marginBottom: '20px', fontWeight: 'bold' },
    input: { width: '100%', backgroundColor: '#222', border: '1px solid #444', color: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '10px' },
    btnRed: { width: '100%', backgroundColor: '#d92b2b', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { textAlign: 'left', color: '#666', padding: '10px', borderBottom: '1px solid #333' },
    td: { padding: '10px', borderBottom: '1px solid #222' }
  };

  return (
    <div style={styles.body}>
      {/* 1. Dashboard Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div style={styles.card}>รอซ่อม<div style={{ fontSize: '24px', color: '#ffcc00' }}>{stats.pending}</div></div>
        <div style={styles.card}>กำลังซ่อม<div style={{ fontSize: '24px', color: '#00ccff' }}>{stats.doing}</div></div>
        <div style={styles.card}>ซ่อมเสร็จแล้ว<div style={{ fontSize: '24px', color: '#00ff88' }}>{stats.done}</div></div>
        <div style={styles.card}>สมาชิกทั้งหมด<div style={{ fontSize: '24px', color: '#fff' }}>{stats.allMembers}</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* 2. เพิ่มสมาชิกใหม่ */}
        <div style={styles.section}>
          <h3 style={styles.title}>➕ เพิ่มสมาชิกใหม่</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input style={styles.input} placeholder="ชื่อ-นามสกุล" value={newMember.full_name} onChange={e => setNewMember({...newMember, full_name: e.target.value})} />
            <input style={styles.input} placeholder="Username" value={newMember.username} onChange={e => setNewMember({...newMember, username: e.target.value})} />
            <input style={styles.input} placeholder="เบอร์โทรศัพท์" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} />
            <input style={styles.input} placeholder="Line ID" value={newMember.line_id} onChange={e => setNewMember({...newMember, line_id: e.target.value})} />
          </div>
          <textarea style={{...styles.input, height: '60px'}} placeholder="ที่อยู่" value={newMember.address} onChange={e => setNewMember({...newMember, address: e.target.value})} />
          <select style={styles.input} value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
            <option value="customer">ลูกค้า (Customer)</option>
            <option value="technician">ช่าง (Technician)</option>
            <option value="admin">แอดมิน (Admin)</option>
          </select>
          <button style={styles.btnRed} onClick={handleAddMember}>บันทึกข้อมูลสมาชิก</button>
        </div>

        {/* 3. รายชื่อสมาชิก (จัดเรียงแล้ว) */}
        <div style={styles.section}>
          <h3 style={styles.title}>👥 รายชื่อสมาชิกในระบบ</h3>
          <table style={styles.table}>
            <thead><tr><th>ชื่อ</th><th>เบอร์ติดต่อ</th><th>บทบาท</th><th>จัดการ</th></tr></thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td style={styles.td}>{m.full_name}</td>
                  <td style={styles.td}>{m.phone}</td>
                  <td style={styles.td}>{m.role === 'admin' ? '🔴 Admin' : m.role === 'technician' ? '🔵 ช่าง' : '⚪ ลูกค้า'}</td>
                  <td style={styles.td}>
                    <button style={{color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer'}} onClick={() => deleteMember(m.id, m.full_name)}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. รายการงานซ่อม (แก้ไขและบันทึกได้) */}
      <div style={styles.section}>
        <h3 style={styles.title}>🔧 รายการงานซ่อมและการดำเนินการ</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>วันที่/เวลา</th><th style={styles.th}>ผู้แจ้ง</th><th style={styles.th}>อุปกรณ์/ยี่ห้อ/สี</th><th style={styles.th}>อาการ</th><th style={styles.th}>สถานะ</th><th style={styles.th}>ราคา</th><th style={styles.th}>ความเห็นช่าง</th><th style={styles.th}>บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td style={styles.td}>{new Date(t.created_at).toLocaleDateString()}<br/><small>{new Date(t.created_at).toLocaleTimeString()}</small></td>
                  <td style={styles.td}>{t.guest_name || 'สมาชิก'}<br/><small>{t.member_id ? 'Member' : 'Guest'}</small></td>
                  <td style={styles.td}>{t.device_type} {t.brand}<br/><small>{t.color}</small></td>
                  <td style={styles.td}>{t.description}</td>
                  <td style={styles.td}>
                    <select style={{backgroundColor: '#222', color: '#ffcc00'}} value={editTasks[t.id]?.status || t.status} onChange={e => handleTaskChange(t.id, 'status', e.target.value)}>
                      <option value="pending">🟡 รอรับงาน</option>
                      <option value="in_progress">🔵 กำลังซ่อม</option>
                      <option value="completed">🟢 เสร็จสิ้น</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <input style={{width: '60px', textAlign: 'center'}} type="number" defaultValue={t.price} onChange={e => handleTaskChange(t.id, 'price', e.target.value)} />
                  </td>
                  <td style={styles.td}>
                    <input placeholder="บันทึก..." defaultValue={t.technician_comment} onChange={e => handleTaskChange(t.id, 'technician_comment', e.target.value)} />
                  </td>
                  <td style={styles.td}>
                    <button style={{backgroundColor: '#00ccff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer'}} onClick={() => saveTaskUpdate(t.id)}>บันทึก</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;