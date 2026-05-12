import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' หรือ 'members'
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ pending: 0, doing: 0, done: 0, allMembers: 0 });
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const [editData, setEditData] = useState({});
  const [newMember, setNewMember] = useState({
    full_name: '', phone: '', line_id: '', address: '', role: 'customer'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'tasks') applyTaskFilter();
  }, [tasks, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    // ดึงข้อมูลงานซ่อมพร้อมข้อมูลโปรไฟล์สมาชิกที่เชื่อมโยงกัน
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

  // ฟังก์ชันอัปเดตงานซ่อม (รวมการเสนอราคาและความเห็นช่าง)
  const handleUpdateTask = async (taskId) => {
    const updates = editData[taskId] || {};
    const { error } = await supabase.from('repair_tasks').update(updates).eq('id', taskId);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('บันทึกข้อมูลและส่งข้อเสนอราคาให้ลูกค้าเรียบร้อยแล้ว');
      fetchData();
      setIsTaskModalOpen(false);
      setEditData({}); // ล้างข้อมูลการแก้ไขหลังบันทึก
    }
  };

  // ฟังก์ชันจัดการสมาชิก
  const handleAddMember = async () => {
    const { error } = await supabase.from('profiles').insert([newMember]);
    if (error) alert('Error: ' + error.message);
    else { alert('เพิ่มสมาชิกสำเร็จ'); setIsAddMemberOpen(false); fetchData(); }
  };

  const handleUpdateMember = async () => {
    const { error } = await supabase.from('profiles').update(selectedMember).eq('id', selectedMember.id);
    if (error) alert('Error: ' + error.message);
    else { alert('อัปเดตข้อมูลสมาชิกสำเร็จ'); setIsMemberModalOpen(false); fetchData(); }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('คุณต้องการลบสมาชิกท่านนี้ใช่หรือไม่?')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) alert('Error: ' + error.message);
      else { alert('ลบสมาชิกเรียบร้อย'); fetchData(); }
    }
  };

  // UI Helpers
  const getRoleBadge = (role) => {
    const colors = { admin: '#ff4d4d', technician: '#4d94ff', customer: '#28a745', guest: '#777' };
    return (
      <span style={{ backgroundColor: colors[role] || '#777', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', marginLeft: '5px' }}>
        {role?.toUpperCase() || 'GUEST'}
      </span>
    );
  };

  const getConfirmationBadge = (status) => {
    const config = {
      pending: { label: '⏳ รอการยืนยันจากลูกค้า', color: '#ffcc00' },
      confirmed: { label: '✅ ลูกค้ายืนยันการซ่อมแล้ว', color: '#28a745' },
      rejected: { label: '❌ ลูกค้าปฏิเสธการซ่อม', color: '#ff4d4d' }
    };
    const current = config[status] || config.pending;
    return <span style={{ color: current.color, fontWeight: 'bold', fontSize: '14px' }}>{current.label}</span>;
  };

  const styles = {
    container: { backgroundColor: '#000', color: '#eee', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' },
    navTab: { display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #222' },
    tabBtn: (active) => ({ padding: '10px 20px', cursor: 'pointer', border: 'none', background: 'none', color: active ? '#ff4d4d' : '#888', borderBottom: active ? '2px solid #ff4d4d' : 'none', fontWeight: 'bold' }),
    statCard: { backgroundColor: '#111', border: '1px solid #222', borderRadius: '15px', padding: '15px', textAlign: 'center' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#0a0a0a', borderRadius: '10px', overflow: 'hidden' },
    th: { backgroundColor: '#111', padding: '12px', textAlign: 'left', color: '#555', fontSize: '12px' },
    td: { padding: '12px', borderBottom: '1px solid #111' },
    input: { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px', width: '100%', marginBottom: '10px', boxSizing: 'border-box' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalBody: { backgroundColor: '#111', width: '90%', maxWidth: '500px', padding: '25px', borderRadius: '20px', border: '1px solid #222' }
  };

  return (
    <div style={styles.container}>
      {/* 1. สถิติสรุปภาพรวม */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div style={styles.statCard}><small>รอซ่อม</small><h2 style={{color:'#ffcc00'}}>{stats.pending}</h2></div>
        <div style={styles.statCard}><small>กำลังซ่อม</small><h2 style={{color:'#00ccff'}}>{stats.doing}</h2></div>
        <div style={styles.statCard}><small>เสร็จสิ้น</small><h2 style={{color:'#28a745'}}>{stats.done}</h2></div>
        <div style={styles.statCard}><small>สมาชิกทั้งหมด</small><h2>{stats.allMembers}</h2></div>
      </div>

      {/* 2. เมนูเลือกหน้าจอ */}
      <div style={styles.navTab}>
        <button style={styles.tabBtn(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>📋 รายการแจ้งซ่อม</button>
        <button style={styles.tabBtn(activeTab === 'members')} onClick={() => setActiveTab('members')}>👥 จัดการสมาชิก</button>
      </div>

      {/* 3. ส่วนเนื้อหาหลัก */}
      {activeTab === 'tasks' ? (
        <section>
          {/* ตัวกรองสถานะ */}
          <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
            {['all', 'pending', 'in_progress', 'completed'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{padding:'5px 15px', borderRadius:'15px', border: filterStatus===s?'1px solid #ff4d4d':'1px solid #333', backgroundColor: filterStatus===s?'#ff4d4d11':'transparent', color: filterStatus===s?'#ff4d4d':'#888', cursor:'pointer'}}>
                {s === 'all' ? 'ทั้งหมด' : s === 'pending' ? 'รอซ่อม' : s === 'in_progress' ? 'กำลังซ่อม' : 'เสร็จสิ้น'}
              </button>
            ))}
          </div>

          <table style={styles.table}>
            <thead>
              <tr><th style={styles.th}>เวลา</th><th style={styles.th}>ผู้แจ้ง</th><th style={styles.th}>อุปกรณ์</th><th style={styles.th}>สถานะ</th><th style={styles.th}>ราคา</th><th style={styles.th}>บันทึก</th></tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => (
                <tr key={t.id}>
                  <td style={{...styles.td, color:'#666', fontSize:'12px'}}>{formatThaiDate(t.created_at)}</td>
                  <td style={styles.td}>
                    {/* คลิกที่ชื่อเพื่อเปิด Modal จัดการและเสนอราคา */}
                    <strong style={{color:'#00ccff', cursor:'pointer', textDecoration:'underline'}} onClick={()=>{setSelectedTask(t); setIsTaskModalOpen(true)}}>
                      {t.customer_name || t.profiles?.full_name || t.guest_name}
                    </strong> 
                    {getRoleBadge(t.profiles?.role || 'guest')}
                  </td>
                  <td style={styles.td}>{t.device_type} {t.brand}</td>
                  <td style={styles.td}>
                    <select style={styles.input} value={editData[t.id]?.status || t.status} onChange={e=>setEditData({...editData, [t.id]:{...(editData[t.id]||{}), status: e.target.value}})}>
                      <option value="pending">รอรับงาน</option>
                      <option value="in_progress">กำลังซ่อม</option>
                      <option value="completed">เสร็จสิ้น</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <input type="number" style={{...styles.input, width:'80px'}} defaultValue={t.price} placeholder="ราคา" onChange={e=>setEditData({...editData, [t.id]:{...(editData[t.id]||{}), price: e.target.value}})} />
                  </td>
                  <td style={styles.td}>
                    <button style={{backgroundColor:'#ff4d4d', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold'}} onClick={()=>handleUpdateTask(t.id)}>SAVE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        /* หน้าจัดการสมาชิก */
        <section>
          <button style={{backgroundColor:'#28a745', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'10px', marginBottom:'15px', fontWeight:'bold', cursor:'pointer'}} onClick={()=>setIsAddMemberOpen(true)}>+ เพิ่มสมาชิกใหม่</button>
          <table style={styles.table}>
            <thead>
              <tr><th style={styles.th}>ชื่อ-นามสกุล</th><th style={styles.th}>ประเภท</th><th style={styles.th}>เบอร์ติดต่อ</th><th style={styles.th}>ที่อยู่</th><th style={styles.th}>การจัดการ</th></tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td style={styles.td}><strong>{m.full_name}</strong></td>
                  <td style={styles.td}>{getRoleBadge(m.role)}</td>
                  <td style={styles.td}>{m.phone || '-'}</td>
                  <td style={{...styles.td, color:'#888', fontSize:'12px'}}>{m.address || '-'}</td>
                  <td style={styles.td}>
                    <button style={{marginRight:'10px', color:'#00ccff', background:'none', border:'none', cursor:'pointer'}} onClick={()=>{setSelectedMember(m); setIsMemberModalOpen(true)}}>แก้ไข</button>
                    <button style={{color:'#ff4d4d', background:'none', border:'none', cursor:'pointer'}} onClick={()=>handleDeleteMember(m.id)}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* --- Modals Zone --- */}

      {/* Modal จัดการงานซ่อม เสนอราคา และดูการยืนยันจากลูกค้า */}
      {isTaskModalOpen && selectedTask && (
        <div style={styles.modal} onClick={() => setIsTaskModalOpen(false)}>
          <div style={styles.modalBody} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#00ccff', marginTop:0 }}>🔧 จัดการงานซ่อมและเสนอราคา</h3>
            
            {/* สถานะการยืนยันจากฝั่งลูกค้า */}
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#000', borderRadius: '10px', border: '1px solid #333', textAlign: 'center' }}>
              {getConfirmationBadge(selectedTask.customer_confirmation)}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', color: '#888', display:'block', marginBottom:'5px' }}>ความเห็นของช่าง (ส่งให้ลูกค้าดู)</label>
              <textarea 
                style={{...styles.input, height:'80px'}} 
                placeholder="ระบุรายละเอียดอาการและแนวทางการซ่อม..."
                defaultValue={selectedTask.technician_comment}
                onChange={e => setEditData({...editData, [selectedTask.id]: {...(editData[selectedTask.id] || {}), technician_comment: e.target.value}})}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#888', display:'block', marginBottom:'5px' }}>ราคาประเมิน (บาท)</label>
              <input 
                type="number" 
                style={styles.input} 
                defaultValue={selectedTask.price}
                onChange={e => setEditData({...editData, [selectedTask.id]: {...(editData[selectedTask.id] || {}), price: e.target.value}})}
              />
            </div>

            <button 
              style={{ width: '100%', padding: '15px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize:'16px' }}
              onClick={() => handleUpdateTask(selectedTask.id)}
            >
              บันทึกและเสนอราคา
            </button>
          </div>
        </div>
      )}

      {/* Modal เพิ่มสมาชิกใหม่ */}
      {isAddMemberOpen && (
        <div style={styles.modal} onClick={()=>setIsAddMemberOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#28a745', marginTop:0}}>เพิ่มสมาชิกใหม่</h3>
            <input style={styles.input} placeholder="ชื่อ-นามสกุล" onChange={e=>setNewMember({...newMember, full_name: e.target.value})} />
            <input style={styles.input} placeholder="เบอร์โทรศัพท์" onChange={e=>setNewMember({...newMember, phone: e.target.value})} />
            <input style={styles.input} placeholder="Line ID" onChange={e=>setNewMember({...newMember, line_id: e.target.value})} />
            <textarea style={{...styles.input, height:'60px'}} placeholder="ที่อยู่" onChange={e=>setNewMember({...newMember, address: e.target.value})} />
            <select style={styles.input} onChange={e=>setNewMember({...newMember, role: e.target.value})}>
              <option value="customer">Customer (ลูกค้า)</option>
              <option value="technician">Technician (ช่าง)</option>
              <option value="admin">Admin (ผู้ดูแล)</option>
            </select>
            <button style={{width:'100%', padding:'12px', backgroundColor:'#28a745', color:'#fff', border:'none', borderRadius:'10px', marginTop:'10px', fontWeight:'bold'}} onClick={handleAddMember}>ลงทะเบียนสมาชิก</button>
          </div>
        </div>
      )}

      {/* Modal แก้ไขข้อมูลสมาชิก */}
      {isMemberModalOpen && selectedMember && (
        <div style={styles.modal} onClick={()=>setIsMemberModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#00ccff', marginTop:0}}>แก้ไขข้อมูลสมาชิก</h3>
            <label style={{fontSize:'12px', color:'#555'}}>ชื่อ-นามสกุล</label>
            <input style={styles.input} value={selectedMember.full_name} onChange={e=>setSelectedMember({...selectedMember, full_name: e.target.value})} />
            <label style={{fontSize:'12px', color:'#555'}}>เบอร์โทรศัพท์</label>
            <input style={styles.input} value={selectedMember.phone} onChange={e=>setSelectedMember({...selectedMember, phone: e.target.value})} />
            <label style={{fontSize:'12px', color:'#555'}}>Line ID</label>
            <input style={styles.input} value={selectedMember.line_id} onChange={e=>setSelectedMember({...selectedMember, line_id: e.target.value})} />
            <label style={{fontSize:'12px', color:'#555'}}>ที่อยู่</label>
            <textarea style={{...styles.input, height:'60px'}} value={selectedMember.address} onChange={e=>setSelectedMember({...selectedMember, address: e.target.value})} />
            <button style={{width:'100%', padding:'12px', backgroundColor:'#00ccff', color:'#fff', border:'none', borderRadius:'10px', marginTop:'10px', fontWeight:'bold'}} onClick={handleUpdateMember}>อัปเดตข้อมูล</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;