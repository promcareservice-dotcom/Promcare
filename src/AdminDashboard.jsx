import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ pending: 0, doing: 0, done: 0, allMembers: 0 });
  const [loading, setLoading] = useState(true);

  // States สำหรับ Modal
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // State สำหรับฟอร์มและแก้ไข (เพิ่ม password)
  const [newMember, setNewMember] = useState({
    full_name: '', username: '', password: '', phone: '', line_id: '', address: '', role: 'customer'
  });
  const [editTasks, setEditTasks] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: taskData } = await supabase.from('repair_tasks').select(`
      *,
      profiles:member_id (full_name, phone, role, address)
    `).order('created_at', { ascending: false });
    
    const { data: memberData } = await supabase.from('profiles').select('*');
    
    if (memberData) {
      const roleOrder = { admin: 1, technician: 2, customer: 3 };
      setMembers(memberData.sort((a, b) => (roleOrder[a.role?.toLowerCase()] || 99) - (roleOrder[b.role?.toLowerCase()] || 99)));
    }

    if (taskData) {
      setTasks(taskData);
      setStats({
        pending: taskData.filter(t => t.status === 'pending' || t.status === 'รอรับงาน').length,
        doing: taskData.filter(t => t.status === 'in_progress' || t.status === 'กำลังซ่อม').length,
        done: taskData.filter(t => t.status === 'completed' || t.status === 'เสร็จสิ้น').length,
        allMembers: memberData?.length || 0
      });
    }
    setLoading(false);
  };

  // --- ฟังก์ชันจัดการสมาชิก ---
  const handleAddMember = async () => {
    if (!newMember.full_name || !newMember.username || !newMember.password) {
      return alert('กรุณากรอกชื่อ, Username และ Password ให้ครบถ้วน');
    }
    const { error } = await supabase.from('profiles').insert([newMember]);
    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      alert('เพิ่มสมาชิกและรหัสผ่านสำเร็จ');
      setNewMember({ full_name: '', username: '', password: '', phone: '', line_id: '', address: '', role: 'customer' });
      fetchData();
    }
  };

  const handleUpdateMember = async () => {
    const { error } = await supabase.from('profiles').update(selectedMember).eq('id', selectedMember.id);
    if (error) alert(error.message);
    else { alert('อัปเดตสมาชิกสำเร็จ'); setIsMemberModalOpen(false); fetchData(); }
  };

  const deleteMember = async (id, name) => {
    if (window.confirm(`ยืนยันการลบสมาชิก: ${name}?`)) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchData();
    }
  };

  // --- ฟังก์ชันจัดการงานซ่อม ---
  const handleTaskChange = (taskId, field, value) => {
    setEditTasks(prev => ({ ...prev, [taskId]: { ...prev[taskId], [field]: value } }));
  };

  const saveTaskUpdate = async (taskId) => {
    const updates = editTasks[taskId] || {};
    if (Object.keys(updates).length === 0) {
      setIsTaskModalOpen(false);
      return;
    }
    const { error } = await supabase.from('repair_tasks').update(updates).eq('id', taskId);
    if (error) alert('บันทึกไม่สำเร็จ: ' + error.message);
    else {
      alert('บันทึกข้อมูลเรียบร้อย');
      fetchData();
      setEditTasks(prev => { const copy = { ...prev }; delete copy[taskId]; return copy; });
      setIsTaskModalOpen(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (window.confirm('ยืนยันการลบรายการแจ้งซ่อมนี้?')) {
      const { error } = await supabase.from('repair_tasks').delete().eq('id', taskId);
      if (error) alert(error.message);
      else { alert('ลบรายการเรียบร้อย'); fetchData(); setIsTaskModalOpen(false); }
    }
  };

  const styles = {
    body: { backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '15px', textAlign: 'center' },
    section: { backgroundColor: '#111', borderRadius: '15px', padding: '20px', border: '1px solid #222', marginBottom: '20px' },
    title: { color: '#ff4d4d', marginBottom: '20px', fontWeight: 'bold' },
    input: { width: '100%', backgroundColor: '#222', border: '1px solid #444', color: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '10px', boxSizing: 'border-box' },
    btnRed: { width: '100%', backgroundColor: '#d92b2b', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { textAlign: 'left', color: '#666', padding: '10px', borderBottom: '1px solid #333' },
    td: { padding: '12px 10px', borderBottom: '1px solid #222' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '15px', width: '500px', border: '1px solid #333', maxHeight: '90vh', overflowY: 'auto' },
    badge: (role) => ({
      padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
      backgroundColor: role === 'admin' ? '#d92b2b' : role === 'technician' ? '#2b6cd9' : '#333'
    })
  };

  return (
    <div style={styles.body}>
      {/* 1. Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div style={styles.card}>รอซ่อม<div style={{ color: '#ffcc00', fontSize: '24px' }}>{stats.pending}</div></div>
        <div style={styles.card}>กำลังซ่อม<div style={{ color: '#00ccff', fontSize: '24px' }}>{stats.doing}</div></div>
        <div style={styles.card}>เสร็จสิ้น<div style={{ color: '#00ff88', fontSize: '24px' }}>{stats.done}</div></div>
        <div style={styles.card}>สมาชิกทั้งหมด<div style={{ fontSize: '24px' }}>{stats.allMembers}</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* 2. รายชื่อสมาชิก */}
        <div style={styles.section}>
          <h3 style={styles.title}>👥 รายชื่อสมาชิก</h3>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>ชื่อ</th><th style={styles.th}>บทบาท</th><th style={styles.th}>จัดการ</th></tr></thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td style={styles.td}><span style={{cursor:'pointer', fontWeight:'bold'}} onClick={() => {setSelectedMember(m); setIsMemberModalOpen(true);}}>{m.full_name}</span></td>
                  <td style={styles.td}><span style={styles.badge(m.role)}>{m.role?.toUpperCase()}</span></td>
                  <td style={styles.td}>
                    <span style={{color:'#4d94ff', cursor:'pointer', marginRight:'10px'}} onClick={() => {setSelectedMember(m); setIsMemberModalOpen(true);}}>แก้ไข</span>
                    <span style={{color:'#ff4d4d', cursor:'pointer'}} onClick={() => deleteMember(m.id, m.full_name)}>ลบ</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. เพิ่มสมาชิกใหม่ (เพิ่ม Password) */}
        <div style={styles.section}>
          <h3 style={styles.title}>➕ เพิ่มสมาชิกใหม่</h3>
          <input style={styles.input} placeholder="ชื่อ-นามสกุล" value={newMember.full_name} onChange={e => setNewMember({...newMember, full_name: e.target.value})} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input style={styles.input} placeholder="Username" value={newMember.username} onChange={e => setNewMember({...newMember, username: e.target.value})} />
            <input style={styles.input} type="password" placeholder="Password" value={newMember.password} onChange={e => setNewMember({...newMember, password: e.target.value})} />
          </div>
          <input style={styles.input} placeholder="เบอร์โทรศัพท์" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} />
          <select style={styles.input} value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
            <option value="customer">ลูกค้า (Customer)</option>
            <option value="technician">ช่าง (Technician)</option>
            <option value="admin">แอดมิน (Admin)</option>
          </select>
          <button style={styles.btnRed} onClick={handleAddMember}>บันทึกสมาชิก</button>
        </div>
      </div>

      {/* 4. รายการงานซ่อม */}
      <div style={styles.section}>
        <h3 style={styles.title}>🔧 รายการงานซ่อม</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>วันที่</th>
              <th style={styles.th}>ผู้แจ้ง</th>
              <th style={styles.th}>บทบาท</th>
              <th style={styles.th}>อุปกรณ์</th>
              <th style={styles.th}>สถานะ</th>
              <th style={styles.th}>ราคา</th>
              <th style={styles.th}>บันทึก</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td style={styles.td}>{new Date(t.created_at).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <span 
                    style={{ color: '#00ccff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }} 
                    onClick={() => { setSelectedTask(t); setIsTaskModalOpen(true); }}
                  >
                    {t.profiles?.full_name || t.guest_name || 'ไม่ระบุชื่อ'}
                  </span>
                </td>
                <td style={styles.td}>
                   <span style={styles.badge(t.profiles?.role || 'guest')}>
                    {t.profiles?.role ? t.profiles.role.toUpperCase() : 'GUEST'}
                   </span>
                </td>
                <td style={styles.td}>{t.device_type}</td>
                <td style={styles.td}>
                  <select style={{backgroundColor:'#222', color:'#ffcc00', border:'1px solid #444', borderRadius:'4px'}} value={editTasks[t.id]?.status || t.status} onChange={e => handleTaskChange(t.id, 'status', e.target.value)}>
                    <option value="pending">รอรับงาน</option><option value="in_progress">กำลังซ่อม</option><option value="completed">เสร็จสิ้น</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <input style={{width:'60px', textAlign:'center', backgroundColor:'#222', color:'#fff', border:'1px solid #444'}} type="number" defaultValue={t.price} onChange={e => handleTaskChange(t.id, 'price', e.target.value)} />
                </td>
                <td style={styles.td}>
                  <button style={{backgroundColor:'#00ccff', border:'none', padding:'5px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}} onClick={() => saveTaskUpdate(t.id)}>บันทึก</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal รายละเอียดงานซ่อม */}
      {isTaskModalOpen && selectedTask && (
        <div style={styles.modalOverlay} onClick={() => setIsTaskModalOpen(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#00ccff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>📋 รายละเอียดการแจ้งซ่อม</h3>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: 'bold', margin: '10px 0' }}>👤 ข้อมูลผู้แจ้ง</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <div>ชื่อ: {selectedTask.profiles?.full_name || selectedTask.guest_name}</div>
                <div>บทบาท: <span style={styles.badge(selectedTask.profiles?.role || 'guest')}>{selectedTask.profiles?.role || 'GUEST'}</span></div>
                <div>เบอร์โทร: {selectedTask.profiles?.phone || '-'}</div>
              </div>
            </div>
            <div style={{ marginBottom: '15px', borderTop: '1px solid #333', paddingTop: '10px' }}>
              <p style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: 'bold', margin: '10px 0' }}>🔧 ข้อมูลอุปกรณ์</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <div>อุปกรณ์: {selectedTask.device_type}</div>
                <div>ยี่ห้อ: {selectedTask.brand || '-'}</div>
                <div>ทะเบียน: {selectedTask.registration_number || '-'}</div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <span style={{ color: '#888', fontSize: '12px' }}>อาการแจ้งซ่อม:</span>
                <div style={{ backgroundColor: '#222', padding: '10px', borderRadius: '5px', marginTop: '5px', fontSize: '14px' }}>{selectedTask.description}</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>
              <p style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: 'bold', margin: '10px 0' }}>✍️ บันทึกเพิ่มเติม</p>
              <textarea 
                style={{ ...styles.input, height: '70px' }} 
                defaultValue={selectedTask.technician_comment}
                placeholder="หมายเหตุจากช่าง..."
                onChange={e => handleTaskChange(selectedTask.id, 'technician_comment', e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button style={{ ...styles.btnRed, flex: 2 }} onClick={() => saveTaskUpdate(selectedTask.id)}>บันทึกข้อมูล & ปิด</button>
              <button style={{ backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '8px', flex: 1, cursor: 'pointer' }} onClick={() => deleteTask(selectedTask.id)}>ลบรายการ</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal แก้ไขสมาชิก */}
      {isMemberModalOpen && selectedMember && (
        <div style={styles.modalOverlay} onClick={() => setIsMemberModalOpen(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#ff4d4d' }}>📝 แก้ไขข้อมูลสมาชิก</h3>
            <label style={{fontSize:'12px', color:'#888'}}>ชื่อ-นามสกุล</label>
            <input style={styles.input} value={selectedMember.full_name} onChange={e => setSelectedMember({...selectedMember, full_name: e.target.value})} />
            <label style={{fontSize:'12px', color:'#888'}}>Username</label>
            <input style={styles.input} value={selectedMember.username} onChange={e => setSelectedMember({...selectedMember, username: e.target.value})} />
            <label style={{fontSize:'12px', color:'#888'}}>Password</label>
            <input style={styles.input} type="text" value={selectedMember.password} onChange={e => setSelectedMember({...selectedMember, password: e.target.value})} />
            <label style={{fontSize:'12px', color:'#888'}}>บทบาท</label>
            <select style={styles.input} value={selectedMember.role} onChange={e => setSelectedMember({...selectedMember, role: e.target.value})}>
              <option value="customer">ลูกค้า</option><option value="technician">ช่าง</option><option value="admin">แอดมิน</option>
            </select>
            <button style={styles.btnRed} onClick={handleUpdateMember}>อัปเดตสมาชิก</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;