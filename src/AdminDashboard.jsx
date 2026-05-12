import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ pending: 0, doing: 0, done: 0, allMembers: 0 });
  const [loading, setLoading] = useState(true);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [newMember, setNewMember] = useState({
    full_name: '', username: '', password: '', phone: '', line_id: '', address: '', role: 'customer'
  });
  const [editTasks, setEditTasks] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // ดึงข้อมูลงานซ่อม พร้อมดึงข้อมูลโปรไฟล์ผ่าน member_id (Foreign Key)
    const { data: taskData } = await supabase.from('repair_tasks').select(`
      *,
      profiles:member_id (full_name, phone, role, address, line_id)
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

  // ฟังก์ชันจัดรูปแบบวันที่และเวลาแจ้งซ่อม (อิงตาม created_at ใน image_f0161e.png)
  const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' น.';
  };

  const handleTaskChange = (taskId, field, value) => {
    setEditTasks(prev => ({ ...prev, [taskId]: { ...prev[taskId], [field]: value } }));
  };

  const saveTaskUpdate = async (taskId) => {
    const updates = { 
      ...(editTasks[taskId] || {}),
      updated_at: new Date() 
    };
    if (Object.keys(updates).length <= 1) {
      setIsTaskModalOpen(false);
      return;
    }
    const { error } = await supabase.from('repair_tasks').update(updates).eq('id', taskId);
    if (error) alert('บันทึกไม่สำเร็จ: ' + error.message);
    else {
      alert('บันทึกข้อมูลเรียบร้อย');
      fetchData();
      setIsTaskModalOpen(false);
    }
  };

  const styles = {
    body: { backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '15px', textAlign: 'center' },
    section: { backgroundColor: '#111', borderRadius: '15px', padding: '20px', border: '1px solid #222', marginBottom: '20px' },
    title: { color: '#ff4d4d', marginBottom: '20px', fontWeight: 'bold' },
    input: { width: '100%', backgroundColor: '#222', border: '1px solid #444', color: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '10px', boxSizing: 'border-box' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { textAlign: 'left', color: '#666', padding: '10px', borderBottom: '1px solid #333' },
    td: { padding: '12px 10px', borderBottom: '1px solid #222' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '15px', width: '500px', border: '1px solid #333', maxHeight: '90vh', overflowY: 'auto' },
    badge: (role) => ({
      padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
      backgroundColor: role === 'admin' ? '#d92b2b' : role === 'technician' ? '#2b6cd9' : '#333'
    })
  };

  return (
    <div style={styles.body}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div style={styles.card}>รอซ่อม<div style={{ color: '#ffcc00', fontSize: '24px' }}>{stats.pending}</div></div>
        <div style={styles.card}>กำลังซ่อม<div style={{ color: '#00ccff', fontSize: '24px' }}>{stats.doing}</div></div>
        <div style={styles.card}>เสร็จสิ้น<div style={{ color: '#00ff88', fontSize: '24px' }}>{stats.done}</div></div>
        <div style={styles.card}>สมาชิกทั้งหมด<div style={{ fontSize: '24px' }}>{stats.allMembers}</div></div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.title}>🔧 รายการงานซ่อม</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>เวลาแจ้งซ่อม</th>
              <th style={styles.th}>ผู้แจ้ง (customer_name)</th>
              <th style={styles.th}>อุปกรณ์</th>
              <th style={styles.th}>สถานะ</th>
              <th style={styles.th}>ราคา</th>
              <th style={styles.th}>บันทึก</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td style={{...styles.td, color: '#888'}}>{formatThaiDate(t.created_at)}</td>
                <td style={styles.td}>
                  <span style={{ color: '#00ccff', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setSelectedTask(t); setIsTaskModalOpen(true); }}>
                    {/* ดึงจาก customer_name ที่พบใน image_f0161e.png */}
                    {t.customer_name || t.guest_name || 'ไม่ระบุชื่อ'}
                  </span>
                </td>
                <td style={styles.td}>{t.device_type} {t.brand}</td>
                <td style={styles.td}>
                  <select style={{backgroundColor:'#222', color:'#ffcc00', border:'1px solid #444'}} value={editTasks[t.id]?.status || t.status} onChange={e => handleTaskChange(t.id, 'status', e.target.value)}>
                    <option value="pending">รอรับงาน</option>
                    <option value="in_progress">กำลังซ่อม</option>
                    <option value="completed">เสร็จสิ้น</option>
                  </select>
                </td>
                <td style={styles.td}><input style={{width:'60px', backgroundColor:'#222', color:'#fff', border:'1px solid #444'}} type="number" defaultValue={t.price} onChange={e => handleTaskChange(t.id, 'price', e.target.value)} /></td>
                <td style={styles.td}><button style={{backgroundColor:'#00ccff', border:'none', padding:'5px 15px', borderRadius:'5px', cursor:'pointer'}} onClick={() => saveTaskUpdate(t.id)}>บันทึก</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isTaskModalOpen && selectedTask && (
        <div style={styles.modalOverlay} onClick={() => setIsTaskModalOpen(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#00ccff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>📋 รายละเอียดงาน</h3>
            <div style={{ marginTop: '15px' }}>
              <p style={{ color: '#ff4d4d', fontWeight: 'bold' }}>👤 ผู้แจ้ง: {selectedTask.customer_name || selectedTask.guest_name}</p>
              <p>เบอร์โทร: {selectedTask.profiles?.phone || selectedTask.guest_tel || '-'}</p>
              <p>ที่อยู่: {selectedTask.profiles?.address || '-'}</p>
              <p style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>
                🔧 <strong>{selectedTask.device_type}</strong> {selectedTask.brand} {selectedTask.license_plate}
              </p>
              <p>อาการ: {selectedTask.description}</p>
            </div>
            <textarea style={{ ...styles.input, height: '70px', marginTop: '10px' }} defaultValue={selectedTask.technician_comment} placeholder="บันทึกช่าง..." onChange={e => handleTaskChange(selectedTask.id, 'technician_comment', e.target.value)} />
            <button style={{ backgroundColor: '#d92b2b', color: '#fff', width: '100%', padding: '12px', border: 'none', borderRadius: '8px', marginTop: '10px', fontWeight: 'bold' }} onClick={() => saveTaskUpdate(selectedTask.id)}>บันทึก & ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;