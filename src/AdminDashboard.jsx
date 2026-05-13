import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ pending: 0, doing: 0, done: 0, allMembers: 0 });
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isMemberInfoModalOpen, setIsMemberInfoModalOpen] = useState(false);
  const [selectedMemberInfo, setSelectedMemberInfo] = useState(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const [editData, setEditData] = useState({});
  const [newMember, setNewMember] = useState({
    full_name: '', phone: '', line_id: '', email: '', address: '', role: 'customer'
  });
  const [newTask, setNewTask] = useState({
    member_id: '', device_type: '', brand: '', model: '', details: '', status: 'pending', price: 0, payment_status: 'ยังไม่ได้ชำระ'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'tasks') applyTaskFilter();
  }, [tasks, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    const { data: taskData } = await supabase.from('repair_tasks').select(`
      *,
      profiles:member_id (full_name, phone, role, address, line_id, email)
    `).order('created_at', { ascending: false });
    
    const { data: memberData } = await supabase.from('profiles').select('*');

    if (taskData) setTasks(taskData);
    if (memberData) {
      setMembers(memberData);
      setStats({
        pending: taskData?.filter(t => ['pending', 'รอรับงาน'].includes(t.status)).length || 0,
        doing: taskData?.filter(t => ['in_progress', 'กำลังซ่อม'].includes(t.status)).length || 0,
        done: taskData?.filter(t => ['completed', 'เสร็จสิ้น'].includes(t.status)).length || 0,
        allMembers: memberData.length || 0
      });
    }
    setLoading(false);
  };

  const applyTaskFilter = () => {
    if (filterStatus === 'all') setFilteredTasks(tasks);
    else setFilteredTasks(tasks.filter(t => t.status === filterStatus));
  };

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone?.includes(searchTerm)
  );

  const getRoleBadge = (role) => {
    const roles = {
      admin: { label: 'ADMIN', color: '#ff4d4d', bg: 'rgba(255, 77, 77, 0.15)' },
      technician: { label: 'TECHNICIAN', color: '#00ccff', bg: 'rgba(0, 204, 255, 0.15)' },
      customer: { label: 'CUSTOMER', color: '#28a745', bg: 'rgba(40, 167, 69, 0.15)' }
    };
    const r = roles[role?.toLowerCase()] || roles.customer;
    return <span style={{ color: r.color, backgroundColor: r.bg, border: `1px solid ${r.color}`, padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{r.label}</span>;
  };

  const handleUpdateTask = async (taskId, customUpdates = null) => {
    const updates = customUpdates || editData[taskId] || {};
    const { error } = await supabase.from('repair_tasks').update(updates).eq('id', taskId);
    
    if (error) alert('ไม่สามารถบันทึกได้: ' + error.message);
    else { 
      alert('บันทึกข้อมูลเรียบร้อยแล้ว'); 
      fetchData(); 
      if (!customUpdates) setEditData(prev => { const newData = {...prev}; delete newData[taskId]; return newData; });
      setIsDetailModalOpen(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.full_name || !newMember.phone) {
      alert('กรุณากรอกข้อมูลพื้นฐานให้ครบถ้วน');
      return;
    }
    const autoUsername = newMember.email.split('@')[0] + Math.floor(1000 + Math.random() * 9000);
    const { error } = await supabase.from('profiles').insert([{ ...newMember, username: autoUsername }]);
    if (error) alert('เกิดข้อผิดพลาด: ' + error.message);
    else { alert('เพิ่มสมาชิกใหม่เรียบร้อยแล้ว'); setIsAddMemberOpen(false); setNewMember({ full_name: '', phone: '', line_id: '', email: '', address: '', role: 'customer' }); fetchData(); }
  };

  const handleCreateNewTask = async () => {
    if (!newTask.member_id || !newTask.device_type) {
      alert('กรุณาเลือกสมาชิกและระบุอุปกรณ์');
      return;
    }
    const { error } = await supabase.from('repair_tasks').insert([newTask]);
    if (error) alert('Error: ' + error.message);
    else { alert('เปิดใบสั่งซ่อมใหม่สำเร็จ'); setIsNewTaskModalOpen(false); fetchData(); }
  };

  const styles = {
    container: { backgroundColor: '#000', color: '#eee', minHeight: '100vh', padding: '30px', fontFamily: "'Kanit', sans-serif" },
    statCard: { backgroundColor: '#111', border: '1px solid #222', borderRadius: '20px', padding: '20px', textAlign: 'center' },
    navTab: { display: 'flex', gap: '25px', marginBottom: '35px', borderBottom: '1px solid #222' },
    tabBtn: (active) => ({ padding: '12px 25px', cursor: 'pointer', border: 'none', background: 'none', color: active ? '#ff4d4d' : '#888', borderBottom: active ? '3px solid #ff4d4d' : 'none', fontWeight: 'bold' }),
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' },
    tr: { backgroundColor: '#0a0a0a' },
    td: { padding: '18px 20px', borderBottom: '1px solid #111' },
    input: { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '10px', width: '100%', marginBottom: '15px', outline: 'none' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' },
    modalBody: { backgroundColor: '#0f0f0f', width: '95%', maxWidth: '550px', padding: '35px', borderRadius: '30px', border: '1px solid #222' },
    primaryBtn: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '35px' }}>
        <div style={styles.statCard}><small>รอซ่อม</small><h2 style={{color:'#ffcc00'}}>{stats.pending}</h2></div>
        <div style={styles.statCard}><small>กำลังซ่อม</small><h2 style={{color:'#00ccff'}}>{stats.doing}</h2></div>
        <div style={styles.statCard}><small>เสร็จสิ้น</small><h2 style={{color:'#28a745'}}>{stats.done}</h2></div>
        <div style={styles.statCard}><small>สมาชิก</small><h2>{stats.allMembers}</h2></div>
      </div>

      <div style={styles.navTab}>
        <button style={styles.tabBtn(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>📋 รายการแจ้งซ่อม</button>
        <button style={styles.tabBtn(activeTab === 'members')} onClick={() => setActiveTab('members')}>👥 จัดการสมาชิก</button>
      </div>

      {activeTab === 'tasks' ? (
        <section>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
             <button style={{...styles.primaryBtn, backgroundColor:'#00ccff'}} onClick={() => setIsNewTaskModalOpen(true)}>+ เปิดใบแจ้งซ่อมใหม่</button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr style={{color:'#555', fontSize:'13px', textAlign:'left'}}>
                <th>ผู้แจ้ง / อุปกรณ์</th>
                <th>ราคา / การชำระ</th>
                <th>สถานะ / จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => (
                <tr key={t.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong style={{color:'#00ccff', cursor:'pointer', fontSize:'16px'}} onClick={() => { setSelectedTask(t); setIsDetailModalOpen(true); }}>
                      🔍 {t.device_type}
                    </strong><br/>
                    <small>{t.profiles?.full_name || 'ไม่ระบุชื่อ'}</small>
                  </td>
                  <td style={styles.td}>
                    <input type="number" style={{...styles.input, width:'80px', padding:'5px', marginBottom:'5px'}} 
                      value={editData[t.id]?.price ?? (t.price || 0)} 
                      onChange={e => setEditData({...editData, [t.id]:{...(editData[t.id]||{}), price: e.target.value}})} 
                    />
                  </td>
                  <td style={styles.td}>
                    <select style={{...styles.input, width:'auto', padding:'5px', marginBottom:'5px'}} 
                      value={editData[t.id]?.status || t.status} 
                      onChange={e=>setEditData({...editData, [t.id]:{...(editData[t.id]||{}), status: e.target.value}})}>
                      <option value="pending">รอซ่อม</option>
                      <option value="in_progress">กำลังซ่อม</option>
                      <option value="completed">เสร็จสิ้น</option>
                    </select>
                    <button style={{...styles.primaryBtn, fontSize:'12px', padding:'8px', marginLeft:'10px'}} onClick={()=>handleUpdateTask(t.id)}>บันทึก</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        /* ส่วนจัดการสมาชิก (ยังคงเดิม) */
        <section>
          <input style={styles.input} placeholder="🔍 ค้นหาสมาชิก..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          {/* ... ตารางสมาชิก ... */}
        </section>
      )}

      {/* Modal Device Detail & Technician Comment (บันทึกความเห็นช่าง) */}
      {isDetailModalOpen && selectedTask && (
        <div style={styles.modal} onClick={()=>setIsDetailModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#00ccff', marginBottom:'20px'}}>🛠 รายละเอียดและบันทึกช่าง</h2>
            <p><strong>อุปกรณ์:</strong> {selectedTask.device_type} {selectedTask.brand}</p>
            <p><strong>อาการ:</strong> {selectedTask.details || '-'}</p>
            
            <label style={{display:'block', marginTop:'20px', color:'#00ccff'}}>📝 บันทึกความเห็นจากช่าง (Technician Comment)</label>
            <textarea 
                style={{...styles.input, height:'120px', border:'1px solid #00ccff', marginTop:'10px'}} 
                placeholder="ระบุความคืบหน้า หรือหมายเหตุ..."
                defaultValue={selectedTask.technician_comment}
                onChange={(e) => setSelectedTask({...selectedTask, technician_comment: e.target.value})}
            />
            
            <div style={{display:'flex', gap:'15px', marginTop:'20px'}}>
                <button style={{...styles.primaryBtn, backgroundColor:'#333', flex:1}} onClick={()=>setIsDetailModalOpen(false)}>ปิด</button>
                <button 
                    style={{...styles.primaryBtn, backgroundColor:'#00ccff', flex:2}} 
                    onClick={() => handleUpdateTask(selectedTask.id, { technician_comment: selectedTask.technician_comment })}
                >
                    💾 บันทึกความเห็นช่าง
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;