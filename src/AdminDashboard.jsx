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
  
  // เพิ่ม field color และ plate_number เพื่อรองรับข้อมูลที่ครบถ้วน
  const [newTask, setNewTask] = useState({
    member_id: '', device_type: '', brand: '', model: '', 
    color: '', plate_number: '', details: '', 
    status: 'pending', repair_cost: 0, payment_status: 'ยังไม่ได้ชำระ'
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
      setNewTask({ 
        member_id: '', device_type: '', brand: '', model: '', 
        color: '', plate_number: '', details: '', 
        status: 'pending', repair_cost: 0, payment_status: 'ยังไม่ได้ชำระ' 
      });
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
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' },
    tr: { backgroundColor: '#0a0a0a' },
    td: { padding: '15px 20px', borderBottom: '1px solid #111' },
    input: { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px', width: '100%', marginBottom: '10px', outline: 'none' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' },
    modalBody: { backgroundColor: '#111', width: '90%', maxWidth: '600px', padding: '40px', borderRadius: '30px', border: '1px solid #333', maxHeight: '90vh', overflowY: 'auto' },
    primaryBtn: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    clickableText: { color: '#00ccff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none', transition: '0.2s' }
  };

  return (
    <div style={styles.container}>
      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '35px' }}>
        <div style={styles.statCard}><small style={{color:'#888'}}>รอซ่อม</small><h2 style={{color:'#ffcc00'}}>{stats.pending}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>กำลังซ่อม</small><h2 style={{color:'#00ccff'}}>{stats.doing}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>เสร็จสิ้น</small><h2 style={{color:'#28a745'}}>{stats.done}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>สมาชิก</small><h2>{stats.allMembers}</h2></div>
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
                <th>อุปกรณ์ (คลิกดูรายละเอียด)</th>
                <th>ราคา / สถานะการชำระ</th>
                <th>สถานะงาน / บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => (
                <tr key={t.id} style={styles.tr}>
                  <td style={styles.td}>
                    <small style={{color:'#666'}}>{formatThaiDate(t.created_at)}</small><br/>
                    <strong>{t.profiles?.full_name || t.guest_name || 'ไม่ระบุชื่อ'}</strong>
                  </td>
                  <td style={styles.td}>
                    <div 
                      style={{...styles.clickableText, fontSize:'1.1rem'}} 
                      onClick={() => { setSelectedTask(t); setIsDetailModalOpen(true); }}
                    >
                      🔍 {t.device_type}
                    </div>
                    <small style={{color:'#888'}}>📍 {t.brand} {t.model}</small>
                  </td>
                  <td style={styles.td}>
                    <input 
                      type="number" 
                      style={{...styles.input, width:'90px', marginBottom:'5px'}} 
                      value={editData[t.id]?.repair_cost ?? (t.repair_cost || 0)} 
                      onChange={e => setEditData({...editData, [t.id]:{...(editData[t.id]||{}), repair_cost: e.target.value}})}
                    />
                    <select 
                      style={{...styles.input, width:'auto', fontSize:'12px'}} 
                      value={editData[t.id]?.payment_status || t.payment_status || 'ยังไม่ได้ชำระ'}
                      onChange={e => setEditData({...editData, [t.id]:{...(editData[t.id]||{}), payment_status: e.target.value}})}
                    >
                      <option value="ยังไม่ได้ชำระ">❌ ยังไม่ได้ชำระ</option>
                      <option value="ชำระแล้ว (เงินสด)">💵 เงินสด</option>
                      <option value="ชำระแล้ว (โอนเข้าบัญชี)">📱 โอนเข้าบัญชี</option>
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
                    <button style={{...styles.primaryBtn, width:'100%', fontSize:'12px', padding:'5px'}} onClick={()=>handleUpdateTask(t.id)}>💾 บันทึกด่วน</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <p style={{textAlign:'center', color:'#555'}}>ส่วนจัดการสมาชิก...</p>
      )}

      {/* Modal รายละเอียดอุปกรณ์เชิงลึก (Car/Device Full Info) */}
      {isDetailModalOpen && selectedTask && (
        <div style={styles.modal} onClick={()=>setIsDetailModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center', marginBottom:'20px'}}>
              <h2 style={{color:'#00ccff', margin:0}}>🛠 รายละเอียดการแจ้งซ่อม</h2>
              <div style={{width:'50px', height:'3px', backgroundColor:'#00ccff', margin:'10px auto'}}></div>
            </div>
            
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', backgroundColor:'#1a1a1a', padding:'20px', borderRadius:'15px'}}>
               <div>
                  <small style={{color:'#666'}}>ประเภทอุปกรณ์</small>
                  <p style={{fontSize:'1.2rem', color:'#fff', margin:'5px 0'}}><strong>{selectedTask.device_type}</strong></p>
               </div>
               <div>
                  <small style={{color:'#666'}}>ยี่ห้อ / รุ่น</small>
                  <p style={{color:'#eee', margin:'5px 0'}}>{selectedTask.brand} {selectedTask.model}</p>
               </div>
               <div>
                  <small style={{color:'#666'}}>สี</small>
                  <p style={{color:'#eee', margin:'5px 0'}}>{selectedTask.color || '-'}</p>
               </div>
               <div>
                  <small style={{color:'#666'}}>หมายเลขทะเบียน / Serial</small>
                  <p style={{color:'#ff4d4d', fontWeight:'bold', margin:'5px 0'}}>{selectedTask.plate_number || '-'}</p>
               </div>
               <div style={{gridColumn:'span 2'}}>
                  <small style={{color:'#666'}}>อาการเสีย / รายละเอียดเพิ่มเติม</small>
                  <p style={{color:'#fff', backgroundColor:'#222', padding:'10px', borderRadius:'8px', marginTop:'5px'}}>
                    {selectedTask.details || 'ไม่ระบุอาการ'}
                  </p>
               </div>
            </div>

            <div style={{marginTop:'25px'}}>
              <label style={{color:'#888', fontSize:'13px'}}>📝 บันทึกความเห็นจากช่าง/แอดมิน</label>
              <textarea 
                style={{...styles.input, height:'100px', marginTop:'5px'}} 
                placeholder="ระบุความคืบหน้า หรือรายละเอียดการซ่อม..."
                defaultValue={selectedTask.tech_notes}
                onChange={e => setEditData({...editData, [selectedTask.id]:{...(editData[selectedTask.id]||{}), tech_notes: e.target.value}})}
              />
              <div style={{display:'flex', gap:'10px'}}>
                <button style={{...styles.primaryBtn, flex:1, backgroundColor:'#00ccff'}} onClick={() => handleUpdateTask(selectedTask.id)}>อัปเดตบันทึก</button>
                <button style={{...styles.primaryBtn, flex:1, backgroundColor:'#333'}} onClick={()=>setIsDetailModalOpen(false)}>ปิด</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal เปิดใบงานซ่อมใหม่ (Admin) */}
      {isNewTaskModalOpen && (
        <div style={styles.modal} onClick={()=>setIsNewTaskModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#00ccff', textAlign:'center'}}>➕ เปิดใบแจ้งซ่อมใหม่</h3>
            <select style={styles.input} onChange={e=>setNewTask({...newTask, member_id: e.target.value})}>
              <option value="">-- เลือกสมาชิก --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.full_name} ({m.phone})</option>)}
            </select>
            <input style={styles.input} placeholder="ประเภทอุปกรณ์ (เช่น รถยนต์, มือถือ)" onChange={e=>setNewTask({...newTask, device_type: e.target.value})} />
            <div style={{display:'flex', gap:'10px'}}>
              <input style={styles.input} placeholder="ยี่ห้อ" onChange={e=>setNewTask({...newTask, brand: e.target.value})} />
              <input style={styles.input} placeholder="รุ่น" onChange={e=>setNewTask({...newTask, model: e.target.value})} />
            </div>
            <div style={{display:'flex', gap:'10px'}}>
              <input style={styles.input} placeholder="สี" onChange={e=>setNewTask({...newTask, color: e.target.value})} />
              <input style={styles.input} placeholder="ทะเบียน/Serial" onChange={e=>setNewTask({...newTask, plate_number: e.target.value})} />
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