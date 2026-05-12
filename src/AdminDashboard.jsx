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
    member_id: '', device_type: '', brand: '', model: '', details: '', status: 'pending', repair_cost: 0, payment_status: 'ยังไม่ได้ชำระ'
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

  const handleUpdateTask = async (taskId) => {
    const updates = editData[taskId] || {};
    const { error } = await supabase.from('repair_tasks').update(updates).eq('id', taskId);
    if (error) alert('Error: ' + error.message);
    else { 
      alert('บันทึกข้อมูลเรียบร้อยแล้ว'); 
      fetchData(); 
      setEditData(prev => {
        const newData = {...prev};
        delete newData[taskId];
        return newData;
      });
    }
  };

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.full_name) {
      alert('กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
      return;
    }
    const autoUsername = newMember.email.split('@')[0] + Math.floor(1000 + Math.random() * 9000);
    const dataToInsert = { ...newMember, username: autoUsername };

    const { error } = await supabase.from('profiles').insert([dataToInsert]);
    if (error) alert('เกิดข้อผิดพลาด: ' + error.message);
    else { 
      alert('ลงทะเบียนสมาชิกใหม่สำเร็จ'); 
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
      setNewTask({ member_id: '', device_type: '', brand: '', model: '', details: '', status: 'pending', repair_cost: 0, payment_status: 'ยังไม่ได้ชำระ' });
      fetchData();
    }
  };

  const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';
  };

  const getRoleBadge = (role) => {
    const colors = { admin: '#ff4d4d', technician: '#4d94ff', customer: '#28a745', guest: '#777' };
    return (
      <span style={{ backgroundColor: colors[role] || '#777', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', marginLeft: '5px' }}>
        {role?.toUpperCase() || 'GUEST'}
      </span>
    );
  };

  const styles = {
    container: { backgroundColor: '#000', color: '#eee', minHeight: '100vh', padding: '30px', fontFamily: "'Kanit', sans-serif" },
    statCard: { backgroundColor: '#111', border: '1px solid #222', borderRadius: '20px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' },
    navTab: { display: 'flex', gap: '25px', marginBottom: '35px', borderBottom: '1px solid #222' },
    tabBtn: (active) => ({ padding: '12px 25px', cursor: 'pointer', border: 'none', background: 'none', color: active ? '#ff4d4d' : '#888', borderBottom: active ? '3px solid #ff4d4d' : 'none', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' }),
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' },
    tr: { backgroundColor: '#0a0a0a' },
    td: { padding: '15px 20px', borderBottom: '1px solid #111' },
    input: { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px', width: '100%', marginBottom: '10px', outline: 'none' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' },
    modalBody: { backgroundColor: '#111', width: '90%', maxWidth: '600px', padding: '30px', borderRadius: '25px', border: '1px solid #333', maxHeight: '90vh', overflowY: 'auto' },
    primaryBtn: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    clickableText: { color: '#00ccff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }
  };

  return (
    <div style={styles.container}>
      {/* Dashboard Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '35px' }}>
        <div style={styles.statCard}><small style={{color:'#888'}}>รอซ่อม</small><h2 style={{color:'#ffcc00', margin:'10px 0'}}>{stats.pending}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>กำลังซ่อม</small><h2 style={{color:'#00ccff', margin:'10px 0'}}>{stats.doing}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>เสร็จสิ้น</small><h2 style={{color:'#28a745', margin:'10px 0'}}>{stats.done}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>สมาชิก</small><h2 style={{margin:'10px 0'}}>{stats.allMembers}</h2></div>
      </div>

      <div style={styles.navTab}>
        <button style={styles.tabBtn(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>📋 รายการแจ้งซ่อม</button>
        <button style={styles.tabBtn(activeTab === 'members')} onClick={() => setActiveTab('members')}>👥 จัดการสมาชิก</button>
      </div>

      {activeTab === 'tasks' ? (
        <section>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center'}}>
            <div style={{display:'flex', gap:'10px'}}>
               {['all', 'pending', 'in_progress', 'completed'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{padding:'8px 15px', borderRadius:'20px', border: filterStatus===s?'1px solid #ff4d4d':'1px solid #333', backgroundColor: filterStatus===s?'#ff4d4d22':'transparent', color: filterStatus===s?'#ff4d4d':'#888', cursor:'pointer'}}>
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
                <th>อุปกรณ์ / รายละเอียด</th>
                <th>ค่าซ่อม / การชำระเงิน</th>
                <th>สถานะ / บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => (
                <tr key={t.id} style={styles.tr}>
                  <td style={styles.td}>
                    <small style={{color:'#666'}}>{formatThaiDate(t.created_at)}</small><br/>
                    <strong style={styles.clickableText} onClick={() => { setSelectedMemberInfo(t.profiles); setIsMemberInfoModalOpen(true); }}>
                      {t.customer_name || t.profiles?.full_name || t.guest_name}
                    </strong>
                    {getRoleBadge(t.profiles?.role || 'guest')}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.clickableText} onClick={() => { setSelectedTask(t); setIsDetailModalOpen(true); }}>{t.device_type}</div>
                    <small style={{color:'#888'}}>📍 {t.brand} {t.model}</small>
                  </td>
                  <td style={styles.td}>
                    <input 
                      type="number" 
                      style={{...styles.input, width:'80px', marginBottom:'5px'}} 
                      placeholder="ราคา" 
                      value={editData[t.id]?.repair_cost !== undefined ? editData[t.id].repair_cost : (t.repair_cost || 0)} 
                      onChange={e => setEditData({...editData, [t.id]:{...(editData[t.id]||{}), repair_cost: e.target.value}})}
                    />
                    <select 
                      style={{...styles.input, width:'auto'}} 
                      value={editData[t.id]?.payment_status || t.payment_status || 'ยังไม่ได้ชำระ'}
                      onChange={e => setEditData({...editData, [t.id]:{...(editData[t.id]||{}), payment_status: e.target.value}})}
                    >
                      <option value="ยังไม่ได้ชำระ">❌ ยังไม่ได้ชำระ</option>
                      <option value="ชำระแล้ว (เงินสด)">💵 เงินสด</option>
                      <option value="ชำระแล้ว (โอนผ่านบัญชี)">📱 โอนผ่านบัญชี</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <select 
                      style={{...styles.input, width:'auto', marginBottom:'5px'}} 
                      value={editData[t.id]?.status || t.status} 
                      onChange={e=>setEditData({...editData, [t.id]:{...(editData[t.id]||{}), status: e.target.value}})}
                    >
                      <option value="pending">⏳ รอรับงาน</option>
                      <option value="in_progress">⚙️ กำลังซ่อม</option>
                      <option value="completed">✅ เสร็จสิ้น</option>
                    </select>
                    <button style={{...styles.primaryBtn, padding:'5px 10px', fontSize:'12px', display:'block', width:'100%'}} onClick={()=>handleUpdateTask(t.id)}>💾 บันทึกด่วน</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'25px'}}>
            <input style={{...styles.input, width:'300px'}} placeholder="🔍 ค้นหาสมาชิก..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button style={{...styles.primaryBtn, backgroundColor:'#28a745'}} onClick={()=>setIsAddMemberOpen(true)}>+ เพิ่มสมาชิกใหม่</button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr style={{color:'#555', fontSize:'13px', textAlign:'left'}}>
                <th>ชื่อ-นามสกุล / อีเมล</th>
                <th>ระดับ</th>
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
                    <button style={{color:'#00ccff', background:'none', border:'none', cursor:'pointer'}} onClick={()=>{setSelectedMemberInfo(m); setIsMemberInfoModalOpen(true)}}>ดูข้อมูล</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Modal แสดงข้อมูลสมาชิก */}
      {isMemberInfoModalOpen && selectedMemberInfo && (
        <div style={styles.modal} onClick={()=>setIsMemberInfoModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#ff4d4d', borderBottom:'1px solid #222', paddingBottom:'10px'}}>👤 ข้อมูลสมาชิก</h3>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'20px'}}>
              <div><small style={{color:'#666'}}>ชื่อ-นามสกุล</small><p>{selectedMemberInfo.full_name}</p></div>
              <div><small style={{color:'#666'}}>ระดับผู้ใช้งาน</small><p>{selectedMemberInfo.role?.toUpperCase()}</p></div>
              <div><small style={{color:'#666'}}>อีเมล</small><p>{selectedMemberInfo.email}</p></div>
              <div><small style={{color:'#666'}}>เบอร์โทรศัพท์</small><p>{selectedMemberInfo.phone || '-'}</p></div>
              <div><small style={{color:'#666'}}>Line ID</small><p>{selectedMemberInfo.line_id || '-'}</p></div>
              <div style={{gridColumn:'span 2'}}><small style={{color:'#666'}}>ที่อยู่</small><p>{selectedMemberInfo.address || '-'}</p></div>
            </div>
            <button style={{...styles.primaryBtn, width:'100%', marginTop:'20px'}} onClick={()=>setIsMemberInfoModalOpen(false)}>ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* Modal รายละเอียดงานซ่อมเชิงลึก & อัปเดตความเห็น */}
      {isDetailModalOpen && selectedTask && (
        <div style={styles.modal} onClick={()=>setIsDetailModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#00ccff', borderBottom:'1px solid #222', paddingBottom:'10px'}}>🛠 รายละเอียดการซ่อม</h3>
            <div style={{marginTop:'15px'}}>
              <p><strong>อุปกรณ์:</strong> {selectedTask.device_type} ({selectedTask.brand} {selectedTask.model})</p>
              <p><strong>อาการเสีย:</strong> {selectedTask.details || 'ไม่ระบุ'}</p>
              <hr style={{borderColor:'#222'}}/>
              <label style={{color:'#888', fontSize:'12px'}}>บันทึกความเห็นจากแอดมิน/ช่าง</label>
              <textarea 
                style={{...styles.input, height:'100px', marginTop:'5px'}} 
                placeholder="ระบุความคืบหน้า หรือสาเหตุการเสีย..."
                defaultValue={selectedTask.tech_notes}
                onChange={e => setEditData({...editData, [selectedTask.id]:{...(editData[selectedTask.id]||{}), tech_notes: e.target.value}})}
              />
              <button 
                style={{...styles.primaryBtn, width:'100%', backgroundColor:'#00ccff'}}
                onClick={() => handleUpdateTask(selectedTask.id)}
              >
                อัปเดตบันทึกการซ่อม
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal เพิ่มสมาชิกใหม่ (Full Form) */}
      {isAddMemberOpen && (
        <div style={styles.modal} onClick={()=>setIsAddMemberOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#28a745', textAlign:'center'}}>✨ ลงทะเบียนสมาชิกใหม่</h3>
            <input style={styles.input} placeholder="ชื่อ-นามสกุล" onChange={e=>setNewMember({...newMember, full_name: e.target.value})} />
            <input style={styles.input} placeholder="อีเมล (สำหรับล็อคอิน)" onChange={e=>setNewMember({...newMember, email: e.target.value})} />
            <input style={styles.input} placeholder="เบอร์โทรศัพท์" onChange={e=>setNewMember({...newMember, phone: e.target.value})} />
            <input style={styles.input} placeholder="Line ID" onChange={e=>setNewMember({...newMember, line_id: e.target.value})} />
            <textarea style={{...styles.input, height:'60px'}} placeholder="ที่อยู่ปัจจุบัน" onChange={e=>setNewMember({...newMember, address: e.target.value})} />
            <select style={styles.input} onChange={e=>setNewMember({...newMember, role: e.target.value})}>
              <option value="customer">Customer (ลูกค้า)</option>
              <option value="technician">Technician (ช่างซ่อม)</option>
              <option value="admin">Admin (ผู้ดูแล)</option>
            </select>
            <button style={{...styles.primaryBtn, width:'100%', padding:'15px', backgroundColor:'#28a745', marginTop:'10px'}} onClick={handleAddMember}>บันทึกสมาชิก</button>
          </div>
        </div>
      )}

      {/* Modal เปิดใบงานใหม่โดย Admin */}
      {isNewTaskModalOpen && (
        <div style={styles.modal} onClick={()=>setIsNewTaskModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#00ccff'}}>🛠 เปิดใบแจ้งซ่อมใหม่</h3>
            <select style={styles.input} onChange={e=>setNewTask({...newTask, member_id: e.target.value})}>
              <option value="">-- เลือกสมาชิกในระบบ --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.full_name} ({m.role})</option>)}
            </select>
            <input style={styles.input} placeholder="ประเภทอุปกรณ์" onChange={e=>setNewTask({...newTask, device_type: e.target.value})} />
            <div style={{display:'flex', gap:'10px'}}>
              <input style={styles.input} placeholder="แบรนด์" onChange={e=>setNewTask({...newTask, brand: e.target.value})} />
              <input style={styles.input} placeholder="รุ่น" onChange={e=>setNewTask({...newTask, model: e.target.value})} />
            </div>
            <textarea style={{...styles.input, height:'80px'}} placeholder="อาการเสีย..." onChange={e=>setNewTask({...newTask, details: e.target.value})} />
            <button style={{...styles.primaryBtn, width:'100%', padding:'15px'}} onClick={handleCreateNewTask}>ยืนยันเปิดใบงาน</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;