import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({ pending: 0, doing: 0, done: 0, allMembers: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [tasks, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    const { data: taskData } = await supabase.from('repair_tasks').select(`
      *,
      profiles:member_id (full_name, phone, role, address, line_id)
    `).order('created_at', { ascending: false });
    
    const { count: memberCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    if (taskData) {
      setTasks(taskData);
      setStats({
        pending: taskData.filter(t => ['pending', 'รอรับงาน'].includes(t.status)).length,
        doing: taskData.filter(t => ['in_progress', 'กำลังซ่อม'].includes(t.status)).length,
        done: taskData.filter(t => ['completed', 'เสร็จสิ้น'].includes(t.status)).length,
        allMembers: memberCount || 0
      });
    }
    setLoading(false);
  };

  const applyFilter = () => {
    if (filterStatus === 'all') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(t => t.status === filterStatus));
    }
  };

  const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }) + ' น.';
  };

  const getRoleBadge = (task) => {
    const role = task.profiles?.role?.toLowerCase() || 'guest';
    const config = {
      admin: { color: '#ff4d4d', label: 'ADMIN' },
      technician: { color: '#4d94ff', label: 'TECH' },
      customer: { color: '#28a745', label: 'MEMBER' },
      guest: { color: '#777', label: 'GUEST' }
    };
    const style = config[role] || config.guest;
    return (
      <span style={{ 
        backgroundColor: style.color, color: '#fff', fontSize: '10px', 
        padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', marginLeft: '8px' 
      }}>
        {style.label}
      </span>
    );
  };

  const handleUpdate = async (taskId) => {
    const updates = editData[taskId] || {};
    const { error } = await supabase.from('repair_tasks').update(updates).eq('id', taskId);
    if (error) alert('Error: ' + error.message);
    else {
      alert('บันทึกข้อมูลสำเร็จ');
      fetchData();
      setIsTaskModalOpen(false);
    }
  };

  const styles = {
    container: { backgroundColor: '#000', color: '#eee', minHeight: '100vh', padding: '30px', fontFamily: 'Inter, sans-serif' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' },
    statCard: { backgroundColor: '#111', border: '1px solid #222', borderRadius: '16px', padding: '20px', textAlign: 'center' },
    filterBar: { display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' },
    filterBtn: (active) => ({
      padding: '8px 20px', borderRadius: '20px', border: active ? '1px solid #ff4d4d' : '1px solid #333',
      backgroundColor: active ? 'rgba(255, 77, 77, 0.1)' : 'transparent', color: active ? '#ff4d4d' : '#888',
      cursor: 'pointer', transition: '0.3s', fontSize: '14px'
    }),
    tableSection: { backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '20px', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#111', color: '#555', textAlign: 'left', padding: '15px', fontSize: '12px', textTransform: 'uppercase' },
    td: { padding: '15px', borderBottom: '1px solid #111', fontSize: '14px' },
    input: { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '8px', borderRadius: '6px' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalBody: { backgroundColor: '#111', width: '90%', maxWidth: '600px', padding: '30px', borderRadius: '24px', border: '1px solid #222' }
  };

  return (
    <div style={styles.container}>
      {/* 1. Header Stats */}
      <div style={styles.statGrid}>
        <div style={styles.statCard}><small style={{color:'#888'}}>รอซ่อม</small><h2 style={{color:'#ffcc00'}}>{stats.pending}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>กำลังซ่อม</small><h2 style={{color:'#00ccff'}}>{stats.doing}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>เสร็จสิ้น</small><h2 style={{color:'#28a745'}}>{stats.done}</h2></div>
        <div style={styles.statCard}><small style={{color:'#888'}}>สมาชิก</small><h2>{stats.allMembers}</h2></div>
      </div>

      {/* 2. Filter Bar */}
      <div style={styles.filterBar}>
        {['all', 'pending', 'in_progress', 'completed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={styles.filterBtn(filterStatus === s)}>
            {s === 'all' ? 'ทั้งหมด' : s === 'pending' ? 'รอซ่อม' : s === 'in_progress' ? 'กำลังซ่อม' : 'เสร็จสิ้น'}
          </button>
        ))}
      </div>

      {/* 3. Task Table */}
      <div style={styles.tableSection}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>เวลาแจ้งซ่อม</th>
              <th style={styles.th}>ผู้แจ้ง & ประเภท</th>
              <th style={styles.th}>อุปกรณ์</th>
              <th style={styles.th}>สถานะ</th>
              <th style={styles.th}>ราคา</th>
              <th style={styles.th}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(t => (
              <tr key={t.id}>
                <td style={{...styles.td, color:'#666'}}>{formatThaiDate(t.created_at)}</td>
                <td style={styles.td}>
                  <div style={{display:'flex', alignItems:'center'}}>
                    <strong style={{color:'#00ccff', cursor:'pointer'}} onClick={() => {setSelectedTask(t); setIsTaskModalOpen(true);}}>
                      {t.customer_name || t.guest_name || 'ไม่ระบุชื่อ'}
                    </strong>
                    {getRoleBadge(t)}
                  </div>
                </td>
                <td style={styles.td}>{t.device_type} {t.brand}</td>
                <td style={styles.td}>
                  <select 
                    style={styles.input} 
                    value={editData[t.id]?.status || t.status}
                    onChange={e => setEditData({...editData, [t.id]: {...(editData[t.id] || {}), status: e.target.value}})}
                  >
                    <option value="pending">รอรับงาน</option>
                    <option value="in_progress">กำลังซ่อม</option>
                    <option value="completed">เสร็จสิ้น</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <input 
                    type="number" style={{...styles.input, width:'80px'}} defaultValue={t.price}
                    onChange={e => setEditData({...editData, [t.id]: {...(editData[t.id] || {}), price: e.target.value}})}
                  />
                </td>
                <td style={styles.td}>
                  <button 
                    style={{backgroundColor:'#ff4d4d', border:'none', padding:'8px 15px', borderRadius:'8px', color:'#fff', fontWeight:'bold', cursor:'pointer'}}
                    onClick={() => handleUpdate(t.id)}
                  >บันทึก</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Detail Modal */}
      {isTaskModalOpen && selectedTask && (
        <div style={styles.modal} onClick={() => setIsTaskModalOpen(false)}>
          <div style={styles.modalBody} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #222', paddingBottom:'15px', marginBottom:'20px'}}>
              <h3>รายละเอียดการแจ้งซ่อม</h3>
              <button onClick={() => setIsTaskModalOpen(false)} style={{background:'none', border:'none', color:'#888', fontSize:'24px', cursor:'pointer'}}>&times;</button>
            </div>
            
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
              <div>
                <label style={{color:'#555', fontSize:'12px'}}>ข้อมูลผู้ติดต่อ</label>
                <p><strong>ชื่อ:</strong> {selectedTask.customer_name || selectedTask.guest_name}</p>
                <p><strong>เบอร์โทร:</strong> {selectedTask.profiles?.phone || selectedTask.phone || selectedTask.guest_tel || '-'}</p>
                <p><strong>Line:</strong> {selectedTask.profiles?.line_id || '-'}</p>
              </div>
              <div>
                <label style={{color:'#555', fontSize:'12px'}}>ข้อมูลอุปกรณ์</label>
                <p><strong>ประเภท:</strong> {selectedTask.device_type}</p>
                <p><strong>แบรนด์/รุ่น:</strong> {selectedTask.brand} {selectedTask.model}</p>
                <p><strong>ทะเบียน/SN:</strong> {selectedTask.license_plate || '-'}</p>
              </div>
            </div>

            <div style={{marginTop:'20px', backgroundColor:'#000', padding:'15px', borderRadius:'12px', border:'1px solid #222'}}>
              <label style={{color:'#ff4d4d', fontSize:'12px', fontWeight:'bold'}}>อาการเสีย</label>
              <p style={{marginTop:'5px', color:'#eee'}}>{selectedTask.description}</p>
            </div>

            <div style={{marginTop:'20px'}}>
              <label style={{color:'#555', fontSize:'12px'}}>บันทึกการซ่อม (Internal)</label>
              <textarea 
                style={{...styles.input, width:'100%', height:'80px', marginTop:'5px', boxSizing:'border-box'}}
                placeholder="ระบุรายละเอียดการซ่อม..."
                defaultValue={selectedTask.technician_comment}
                onChange={e => setEditData({...editData, [selectedTask.id]: {...(editData[selectedTask.id] || {}), technician_comment: e.target.value}})}
              />
            </div>

            <button 
              style={{width:'100%', padding:'15px', backgroundColor:'#ff4d4d', border:'none', borderRadius:'12px', color:'#fff', fontWeight:'bold', marginTop:'20px', cursor:'pointer'}}
              onClick={() => handleUpdate(selectedTask.id)}
            >
              อัปเดตข้อมูลทั้งหมด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;