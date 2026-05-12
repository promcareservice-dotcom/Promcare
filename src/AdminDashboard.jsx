import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ pending: 0, doing: 0, done: 0, allMembers: 0 });
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const [editData, setEditData] = useState({});
  const [newMember, setNewMember] = useState({
    full_name: '', phone: '', line_id: '', email: '', address: '', role: 'customer'
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
      profiles:member_id (full_name, phone, role, address, line_id)
    `).order('created_at', { ascending: false });
    
    const { data: memberData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

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

  const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';
  };

  // แก้ไข/อัปเดตงานซ่อม
  const handleUpdateTask = async (taskId) => {
    const updates = editData[taskId] || {};
    const { error } = await supabase.from('repair_tasks').update(updates).eq('id', taskId);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('บันทึกการอัปเดตงานเรียบร้อยแล้ว');
      fetchData();
      setIsTaskModalOpen(false);
      setEditData({});
    }
  };

  // เพิ่มสมาชิกใหม่ (พร้อมสร้าง username อัตโนมัติเพื่อแก้ Error)
  const handleAddMember = async () => {
    if (!newMember.email || !newMember.full_name) {
      alert('กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
      return;
    }

    // สร้าง username อัตโนมัติจากอีเมลเพื่อแก้ปัญหา Not-Null Constraint
    const autoUsername = newMember.email.split('@')[0] + Math.floor(1000 + Math.random() * 9000);
    
    const dataToInsert = { ...newMember, username: autoUsername };

    const { error } = await supabase.from('profiles').insert([dataToInsert]);
    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else { 
      alert('ลงทะเบียนสมาชิกใหม่สำเร็จ'); 
      setIsAddMemberOpen(false); 
      setNewMember({ full_name: '', phone: '', line_id: '', email: '', address: '', role: 'customer' });
      fetchData(); 
    }
  };

  const handleUpdateMember = async () => {
    const { error } = await supabase.from('profiles').update(selectedMember).eq('id', selectedMember.id);
    if (error) alert('Error: ' + error.message);
    else { alert('อัปเดตข้อมูลสมาชิกสำเร็จ'); setIsMemberModalOpen(false); fetchData(); }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('คุณต้องการลบสมาชิกท่านนี้ใช่หรือไม่? การลบจะมีผลถาวร')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) alert('Error: ' + error.message);
      else { alert('ลบสมาชิกเรียบร้อย'); fetchData(); }
    }
  };

  const getRoleBadge = (role) => {
    const colors = { admin: '#ff4d4d', technician: '#4d94ff', customer: '#28a745', guest: '#777' };
    return (
      <span style={{ backgroundColor: colors[role] || '#777', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', marginLeft: '5px' }}>
        {role?.toUpperCase() || 'GUEST'}
      </span>
    );
  };

  const getPaymentStatusColor = (status) => {
    if (status?.includes('ชำระแล้ว')) return '#28a745';
    return '#ff4d4d'; // ยังไม่ได้ชำระ
  };

  const styles = {
    container: { backgroundColor: '#000', color: '#eee', minHeight: '100vh', padding: '30px', fontFamily: "'Kanit', sans-serif" },
    navTab: { display: 'flex', gap: '25px', marginBottom: '35px', borderBottom: '1px solid #222' },
    tabBtn: (active) => ({ padding: '12px 25px', cursor: 'pointer', border: 'none', background: 'none', color: active ? '#ff4d4d' : '#888', borderBottom: active ? '3px solid #ff4d4d' : 'none', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' }),
    statCard: { backgroundColor: '#111', border: '1px solid #222', borderRadius: '20px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', marginTop: '10px' },
    th: { backgroundColor: 'transparent', padding: '15px', textAlign: 'left', color: '#555', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' },
    tr: { backgroundColor: '#0a0a0a', transition: '0.2s' },
    td: { padding: '15px', borderBottom: '1px solid #111', verticalAlign: 'middle' },
    input: { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '10px', width: '100%', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' },
    modalBody: { backgroundColor: '#111', width: '90%', maxWidth: '550px', padding: '40px', borderRadius: '30px', border: '1px solid #333', maxHeight: '90vh', overflowY: 'auto' },
    label: { color: '#888', fontSize: '13px', marginBottom: '6px', display: 'block', marginLeft: '5px' },
    detailValue: { fontSize: '16px', fontWeight: 'bold', marginBottom: '18px', color: '#fff' },
    primaryBtn: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }
  };

  return (
    <div style={styles.container}>
      {/* 1. สรุป Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '35px' }}>
        <div style={styles.statCard}><small style={{color:'#888'}}>รอซ่อม</small><h2 style={{color:'#ffcc00', fontSize:'32px', margin:'10px 0'}}>{stats.pending}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>กำลังซ่อม</small><h2 style={{color:'#00ccff', fontSize:'32px', margin:'10px 0'}}>{stats.doing}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>เสร็จสิ้น</small><h2 style={{color:'#28a745', fontSize:'32px', margin:'10px 0'}}>{stats.done}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>สมาชิก</small><h2 style={{fontSize:'32px', margin:'10px 0'}}>{stats.allMembers}</h2></div>
      </div>

      <div style={styles.navTab}>
        <button style={styles.tabBtn(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>📋 รายการแจ้งซ่อม</button>
        <button style={styles.tabBtn(activeTab === 'members')} onClick={() => setActiveTab('members')}>👥 จัดการสมาชิก</button>
      </div>

      {activeTab === 'tasks' ? (
        <section>
          <div style={{display:'flex', gap:'12px', marginBottom:'20px'}}>
            {['all', 'pending', 'in_progress', 'completed'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{padding:'8px 20px', borderRadius:'20px', border: filterStatus===s?'1px solid #ff4d4d':'1px solid #333', backgroundColor: filterStatus===s?'#ff4d4d22':'transparent', color: filterStatus===s?'#ff4d4d':'#888', cursor:'pointer', fontWeight:'bold'}}>
                {s === 'all' ? 'ทั้งหมด' : s === 'pending' ? 'รอซ่อม' : s === 'in_progress' ? 'กำลังซ่อม' : 'เสร็จสิ้น'}
              </button>
            ))}
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>วัน-เวลา</th>
                <th style={styles.th}>ชื่อผู้แจ้ง</th>
                <th style={styles.th}>อุปกรณ์ / รายละเอียด</th>
                <th style={styles.th}>สถานะ & การชำระเงิน</th>
                <th style={styles.th}>ราคา (บาท)</th>
                <th style={styles.th}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => (
                <tr key={t.id} style={styles.tr}>
                  <td style={{...styles.td, color:'#666', fontSize:'12px'}}>{formatThaiDate(t.created_at)}</td>
                  <td style={styles.td}>
                    <strong style={{color:'#fff'}}>{t.customer_name || t.profiles?.full_name || t.guest_name}</strong> 
                    <br/>{getRoleBadge(t.profiles?.role || 'guest')}
                  </td>
                  <td style={styles.td}>
                    <div style={{color:'#00ccff', cursor:'pointer', fontWeight:'bold', textDecoration:'underline'}} onClick={() => { setSelectedTask(t); setIsDetailModalOpen(true); }}>
                      {t.device_type}
                    </div>
                    <div style={{fontSize:'12px', color:'#888', marginTop:'4px'}}>📍 {t.details || 'ไม่มีรายละเอียด'}</div>
                  </td>
                  <td style={styles.td}>
                    <select style={{...styles.input, marginBottom:'8px', padding:'8px'}} value={editData[t.id]?.status || t.status} onChange={e=>setEditData({...editData, [t.id]:{...(editData[t.id]||{}), status: e.target.value}})}>
                      <option value="pending">⏳ รอรับงาน</option>
                      <option value="in_progress">⚙️ กำลังซ่อม</option>
                      <option value="completed">✅ เสร็จสิ้น</option>
                    </select>
                    <select 
                      style={{...styles.input, fontSize:'11px', padding:'8px', color: getPaymentStatusColor(editData[t.id]?.payment_status || t.payment_status)}} 
                      value={editData[t.id]?.payment_status || t.payment_status || 'ยังไม่ได้ชำระ'} 
                      onChange={e=>setEditData({...editData, [t.id]:{...(editData[t.id]||{}), payment_status: e.target.value}})}
                    >
                      <option value="ยังไม่ได้ชำระ">❌ ยังไม่ได้ชำระ</option>
                      <option value="ชำระแล้ว(เงินสด)">💵 เงินสด</option>
                      <option value="ชำระแล้ว(โอนผ่านบัญชีธนาคาร)">📱 เงินโอน</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <input type="number" style={{...styles.input, width:'100px', marginBottom:0}} defaultValue={t.price} placeholder="0.00" onChange={e=>setEditData({...editData, [t.id]:{...(editData[t.id]||{}), price: e.target.value}})} />
                  </td>
                  <td style={styles.td}>
                    <button style={styles.primaryBtn} onClick={()=>handleUpdateTask(t.id)}>SAVE</button>
                    <button style={{display:'block', width:'100%', marginTop:'8px', fontSize:'11px', background:'none', border:'none', color:'#00ccff', cursor:'pointer'}} onClick={()=>{setSelectedTask(t); setIsTaskModalOpen(true)}}>+ ความเห็นช่าง</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section>
          <button style={{backgroundColor:'#28a745', color:'#fff', border:'none', padding:'12px 25px', borderRadius:'12px', marginBottom:'20px', fontWeight:'bold', cursor:'pointer'}} onClick={()=>setIsAddMemberOpen(true)}>+ เพิ่มสมาชิกใหม่</button>
          <table style={styles.table}>
            <thead>
              <tr><th style={styles.th}>ชื่อ-นามสกุล</th><th style={styles.th}>ระดับผู้ใช้</th><th style={styles.th}>การติดต่อ</th><th style={styles.th}>ที่อยู่</th><th style={styles.th}>การจัดการ</th></tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} style={styles.tr}>
                  <td style={styles.td}><strong>{m.full_name}</strong><br/><small style={{color:'#555'}}>{m.email}</small></td>
                  <td style={styles.td}>{getRoleBadge(m.role)}</td>
                  <td style={styles.td}>{m.phone || '-'} <br/> <small style={{color:'#00ccff'}}>Line: {m.line_id || '-'}</small></td>
                  <td style={{...styles.td, color:'#888', fontSize:'13px'}}>{m.address || '-'}</td>
                  <td style={styles.td}>
                    <button style={{marginRight:'15px', color:'#00ccff', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}} onClick={()=>{setSelectedMember(m); setIsMemberModalOpen(true)}}>แก้ไข</button>
                    <button style={{color:'#ff4d4d', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}} onClick={()=>handleDeleteMember(m.id)}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* --- Modals Zone --- */}

      {/* 1. Modal รายละเอียดงานซ่อม */}
      {isDetailModalOpen && selectedTask && (
        <div style={styles.modal} onClick={() => setIsDetailModalOpen(false)}>
          <div style={styles.modalBody} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#ff4d4d', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '20px' }}>📦 รายละเอียดการแจ้งซ่อม</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '25px' }}>
              <div><label style={styles.label}>ชื่อผู้แจ้ง</label><div style={styles.detailValue}>{selectedTask.customer_name || selectedTask.profiles?.full_name || selectedTask.guest_name}</div></div>
              <div><label style={styles.label}>เบอร์โทรศัพท์</label><div style={styles.detailValue}>{selectedTask.profiles?.phone || selectedTask.phone || '-'}</div></div>
              <div><label style={styles.label}>ประเภทอุปกรณ์</label><div style={{...styles.detailValue, color: '#00ccff'}}>{selectedTask.device_type}</div></div>
              <div><label style={styles.label}>แบรนด์/รุ่น</label><div style={styles.detailValue}>{selectedTask.brand} {selectedTask.model}</div></div>
            </div>
            <label style={styles.label}>อาการเสียที่แจ้ง</label>
            <div style={{ fontSize:'15px', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '15px', border: '1px solid #333', marginBottom:'20px' }}>
              {selectedTask.details || 'ไม่มีรายละเอียด'}
            </div>
            <button style={{ width: '100%', padding: '15px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setIsDetailModalOpen(false)}>ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* 2. Modal ความเห็นช่าง */}
      {isTaskModalOpen && selectedTask && (
        <div style={styles.modal} onClick={() => setIsTaskModalOpen(false)}>
          <div style={styles.modalBody} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#00ccff', marginTop: 0, marginBottom:'20px' }}>🔧 บันทึกความเห็นช่าง</h3>
            <label style={styles.label}>รายละเอียดการซ่อม / สิ่งที่ตรวจพบ</label>
            <textarea 
              style={{...styles.input, height:'150px'}} 
              placeholder="ระบุวิธีแก้ไข อะไหล่ที่ใช้ หรือหมายเหตุเพิ่มเติม..."
              defaultValue={selectedTask.technician_comment}
              onChange={e => setEditData({...editData, [selectedTask.id]: {...(editData[selectedTask.id] || {}), technician_comment: e.target.value}})}
            />
            <button style={{ ...styles.primaryBtn, width: '100%', padding: '15px' }} onClick={() => handleUpdateTask(selectedTask.id)}>บันทึกข้อมูลช่าง</button>
          </div>
        </div>
      )}

      {/* 3. Modal เพิ่มสมาชิกใหม่ */}
      {isAddMemberOpen && (
        <div style={styles.modal} onClick={()=>setIsAddMemberOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#28a745', marginTop:0, marginBottom:'25px'}}>✨ เพิ่มสมาชิกใหม่ในระบบ</h3>
            <label style={styles.label}>ชื่อ-นามสกุล</label>
            <input style={styles.input} placeholder="ระบุชื่อจริง-นามสกุล" onChange={e=>setNewMember({...newMember, full_name: e.target.value})} />
            
            <label style={styles.label}>อีเมล (สำคัญสำหรับสร้าง Account)</label>
            <input style={styles.input} type="email" placeholder="example@mail.com" onChange={e=>setNewMember({...newMember, email: e.target.value})} />
            
            <label style={styles.label}>เบอร์โทรศัพท์</label>
            <input style={styles.input} placeholder="08x-xxx-xxxx" onChange={e=>setNewMember({...newMember, phone: e.target.value})} />
            
            <label style={styles.label}>Line ID</label>
            <input style={styles.input} placeholder="ไอดีไลน์" onChange={e=>setNewMember({...newMember, line_id: e.target.value})} />
            
            <label style={styles.label}>ที่อยู่</label>
            <textarea style={{...styles.input, height:'80px'}} placeholder="ที่อยู่ปัจจุบัน" onChange={e=>setNewMember({...newMember, address: e.target.value})} />
            
            <label style={styles.label}>ระดับสิทธิ์การใช้งาน</label>
            <select style={styles.input} onChange={e=>setNewMember({...newMember, role: e.target.value})}>
              <option value="customer">Customer (ลูกค้าทั่วไป)</option>
              <option value="technician">Technician (ช่างซ่อม)</option>
              <option value="admin">Admin (ผู้ดูแลระบบ)</option>
            </select>
            <button style={{width:'100%', padding:'15px', backgroundColor:'#28a745', color:'#fff', border:'none', borderRadius:'15px', marginTop:'15px', fontWeight:'bold', fontSize:'16px'}} onClick={handleAddMember}>บันทึกและลงทะเบียน</button>
          </div>
        </div>
      )}

      {/* 4. Modal แก้ไขข้อมูลสมาชิก */}
      {isMemberModalOpen && selectedMember && (
        <div style={styles.modal} onClick={()=>setIsMemberModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#00ccff', marginTop:0, marginBottom:'25px'}}>📝 แก้ไขข้อมูลสมาชิก</h3>
            <label style={styles.label}>ชื่อ-นามสกุล</label>
            <input style={styles.input} value={selectedMember.full_name} onChange={e=>setSelectedMember({...selectedMember, full_name: e.target.value})} />
            <label style={styles.label}>เบอร์โทรศัพท์</label>
            <input style={styles.input} value={selectedMember.phone} onChange={e=>setSelectedMember({...selectedMember, phone: e.target.value})} />
            <label style={styles.label}>สิทธิ์การใช้งาน</label>
            <select style={styles.input} value={selectedMember.role} onChange={e=>setSelectedMember({...selectedMember, role: e.target.value})}>
              <option value="customer">Customer</option>
              <option value="technician">Technician</option>
              <option value="admin">Admin</option>
            </select>
            <button style={{width:'100%', padding:'15px', backgroundColor:'#00ccff', color:'#fff', border:'none', borderRadius:'15px', marginTop:'15px', fontWeight:'bold'}} onClick={handleUpdateMember}>อัปเดตข้อมูล</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;