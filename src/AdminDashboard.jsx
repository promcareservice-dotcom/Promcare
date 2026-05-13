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
  const [isEditMemberMode, setIsEditMemberMode] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const [editData, setEditData] = useState({});
  const [memberEditData, setMemberEditData] = useState({});
  const [newMember, setNewMember] = useState({
    full_name: '', phone: '', line_id: '', email: '', address: '', role: 'customer'
  });
  const [newTask, setNewTask] = useState({
    member_id: '', device_type: '', brand: '', model: '', details: '', status: 'pending', price: 0, payment_status: 'ยังไม่ได้ชำระ'
  });

  useEffect(() => {
    fetchData();
    const subscription = supabase
      .channel('admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repair_tasks' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  useEffect(() => {
    if (activeTab === 'tasks') applyTaskFilter();
  }, [tasks, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    const { data: taskData } = await supabase.from('repair_tasks').select(`
      *,
      profiles:member_id (id, full_name, phone, role, address, line_id, email)
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

  const handleUpdateTask = async (taskId, customUpdates = null) => {
    const updates = customUpdates || editData[taskId] || {};
    const { error } = await supabase.from('repair_tasks').update(updates).eq('id', taskId);
    
    if (error) {
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

  const handleUpdateMember = async () => {
    const { error } = await supabase.from('profiles').update(memberEditData).eq('id', selectedMemberInfo.id);
    if (error) {
      alert('แก้ไขล้มเหลว: ' + error.message);
    } else {
      alert('อัปเดตข้อมูลสมาชิกเรียบร้อยแล้ว');
      setIsEditMemberMode(false);
      fetchData();
      setIsMemberInfoModalOpen(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.full_name) return alert('กรุณากรอกข้อมูลให้ครบ');
    const autoUsername = newMember.email.split('@')[0] + Math.floor(1000 + Math.random() * 9000);
    const { error } = await supabase.from('profiles').insert([{ ...newMember, username: autoUsername }]);
    if (error) alert('Error: ' + error.message);
    else { 
      alert('เพิ่มสมาชิกสำเร็จ'); 
      setIsAddMemberOpen(false); 
      setNewMember({ full_name: '', phone: '', line_id: '', email: '', address: '', role: 'customer' });
      fetchData(); 
    }
  };

  const handleCreateNewTask = async () => {
    const { error } = await supabase.from('repair_tasks').insert([newTask]);
    if (error) alert('Error: ' + error.message);
    else {
      alert('เปิดใบงานสำเร็จ');
      setIsNewTaskModalOpen(false);
      setNewTask({ member_id: '', device_type: '', brand: '', model: '', details: '', status: 'pending', price: 0, payment_status: 'ยังไม่ได้ชำระ' });
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
    label: { display: 'block', fontSize: '13px', color: '#888', marginBottom: '5px' },
    input: { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '10px', width: '100%', marginBottom: '15px', outline: 'none' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalBody: { backgroundColor: '#0f0f0f', width: '90%', maxWidth: '500px', padding: '30px', borderRadius: '25px', border: '1px solid #222' },
    primaryBtn: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    badge: (bg, color) => ({ backgroundColor: bg, color: color, padding: '3px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold', marginRight: '5px', display: 'inline-block', marginBottom: '5px' })
  };

  return (
    <div style={styles.container}>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '35px' }}>
        <div style={styles.statCard}><small style={{color:'#888'}}>รอรับงาน</small><h2 style={{color:'#ffcc00'}}>{stats.pending}</h2></div>
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
                  <button key={s} onClick={() => setFilterStatus(s)} style={{padding:'8px 15px', borderRadius:'20px', border: filterStatus===s?'1px solid #ff4d4d':'1px solid #333', color: filterStatus===s?'#ff4d4d':'#888', background:'none', cursor:'pointer'}}>
                    {s === 'all' ? 'ทั้งหมด' : s === 'pending' ? 'รอรับงาน' : s === 'in_progress' ? 'กำลังซ่อม' : 'เสร็จสิ้น'}
                  </button>
                ))}
             </div>
             <button style={{...styles.primaryBtn, backgroundColor:'#00ccff'}} onClick={() => setIsNewTaskModalOpen(true)}>+ เปิดใบแจ้งซ่อมใหม่</button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr style={{color:'#555', fontSize:'13px', textAlign:'left'}}>
                <th>วัน-เวลา / ผู้แจ้ง</th>
                <th>อุปกรณ์ / สถานะยืนยัน</th>
                <th>ราคา / การชำระเงิน</th>
                <th>สถานะ / บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => (
                <tr key={t.id} style={styles.tr}>
                  <td style={styles.td}>
                    <small style={{color:'#666'}}>{formatThaiDate(t.created_at)}</small><br/>
                    <strong style={{color:'#00ccff', cursor:'pointer'}} onClick={() => { setSelectedMemberInfo(t.profiles); setIsMemberInfoModalOpen(true); }}>
                      {t.profiles?.full_name || t.guest_name || 'ไม่ระบุชื่อ'}
                    </strong>
                    <div style={{marginTop:'5px'}}>{getRoleBadge(t.profiles?.role)}</div>
                  </td>
                  <td style={styles.td}>
                    {/* ส่วนแสดงสถานะยืนยันและแจ้งโอน */}
                    <div style={{marginBottom:'5px'}}>
                        {t.customer_confirm === 'confirmed' && <span style={styles.badge('rgba(40,167,69,0.2)', '#28a745')}>✓ ยืนยันซ่อม</span>}
                        {t.customer_confirm === 'rejected' && <span style={styles.badge('rgba(220,53,69,0.2)', '#dc3545')}>✗ ปฏิเสธซ่อม</span>}
                        {t.customer_payment_notified && <span style={styles.badge('rgba(0,123,255,0.2)', '#007bff')}>💰 แจ้งโอนแล้ว</span>}
                    </div>
                    <div style={{color:'#00ccff', fontWeight:'bold', cursor:'pointer'}} onClick={() => { setSelectedTask(t); setIsDetailModalOpen(true); }}>
                      🔍 {t.device_type}
                    </div>
                    <small style={{color:'#888'}}>{t.brand} {t.model}</small>
                  </td>
                  <td style={styles.td}>
                    <input type="number" style={{...styles.input, width:'90px', padding:'5px', marginBottom:'5px'}} 
                      value={editData[t.id]?.price ?? (t.price || 0)} 
                      onChange={e => setEditData({...editData, [t.id]:{...(editData[t.id]||{}), price: e.target.value}})} 
                    />
                    <select style={{...styles.input, width:'130px', fontSize:'12px', padding:'5px'}} 
                      value={editData[t.id]?.payment_status || t.payment_status || 'ยังไม่ได้ชำระ'} 
                      onChange={e => setEditData({...editData, [t.id]:{...(editData[t.id]||{}), payment_status: e.target.value}})}>
                      <option value="ยังไม่ได้ชำระ">❌ ยังไม่ได้ชำระ</option>
                      <option value="ชำระแล้ว (เงินสด)">💵 เงินสด</option>
                      <option value="ชำระแล้ว (โอนผ่านบัญชี)">📱 โอนผ่านบัญชี</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <select style={{...styles.input, width:'110px', padding:'5px', marginBottom:'5px'}} 
                      value={editData[t.id]?.status || t.status} 
                      onChange={e=>setEditData({...editData, [t.id]:{...(editData[t.id]||{}), status: e.target.value}})}>
                      <option value="pending">รอรับงาน</option>
                      <option value="in_progress">กำลังซ่อม</option>
                      <option value="completed">เสร็จสิ้น</option>
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
                <th>สิทธิ์</th>
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
                    <button style={{color:'#00ccff', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}} onClick={()=>{setSelectedMemberInfo(m); setMemberEditData(m); setIsMemberInfoModalOpen(true)}}>ดูข้อมูล</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Modal ดู/แก้ไขสมาชิก */}
      {isMemberInfoModalOpen && selectedMemberInfo && (
        <div style={styles.modal} onClick={()=>{setIsMemberInfoModalOpen(false); setIsEditMemberMode(false);}}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#fff', marginBottom:'20px', textAlign:'center'}}>{isEditMemberMode ? '📝 แก้ไขข้อมูล' : '👤 ข้อมูลสมาชิก'}</h3>
            
            {isEditMemberMode ? (
              <div>
                <label style={styles.label}>ชื่อ-นามสกุล</label>
                <input style={styles.input} value={memberEditData.full_name} onChange={e=>setMemberEditData({...memberEditData, full_name: e.target.value})} />
                <label style={styles.label}>เบอร์โทรศัพท์</label>
                <input style={styles.input} value={memberEditData.phone} onChange={e=>setMemberEditData({...memberEditData, phone: e.target.value})} />
                <label style={styles.label}>Line ID</label>
                <input style={styles.input} value={memberEditData.line_id} onChange={e=>setMemberEditData({...memberEditData, line_id: e.target.value})} />
                <label style={styles.label}>ที่อยู่</label>
                <textarea style={{...styles.input, height:'80px'}} value={memberEditData.address} onChange={e=>setMemberEditData({...memberEditData, address: e.target.value})} />
              </div>
            ) : (
              <div style={{color:'#ccc'}}>
                <p><strong>ชื่อ:</strong> {selectedMemberInfo.full_name}</p>
                <p><strong>อีเมล:</strong> {selectedMemberInfo.email}</p>
                <p><strong>เบอร์โทร:</strong> {selectedMemberInfo.phone || '-'}</p>
                <p><strong>Line:</strong> {selectedMemberInfo.line_id || '-'}</p>
                <p><strong>ที่อยู่:</strong> {selectedMemberInfo.address || '-'}</p>
              </div>
            )}

            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
              <button style={{...styles.primaryBtn, backgroundColor:'#333', flex:1}} onClick={()=>{setIsMemberInfoModalOpen(false); setIsEditMemberMode(false);}}>ปิด</button>
              {isEditMemberMode ? (
                <button style={{...styles.primaryBtn, backgroundColor:'#28a745', flex:1}} onClick={handleUpdateMember}>💾 บันทึกการแก้ไข</button>
              ) : (
                <button style={{...styles.primaryBtn, backgroundColor:'#00ccff', flex:1}} onClick={()=>setIsEditMemberMode(true)}>✏️ แก้ไขข้อมูล</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal รายละเอียดการซ่อม */}
      {isDetailModalOpen && selectedTask && (
        <div style={styles.modal} onClick={()=>setIsDetailModalOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#00ccff'}}>🛠 รายละเอียดอุปกรณ์</h3>
            <p><strong>อุปกรณ์:</strong> {selectedTask.device_type}</p>
            <p><strong>ยี่ห้อ/รุ่น:</strong> {selectedTask.brand} {selectedTask.model}</p>
            <label style={styles.label}>อาการเสีย / รายละเอียดเพิ่มเติม</label>
            <div style={{backgroundColor:'#1a1a1a', padding:'15px', borderRadius:'10px', marginBottom:'15px', color:'#aaa'}}>{selectedTask.details || '-'}</div>
            
            <label style={styles.label}>บันทึกจากช่าง (Technician Comment)</label>
            <textarea style={{...styles.input, height:'100px'}} defaultValue={selectedTask.technician_comment} onChange={(e) => setSelectedTask({...selectedTask, technician_comment: e.target.value})} />
            
            <button style={{...styles.primaryBtn, width:'100%', backgroundColor:'#00ccff'}} onClick={() => handleUpdateTask(selectedTask.id, { technician_comment: selectedTask.technician_comment })}>💾 บันทึกบันทึกช่าง</button>
          </div>
        </div>
      )}

      {/* Modal เพิ่มสมาชิกใหม่ */}
      {isAddMemberOpen && (
        <div style={styles.modal} onClick={()=>setIsAddMemberOpen(false)}>
          <div style={styles.modalBody} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#28a745'}}>👥 เพิ่มสมาชิกใหม่</h3>
            <input style={styles.input} placeholder="ชื่อ-นามสกุล" value={newMember.full_name} onChange={e=>setNewMember({...newMember, full_name: e.target.value})} />
            <input style={styles.input} placeholder="อีเมล" value={newMember.email} onChange={e=>setNewMember({...newMember, email: e.target.value})} />
            <input style={styles.input} placeholder="เบอร์โทร" value={newMember.phone} onChange={e=>setNewMember({...newMember, phone: e.target.value})} />
            <select style={styles.input} value={newMember.role} onChange={e=>setNewMember({...newMember, role: e.target.value})}>
                <option value="customer">CUSTOMER</option>
                <option value="technician">TECHNICIAN</option>
                <option value="admin">ADMIN</option>
            </select>
            <button style={{...styles.primaryBtn, width:'100%', backgroundColor:'#28a745'}} onClick={handleAddMember}>บันทึกสมาชิก</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;