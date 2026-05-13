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

  const [editData, setEditData] = useState({});
  const [newMember, setNewMember] = useState({
    full_name: '', phone: '', line_id: '', email: '', address: '', role: 'customer'
  });

  useEffect(() => {
    fetchData();
    const subscription = supabase
      .channel('admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repair_tasks' }, () => fetchData())
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
      profiles:member_id (full_name, phone, role, address, line_id, email)
    `).order('created_at', { ascending: false });
    
    const { data: memberData } = await supabase.from('profiles').select('*');

    if (taskData) setTasks(taskData);
    if (memberData) {
      setMembers(memberData);
      setStats({
        pending: taskData?.filter(t => t.status === 'pending').length || 0,
        doing: taskData?.filter(t => t.status === 'in_progress').length || 0,
        done: taskData?.filter(t => t.status === 'completed').length || 0,
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
    else { alert('บันทึกข้อมูลเรียบร้อยแล้ว'); fetchData(); }
  };

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.full_name) return alert('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
    const { error } = await supabase.from('profiles').insert([newMember]);
    if (error) alert('Error: ' + error.message);
    else { 
      alert('เพิ่มสมาชิกใหม่สำเร็จ'); 
      setIsAddMemberOpen(false); 
      setNewMember({ full_name: '', phone: '', line_id: '', email: '', address: '', role: 'customer' });
      fetchData(); 
    }
  };

  const formatThaiDate = (dateString) => {
    return new Date(dateString).toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';
  };

  const styles = {
    container: { backgroundColor: '#000', color: '#eee', minHeight: '100vh', padding: '30px', fontFamily: "'Kanit', sans-serif" },
    navTab: { display: 'flex', gap: '25px', marginBottom: '35px', borderBottom: '1px solid #222' },
    tabBtn: (active) => ({ padding: '12px 25px', cursor: 'pointer', border: 'none', background: 'none', color: active ? '#ff4d4d' : '#888', borderBottom: active ? '3px solid #ff4d4d' : 'none', fontWeight: 'bold' }),
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' },
    tr: { backgroundColor: '#0a0a0a' },
    td: { padding: '18px 20px', borderBottom: '1px solid #111' },
    input: { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '10px', width: '100%', marginBottom: '15px' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalBody: { backgroundColor: '#0f0f0f', width: '90%', maxWidth: '500px', padding: '30px', borderRadius: '25px', border: '1px solid #222' },
    primaryBtn: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    badge: (bg, color) => ({ backgroundColor: bg, color: color, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', marginRight: '5px' })
  };

  return (
    <div style={styles.container}>
      <div style={styles.navTab}>
        <button style={styles.tabBtn(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>📋 รายการแจ้งซ่อม</button>
        <button style={styles.tabBtn(activeTab === 'members')} onClick={() => setActiveTab('members')}>👥 จัดการสมาชิก</button>
      </div>

      {activeTab === 'tasks' ? (
        <section>
          <table style={styles.table}>
            <thead>
              <tr style={{color:'#555', fontSize:'13px', textAlign:'left'}}>
                <th>วัน-เวลา / ผู้แจ้ง</th>
                <th>อุปกรณ์ / สถานะจากลูกค้า</th>
                <th>ราคา / การชำระเงิน</th>
                <th>จัดการสถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => (
                <tr key={t.id} style={styles.tr}>
                  <td style={styles.td}>
                    <small style={{color:'#666'}}>{formatThaiDate(t.created_at)}</small><br/>
                    <strong>{t.profiles?.full_name || t.guest_name}</strong>
                  </td>
                  <td style={styles.td}>
                    <div style={{color:'#00ccff', fontWeight:'bold'}}>{t.device_type}</div>
                    <div style={{marginTop: '8px'}}>
                      {/* เพิ่มส่วนแสดงสถานะยืนยันและแจ้งโอน */}
                      {t.customer_confirm === 'confirmed' && <span style={styles.badge('rgba(40,167,69,0.2)', '#28a745')}>✓ ยืนยันซ่อม</span>}
                      {t.customer_confirm === 'rejected' && <span style={styles.badge('rgba(220,53,69,0.2)', '#dc3545')}>✗ ปฏิเสธการซ่อม</span>}
                      {t.customer_payment_status === 'notified' && <span style={styles.badge('rgba(0,123,255,0.2)', '#007bff')}>💰 ลูกค้าแจ้งโอนแล้ว</span>}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {/* อ้างอิงรูปแบบจาก image_47da73.png */}
                    <input type="number" style={{...styles.input, width:'90px', marginBottom:'5px'}} 
                      defaultValue={t.price} onChange={e => setEditData({...editData, [t.id]:{...editData[t.id], price: e.target.value}})} />
                    <select style={{...styles.input, fontSize:'12px'}} 
                      defaultValue={t.payment_status} onChange={e => setEditData({...editData, [t.id]:{...editData[t.id], payment_status: e.target.value}})}>
                      <option value="ยังไม่ได้ชำระ">ยังไม่ได้ชำระ</option>
                      <option value="ชำระเงินแล้ว">ชำระเงินแล้ว</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.primaryBtn} onClick={() => handleUpdateTask(t.id)}>บันทึก</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section>
          <div style={{textAlign:'right', marginBottom:'20px'}}>
            <button style={{...styles.primaryBtn, backgroundColor:'#28a745'}} onClick={() => setIsAddMemberOpen(true)}>+ เพิ่มสมาชิกใหม่</button>
          </div>
          {/* ตารางสมาชิก (คงโครงสร้างเดิม) */}
        </section>
      )}

      {/* Modal เพิ่มสมาชิกใหม่ (ปรับปรุงช่องกรอกให้ครบถ้วน) */}
      {isAddMemberOpen && (
        <div style={styles.modal}>
          <div style={styles.modalBody}>
            <h3 style={{color:'#fff', marginBottom:'20px'}}>👥 ข้อมูลสมาชิกใหม่</h3>
            <input style={styles.input} placeholder="ชื่อ-นามสกุล" value={newMember.full_name} onChange={e => setNewMember({...newMember, full_name: e.target.value})} />
            <input style={styles.input} placeholder="อีเมล (สำหรับเข้าใช้งาน)" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
            <input style={styles.input} placeholder="เบอร์โทรศัพท์" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} />
            <input style={styles.input} placeholder="Line ID" value={newMember.line_id} onChange={e => setNewMember({...newMember, line_id: e.target.value})} />
            <textarea style={{...styles.input, height:'80px'}} placeholder="ที่อยู่" value={newMember.address} onChange={e => setNewMember({...newMember, address: e.target.value})} />
            
            <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
              <button style={{...styles.primaryBtn, backgroundColor:'#333', flex:1}} onClick={() => setIsAddMemberOpen(false)}>ยกเลิก</button>
              <button style={{...styles.primaryBtn, backgroundColor:'#28a745', flex:1}} onClick={handleAddMember}>บันทึกข้อมูล</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;