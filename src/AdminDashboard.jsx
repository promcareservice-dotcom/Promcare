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

  const handleUpdateTask = async (taskId) => {
    const updates = editData[taskId] || {};
    const { error } = await supabase.from('repair_tasks').update(updates).eq('id', taskId);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
      fetchData();
      setIsTaskModalOpen(false);
      setEditData({});
    }
  };

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

  const getRoleBadge = (role) => {
    const colors = { admin: '#ff4d4d', technician: '#4d94ff', customer: '#28a745', guest: '#777' };
    return (
      <span style={{ backgroundColor: colors[role] || '#777', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', marginLeft: '5px' }}>
        {role?.toUpperCase() || 'GUEST'}
      </span>
    );
  };

  const getPaymentStatusColor = (status) => {
    if (status === 'ชำระแล้ว(เงินสด)') return '#28a745';
    if (status === 'ชำระแล้ว(โอนผ่านบัญชีธนาคาร)') return '#007bff';
    return '#ff4d4d'; // ยังไม่ได้ชำระ
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
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalBody: { backgroundColor: '#111', width: '90%', maxWidth: '550px', padding: '30px', borderRadius: '25px', border: '1px solid #222', maxHeight: '90vh', overflowY: 'auto' },
    detailLabel: { color: '#888', fontSize: '13px', marginBottom: '4px' },
    detailValue: { fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#fff' }
  };

  return (
    <div style={styles.container}>
      {/* 1. สถิติสรุป */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div style={styles.statCard}><small>รอซ่อม</small><h2 style={{color:'#ffcc00'}}>{stats.pending}</h2></div>
        <div style={styles.statCard}><small>กำลังซ่อม</small><h2 style={{color:'#00ccff'}}>{stats.doing}</h2></div>
        <div style={styles.statCard}><small>เสร็จสิ้น</small><h2 style={{color:'#28a745'}}>{stats.done}</h2></div>
        <div style={styles.statCard}><small>สมาชิกทั้งหมด</small><h2>{stats.allMembers}</h2></div>
      </div>

      <div style={styles.navTab}>
        <button style={styles.tabBtn(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>📋 รายการแจ้งซ่อม</button>
        <button style={styles.tabBtn(activeTab === 'members')} onClick={() => setActiveTab('members')}>👥 จัดการสมาชิก</button>
      </div>

      {activeTab === 'tasks' ? (
        <section>
          <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
            {['all', 'pending', 'in_progress', 'completed'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{padding:'5px 15px', borderRadius:'15px', border: filterStatus===s?'1px solid #ff4d4d':'1px solid #333', backgroundColor: filterStatus===s?'#ff4d4d11':'transparent', color: filterStatus===s?'#ff4d4d':'#888', cursor:'pointer'}}>
                {s === 'all' ? 'ทั้งหมด' : s === 'pending' ? 'รอซ่อม' : s === 'in_progress' ? 'กำลังซ่อม' : 'เสร็จสิ้น'}
              </button>
            ))}
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>เวลา</th>
                <th style={styles.th}>ผู้แจ้ง</th>
                <th style={styles.th}>อุปกรณ์ / อาการ</th>
                <th style={styles.th}>สถานะ / การชำระเงิน</th>
                <th style={styles.th}>ราคา</th>
                <th style={styles.th}>บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => (
                <tr key={t.id}>
                  <td style={{...styles.td, color:'#666', fontSize:'11px'}}>{formatThaiDate(t.created_at)}</td>
                  <td style={styles.td}>
                    <strong style={{color:'#fff'}}>{t.customer_name || t.profiles?.full_name || t.guest_name}</strong> 
                    {getRoleBadge(t.profiles?.role || 'guest')}
                  </td>
                  <td style={styles.td}>
                    <div 
                      style={{color:'#00ccff', cursor:'pointer', fontWeight:'bold', textDecoration:'underline'}} 
                      onClick={() => { setSelectedTask(t); setIsDetailModalOpen(true); }}
                    >
                      {t.device_type}
                    </div>
                    <div style={{fontSize:'12px', color:'#888', marginTop:'4px'}}>🚨 อาการ: {t.details || '-'}</div>
                  </td>
                  <td style={styles.td}>
                    <select style={{...styles.input, marginBottom:'5px'}} value={editData[t.id]?.status || t.status} onChange={e=>setEditData({...editData, [t.id]:{...(editData[t.id]||{}), status: e.target.value}})}>
                      <option value="pending">รอรับงาน</option>
                      <option value="in_progress">กำลังซ่อม</option>
                      <option value="completed">เสร็จสิ้น</option>
                    </select>
                    <select 
                      style={{...styles.input, fontSize:'11px', color: getPaymentStatusColor(editData[t.id]?.payment_status || t.payment_status)}} 
                      value={editData[t.id]?.payment_status || t.payment_status || 'ยังไม่ได้ชำระ'} 
                      onChange={e=>setEditData({...editData, [t.id]:{...(editData[t.id]||{}), payment_status: e.target.value}})}
                    >
                      <option value="ยังไม่ได้ชำระ">❌ ยังไม่ได้ชำระ</option>
                      <option value="ชำระแล้ว(เงินสด)">💵 ชำระแล้ว(เงินสด)</option>
                      <option value="ชำระแล้ว(โอนผ่านบัญชีธนาคาร)">📱 ชำระแล้ว(โอน)</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <input type="number" style={{...styles.input, width:'90px'}} defaultValue={t.price} placeholder="ราคา" onChange={e=>setEditData({...editData, [t.id]:{...(editData[t.id]||{}), price: e.target.value}})} />
                  </td>
                  <td style={styles.td}>
                    <button style={{backgroundColor:'#ff4d4d', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}} onClick={()=>handleUpdateTask(t.id)}>SAVE</button>
                    <button style={{display:'block', width:'100%', marginTop:'5px', fontSize:'10px', background:'none', border:'none', color:'#888', cursor:'pointer'}} onClick={()=>{setSelectedTask(t); setIsTaskModalOpen(true)}}>เสนอราคา/ความเห็น</button>
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

      {/* 1. Modal แสดงรายละเอียดอุปกรณ์ (คลิกจากตาราง) */}
      {isDetailModalOpen && selectedTask && (
        <div style={styles.modal} onClick={() => setIsDetailModalOpen(false)}>
          <div style={styles.modalBody} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#ff4d4d', marginTop: 0, borderBottom: '1px solid #222', paddingBottom: '15px' }}>📦 รายละเอียดการแจ้งซ่อม</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div>
                <div style={styles.detailLabel}>ชื่อผู้แจ้ง</div>
                <div style={styles.detailValue}>{selectedTask.customer_name || selectedTask.profiles?.full_name || selectedTask.guest_name}</div>
              </div>
              <div>
                <div style={styles.detailLabel}>เบอร์โทรศัพท์</div>
                <div style={styles.detailValue}>{selectedTask.profiles?.phone || selectedTask.phone || '-'}</div>
              </div>
              <div>
                <div style={styles.detailLabel}>ประเภทอุปกรณ์</div>
                <div style={{...styles.detailValue, color: '#00ccff'}}>{selectedTask.device_type}</div>
              </div>
              <div>
                <div style={styles.detailLabel}>ยี่ห้อ / แบรนด์</div>
                <div style={styles.detailValue}>{selectedTask.brand || '-'}</div>
              </div>
              <div>
                <div style={styles.detailLabel}>รุ่น (Model)</div>
                <div style={styles.detailValue}>{selectedTask.model || '-'}</div>
              </div>
              <div>
                <div style={styles.detailLabel}>ทะเบียน / ซีเรียล</div>
                <div style={styles.detailValue}>{selectedTask.plate_number || '-'}</div>
              </div>
              <div>
                <div style={styles.detailLabel}>สี</div>
                <div style={styles.detailValue}>{selectedTask.color || '-'}</div>
              </div>
              <div>
                <div style={styles.detailLabel}>สถานะปัจจุบัน</div>
                <div style={{...styles.detailValue, color: '#ffcc00'}}>{selectedTask.status}</div>
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <div style={styles.detailLabel}>อาการเสียที่แจ้ง</div>
              <div style={{ ...styles.detailValue, backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '10px', border: '1px solid #333' }}>
                {selectedTask.details || 'ไม่มีรายละเอียด'}
              </div>
            </div>

            <button 
              style={{ width: '100%', padding: '15px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
              onClick={() => setIsDetailModalOpen(false)}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* 2. Modal เสนอราคาและคอมเมนต์ช่าง */}
      {isTaskModalOpen && selectedTask && (
        <div style={styles.modal} onClick={() => setIsTaskModalOpen(false)}>
          <div style={styles.modalBody} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#00ccff', marginTop: 0 }}>🔧 บันทึกความเห็นช่าง</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={styles.detailLabel}>ความเห็นช่าง / รายละเอียดการซ่อม</label>
              <textarea 
                style={{...styles.input, height:'120px'}} 
                placeholder="ระบุสิ่งที่ตรวจพบและวิธีแก้ไข..."
                defaultValue={selectedTask.technician_comment}
                onChange={e => setEditData({...editData, [selectedTask.id]: {...(editData[selectedTask.id] || {}), technician_comment: e.target.value}})}
              />
            </div>
            <button 
              style={{ width: '100%', padding: '15px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => handleUpdateTask(selectedTask.id)}
            >
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      )}

      {/* Modal เพิ่มสมาชิกใหม่ / แก้ไขสมาชิก (คงเดิมตามมาตรฐาน) */}
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

      {isMemberModalOpen && selectedMember && (
        <div style={styles.modal} onClick={()=>setIsMemberModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#00ccff', marginTop:0}}>แก้ไขข้อมูลสมาชิก</h3>
            <label style={styles.detailLabel}>ชื่อ-นามสกุล</label>
            <input style={styles.input} value={selectedMember.full_name} onChange={e=>setSelectedMember({...selectedMember, full_name: e.target.value})} />
            <label style={styles.detailLabel}>เบอร์โทรศัพท์</label>
            <input style={styles.input} value={selectedMember.phone} onChange={e=>setSelectedMember({...selectedMember, phone: e.target.value})} />
            <button style={{width:'100%', padding:'12px', backgroundColor:'#00ccff', color:'#fff', border:'none', borderRadius:'10px', marginTop:'10px', fontWeight:'bold'}} onClick={handleUpdateMember}>อัปเดตข้อมูล</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;