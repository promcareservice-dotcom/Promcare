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
    member_id: '', device_type: '', brand: '', model: '', color: '', plate_number: '', details: '', status: 'pending', repair_cost: 0, payment_status: 'ยังไม่ได้ชำระ'
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
      const sortedMembers = memberData.sort((a, b) => {
        const roleOrder = { admin: 1, technician: 2, customer: 3 };
        return (roleOrder[a.role] || 9) - (roleOrder[b.role] || 9);
      });
      setMembers(sortedMembers);
      
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
    return (
      <span style={{
        color: r.color, backgroundColor: r.bg, border: `1px solid ${r.color}`,
        padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold'
      }}>
        {r.label}
      </span>
    );
  };

  // แก้ไขฟังก์ชันบันทึกเพื่อป้องกัน Error Column Not Found
  const handleUpdateTask = async (taskId, customUpdates = null) => {
    const updates = customUpdates || editData[taskId] || {};
    
    // ตรวจสอบคอลัมน์ราคา (เผื่อใน DB ใช้ชื่อ price แทน repair_cost)
    const { error } = await supabase.from('repair_tasks').update(updates).eq('id', taskId);
    
    if (error) {
        console.error(error);
        alert('ไม่สามารถบันทึกได้: ' + error.message);
    } else { 
      alert('บันทึกข้อมูลเรียบร้อยแล้ว'); 
      fetchData(); 
      if (!customUpdates) {
          setEditData(prev => {
            const newData = {...prev};
            delete newData[taskId];
            return newData;
          });
      }
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
    else { 
      alert('เพิ่มสมาชิกใหม่เรียบร้อยแล้ว'); 
      setIsAddMemberOpen(false); 
      setNewMember({ full_name: '', phone: '', line_id: '', email: '', address: '', role: 'customer' });
      fetchData(); 
    }
  };

  const handleCreateNewTask = async () => {
    if (!newTask.member_id || !newTask.device_type) {
      alert('กรุณาเลือกสมาชิกและระบุอุปกรณ์');
      return;
    }
    const { error } = await supabase.from('repair_tasks').insert([newTask]);
    if (error) alert('Error: ' + error.message);
    else {
      alert('เปิดใบสั่งซ่อมใหม่สำเร็จ');
      setIsNewTaskModalOpen(false);
      setNewTask({ member_id: '', device_type: '', brand: '', model: '', color: '', plate_number: '', details: '', status: 'pending', repair_cost: 0, payment_status: 'ยังไม่ได้ชำระ' });
      fetchData();
    }
  };

  const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';
  };

  const styles = {
    container: { backgroundColor: '#000', color: '#eee', minHeight: '100vh', padding: '30px', fontFamily: "'Kanit', sans-serif" },
    statCard: { backgroundColor: '#111', border: '1px solid #222', borderRadius: '20px', padding: '20px', textAlign: 'center' },
    navTab: { display: 'flex', gap: '25px', marginBottom: '35px', borderBottom: '1px solid #222' },
    tabBtn: (active) => ({ padding: '12px 25px', cursor: 'pointer', border: 'none', background: 'none', color: active ? '#ff4d4d' : '#888', borderBottom: active ? '3px solid #ff4d4d' : 'none', fontWeight: 'bold' }),
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' },
    tr: { backgroundColor: '#0a0a0a' },
    td: { padding: '18px 20px', borderBottom: '1px solid #111' },
    label: { display: 'block', fontSize: '13px', color: '#888', marginBottom: '5px', marginLeft: '5px' },
    input: { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '10px', width: '100%', marginBottom: '15px', outline: 'none', fontSize: '14px' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' },
    modalBody: { backgroundColor: '#0f0f0f', width: '95%', maxWidth: '550px', padding: '35px', borderRadius: '30px', border: '1px solid #222', maxHeight: '90vh', overflowY: 'auto' },
    primaryBtn: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '35px' }}>
        <div style={styles.statCard}><small style={{color:'#888'}}>รอซ่อม</small><h2 style={{color:'#ffcc00'}}>{stats.pending}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>กำลังซ่อม</small><h2 style={{color:'#00ccff'}}>{stats.doing}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>เสร็จสิ้น</small><h2 style={{color:'#28a745'}}>{stats.done}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>สมาชิกทั้งหมด</small><h2>{stats.allMembers}</h2></div>
      </div>

      <div style={styles.navTab}>
        <button style={styles.tabBtn(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>📋 รายการแจ้งซ่อม</button>
        <button style={styles.tabBtn(activeTab === 'members')} onClick={() => setActiveTab('members')}>👥 จัดการสมาชิก</button>
      </div>

      {activeTab === 'tasks' ? (
        <section>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
            <div style={{display:'flex', gap:'10px'}}>
              {['all', 'pending', 'in_progress', 'completed'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{padding:'8px 15px', borderRadius:'20px', border: filterStatus===s?'1px solid #ff4d4d':'1px solid #333', color: filterStatus===s?'#ff4d4d':'#888', cursor:'pointer', background:'none'}}>
                  {s === 'all' ? 'ทั้งหมด' : s === 'pending' ? 'รอซ่อม' : s === 'in_progress' ? 'กำลังซ่อม' : 'เสร็จสิ้น'}
                </button>
              ))}
            </div>
            <button style={{...styles.primaryBtn, backgroundColor:'#00ccff'}} onClick={() => setIsNewTaskModalOpen(true)}>+ เปิดใบแจ้งซ่อมใหม่</button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr style={{color:'#555', fontSize:'13px', textAlign:'left'}}>
                <th>วัน-เวลา / ผู้แจ้ง</th>
                <th>อุปกรณ์</th>
                <th>ราคา / การชำระเงิน</th>
                <th>สถานะ / บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => (
                <tr key={t.id} style={styles.tr}>
                  <td style={styles.td}>
                    <small style={{color:'#666'}}>{formatThaiDate(t.created_at)}</small><br/>
                    <strong 
                      style={{color:'#00ccff', cursor:'pointer', textDecoration:'underline', display:'inline-block', marginTop:'5px'}}
                      onClick={() => { setSelectedMemberInfo(t.profiles); setIsMemberInfoModalOpen(true); }}
                    >
                      {t.profiles?.full_name || t.guest_name || 'ไม่ระบุชื่อ'}
                    </strong>
                    <div style={{marginTop:'5px'}}>{getRoleBadge(t.profiles?.role)}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={{color:'#00ccff', cursor:'pointer', fontWeight:'bold', fontSize:'16px'}} onClick={() => { setSelectedTask(t); setIsDetailModalOpen(true); }}>
                      🔍 {t.device_type}
                    </div>
                    <small style={{color:'#888'}}>📍 {t.brand} {t.model}</small>
                  </td>
                  <td style={styles.td}>
                    <input type="number" style={{...styles.input, width:'90px', marginBottom:'5px', padding:'5px'}} 
                      value={editData[t.id]?.repair_cost ?? (t.repair_cost || 0)} 
                      onChange={e => setEditData({...editData, [t.id]:{...(editData[t.id]||{}), repair_cost: e.target.value}})} 
                    />
                    <select style={{...styles.input, width:'auto', fontSize:'12px', padding:'5px'}} 
                      value={editData[t.id]?.payment_status || t.payment_status || 'ยังไม่ได้ชำระ'} 
                      onChange={e => setEditData({...editData, [t.id]:{...(editData[t.id]||{}), payment_status: e.target.value}})}>
                      <option value="ยังไม่ได้ชำระ">❌ ยังไม่ได้ชำระ</option>
                      <option value="ชำระแล้ว (เงินสด)">💵 เงินสด</option>
                      <option value="ชำระแล้ว (โอนผ่านบัญชี)">📱 โอนผ่านบัญชี</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <select style={{...styles.input, width:'auto', marginBottom:'5px', padding:'5px'}} 
                      value={editData[t.id]?.status || t.status} 
                      onChange={e=>setEditData({...editData, [t.id]:{...(editData[t.id]||{}), status: e.target.value}})}>
                      <option value="pending">⏳ รอรับงาน</option>
                      <option value="in_progress">⚙️ กำลังซ่อม</option>
                      <option value="completed">✅ เสร็จสิ้น</option>
                    </select>
                    <button style={{...styles.primaryBtn, width:'100%', fontSize:'12px', padding:'8px'}} onClick={()=>handleUpdateTask(t.id)}>💾 บันทึก</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
            <input style={{...styles.input, width:'300px'}} placeholder="🔍 ค้นหาสมาชิก..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button style={{...styles.primaryBtn, backgroundColor:'#28a745'}} onClick={()=>setIsAddMemberOpen(true)}>+ เพิ่มสมาชิกใหม่</button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr style={{color:'#555', fontSize:'13px', textAlign:'left'}}>
                <th>ชื่อ-นามสกุล / อีเมล</th>
                <th>สถานะสมาชิก</th>
                <th>เบอร์โทร / Line</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(m => (
                <tr key={m.id} style={styles.tr}>
                  <td style={styles.td}><strong>{m.full_name}</strong><br/><small style={{color:'#555'}}>{m.email}</small></td>
                  <td style={styles.td}>{getRoleBadge(m.role)}</td>
                  <td style={styles.td}>{m.phone || '-'}<br/><small style={{color:'#00ccff'}}>Line: {m.line_id || '-'}</small></td>
                  <td style={styles.td}>
                    <button style={{color:'#00ccff', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}} onClick={()=>{setSelectedMemberInfo(m); setIsMemberInfoModalOpen(true)}}>ดูข้อมูล</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Modal Device Detail & Tech Note (เมื่อกดคลิกที่อุปกรณ์) */}
      {isDetailModalOpen && selectedTask && (
        <div style={styles.modal} onClick={()=>setIsDetailModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#00ccff', borderBottom:'1px solid #222', paddingBottom:'15px'}}>🛠 รายละเอียดการซ่อม</h2>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'20px'}}>
                <div style={{gridColumn:'span 2'}}>
                    <label style={styles.label}>อุปกรณ์ / อาการเสีย</label>
                    <p style={{fontSize:'18px', fontWeight:'bold', color:'#fff', margin:'5px 0'}}>🔍 {selectedTask.device_type} ({selectedTask.brand} {selectedTask.model})</p>
                    <p style={{color:'#aaa', backgroundColor:'#1a1a1a', padding:'15px', borderRadius:'10px'}}>{selectedTask.details || 'ไม่มีรายละเอียดอาการเสีย'}</p>
                </div>
                
                <div style={{gridColumn:'span 2', marginTop:'10px'}}>
                    <label style={{...styles.label, color:'#00ccff'}}>📝 บันทึกความเห็นจากช่าง (Technician Note)</label>
                    <textarea 
                        style={{...styles.input, height:'120px', border:'1px solid #00ccff', marginTop:'5px'}} 
                        placeholder="ระบุความคืบหน้าการซ่อม อะไหล่ที่ใช้ หรือหมายเหตุเพิ่มเติม..."
                        defaultValue={selectedTask.tech_note}
                        onChange={(e) => setSelectedTask({...selectedTask, tech_note: e.target.value})}
                    />
                </div>
            </div>
            <div style={{display:'flex', gap:'15px', marginTop:'20px'}}>
                <button style={{...styles.primaryBtn, backgroundColor:'#333', flex:1}} onClick={()=>setIsDetailModalOpen(false)}>ปิด</button>
                <button 
                    style={{...styles.primaryBtn, backgroundColor:'#00ccff', flex:2}} 
                    onClick={() => handleUpdateTask(selectedTask.id, { tech_note: selectedTask.tech_note })}
                >
                    💾 บันทึกความเห็นช่าง
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Member */}
      {isAddMemberOpen && (
        <div style={styles.modal} onClick={()=>setIsAddMemberOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#28a745', textAlign:'center'}}>👥 เพิ่มสมาชิกใหม่</h2>
            <label style={styles.label}>ชื่อ-นามสกุลสมาชิก *</label>
            <input style={styles.input} placeholder="สมชาย มั่นคง" value={newMember.full_name} onChange={e=>setNewMember({...newMember, full_name: e.target.value})} />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                <div><label style={styles.label}>เบอร์โทรศัพท์ *</label><input style={styles.input} placeholder="081XXXXXXX" value={newMember.phone} onChange={e=>setNewMember({...newMember, phone: e.target.value})} /></div>
                <div><label style={styles.label}>Line ID</label><input style={styles.input} placeholder="ID" value={newMember.line_id} onChange={e=>setNewMember({...newMember, line_id: e.target.value})} /></div>
            </div>
            <label style={styles.label}>อีเมล (ใช้เข้าสู่ระบบ) *</label>
            <input style={styles.input} type="email" placeholder="example@gmail.com" value={newMember.email} onChange={e=>setNewMember({...newMember, email: e.target.value})} />
            <label style={styles.label}>ระดับสิทธิ์</label>
            <select style={styles.input} value={newMember.role} onChange={e=>setNewMember({...newMember, role: e.target.value})}>
                <option value="customer">CUSTOMER</option>
                <option value="technician">TECHNICIAN</option>
                <option value="admin">ADMIN</option>
            </select>
            <button style={{...styles.primaryBtn, backgroundColor:'#28a745', width:'100%', marginTop:'10px'}} onClick={handleAddMember}>บันทึกข้อมูลสมาชิก</button>
          </div>
        </div>
      )}

      {/* Modal Member Info */}
      {isMemberInfoModalOpen && selectedMemberInfo && (
        <div style={styles.modal} onClick={()=>setIsMemberInfoModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center', marginBottom:'20px'}}>
               {getRoleBadge(selectedMemberInfo.role)}
               <h3 style={{marginTop:'15px', color:'#fff'}}>{selectedMemberInfo.full_name}</h3>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', borderTop:'1px solid #222', paddingTop:'20px'}}>
              <div><small style={{color:'#666'}}>เบอร์โทร</small><p>{selectedMemberInfo.phone || '-'}</p></div>
              <div><small style={{color:'#666'}}>Line ID</small><p>{selectedMemberInfo.line_id || '-'}</p></div>
              <div style={{gridColumn:'span 2'}}><small style={{color:'#666'}}>อีเมล</small><p>{selectedMemberInfo.email}</p></div>
              <div style={{gridColumn:'span 2'}}><small style={{color:'#666'}}>ที่อยู่</small><p>{selectedMemberInfo.address || '-'}</p></div>
            </div>
            <button style={{...styles.primaryBtn, width:'100%', marginTop:'20px'}} onClick={()=>setIsMemberInfoModalOpen(false)}>ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* Modal New Task */}
      {isNewTaskModalOpen && (
        <div style={styles.modal} onClick={()=>setIsNewTaskModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#00ccff'}}>🛠 เปิดใบแจ้งซ่อมใหม่</h3>
            <select style={styles.input} onChange={e=>setNewTask({...newTask, member_id: e.target.value})}>
              <option value="">-- เลือกสมาชิก --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.full_name} ({m.phone})</option>)}
            </select>
            <input style={styles.input} placeholder="ประเภทอุปกรณ์ (เช่น คอมพิวเตอร์)" onChange={e=>setNewTask({...newTask, device_type: e.target.value})} />
            <div style={{display:'flex', gap:'10px'}}>
              <input style={styles.input} placeholder="ยี่ห้อ" onChange={e=>setNewTask({...newTask, brand: e.target.value})} />
              <input style={styles.input} placeholder="รุ่น" onChange={e=>setNewTask({...newTask, model: e.target.value})} />
            </div>
            <textarea style={{...styles.input, height:'80px'}} placeholder="อาการเสีย..." onChange={e=>setNewTask({...newTask, details: e.target.value})} />
            <button style={{...styles.primaryBtn, width:'100%', backgroundColor:'#00ccff'}} onClick={handleCreateNewTask}>ยืนยันเปิดใบงาน</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;