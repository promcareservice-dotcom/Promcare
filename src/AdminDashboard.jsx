import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AdminPage = () => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลทั้งหมด
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: taskData } = await supabase.from('repair_tasks').select('*').order('created_at', { ascending: false });
    const { data: memberData } = await supabase.from('profiles').select('*'); // สมมติว่าชื่อตาราง profiles
    
    setTasks(taskData || []);
    setMembers(memberData || []);
    setLoading(false);
  };

  // คำนวณตัวเลขสำหรับ Card (ภาพ image_ff8aa0.png)
  const stats = {
    pending: tasks.filter(t => t.status === 'pending' || t.status === 'รอรับงาน').length,
    doing: tasks.filter(t => t.status === 'in_progress' || t.status === 'กำลังซ่อม').length,
    done: tasks.filter(t => t.status === 'completed' || t.status === 'ซ่อมเสร็จแล้ว').length,
    allMembers: members.length
  };

  const styles = {
    body: { backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' },
    header: { display: 'flex', alignItems: 'center', marginBottom: '30px' },
    title: { color: '#ff4d4d', fontSize: '32px', marginLeft: '15px', fontWeight: 'bold' },
    cardContainer: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' },
    card: { backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', padding: '20px', textAlign: 'center' },
    cardValue: { fontSize: '28px', color: '#ffcc00', fontWeight: 'bold', marginTop: '10px' },
    
    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' },
    sectionBox: { backgroundColor: '#111', borderRadius: '15px', padding: '25px', border: '1px solid #222' },
    sectionTitle: { color: '#ff4d4d', marginBottom: '20px', display: 'flex', alignItems: 'center', fontSize: '18px' },
    
    input: { width: '100%', backgroundColor: '#222', border: '1px solid #444', color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '15px' },
    btnPrimary: { width: '100%', backgroundColor: '#d92b2b', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
    th: { textAlign: 'left', color: '#666', padding: '10px', fontSize: '14px', borderBottom: '1px solid #333' },
    td: { padding: '15px 10px', borderBottom: '1px solid #222' },
    statusSelect: { backgroundColor: '#222', color: '#ffcc00', border: '1px solid #444', padding: '5px', borderRadius: '5px' }
  };

  return (
    <div style={styles.body}>
      {/* Header ตามภาพ image_ff8aa0.png */}
      <div style={styles.header}>
        <span style={{fontSize: '40px', color: '#d92b2b'}}>🚩</span>
        <h1 style={styles.title}>Promcare Admin <br/><small style={{fontSize: '14px', color: '#888', fontWeight: 'normal'}}>ระบบจัดการหลังบ้านแบบสมบูรณ์</small></h1>
      </div>

      {/* สรุปงานด้านบน */}
      <div style={styles.cardContainer}>
        <div style={styles.card}><div>รอซ่อม</div><div style={styles.cardValue}>{stats.pending}</div></div>
        <div style={styles.card}><div>กำลังซ่อม</div><div style={styles.cardValue}>{stats.doing}</div></div>
        <div style={styles.card}><div>ซ่อมเสร็จแล้ว</div><div style={styles.cardValue}>{stats.done}</div></div>
        <div style={styles.card}><div>สมาชิกทั้งหมด</div><div style={styles.cardValue}>{stats.allMembers}</div></div>
      </div>

      {/* ส่วนจัดการสมาชิก (ภาพ image_ff8a98.png) */}
      <div style={styles.mainGrid}>
        <div style={styles.sectionBox}>
          <h3 style={styles.sectionTitle}>➕ เพิ่มสมาชิกใหม่</h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <input style={styles.input} placeholder="ชื่อ-นามสกุล" />
            <input style={styles.input} placeholder="Username" />
            <input style={styles.input} placeholder="เบอร์โทรศัพท์" />
            <input style={styles.input} placeholder="Line ID" />
          </div>
          <select style={styles.input}><option>ลูกค้า (Customer)</option><option>แอดมิน (Admin)</option></select>
          <button style={styles.btnPrimary}>💾 บันทึกข้อมูลสมาชิก</button>
        </div>

        <div style={styles.sectionBox}>
          <h3 style={styles.sectionTitle}>👥 รายชื่อสมาชิกในระบบ</h3>
          <table style={styles.table}>
             <thead><tr><th>บทบาท</th><th>ชื่อ-นามสกุล / ติดต่อ</th><th>จัดการ</th></tr></thead>
             <tbody>
               {members.map(m => (
                 <tr key={m.id}>
                   <td><span style={{backgroundColor: '#333', padding: '3px 8px', borderRadius: '5px', fontSize: '12px'}}>{m.role}</span></td>
                   <td>{m.full_name}<br/><small style={{color: '#d92b2b'}}>📞 {m.phone}</small></td>
                   <td><button style={{color: '#4d94ff', background: 'none', border: 'none'}}>แก้ไข</button> <button style={{color: '#ff4d4d', background: 'none', border: 'none'}}>ลบ</button></td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>

      {/* ตารางงานซ่อม (ภาพ image_ff8a7c.png) */}
      <div style={styles.sectionBox}>
        <h3 style={styles.sectionTitle}>🔧 รายการงานซ่อมและการดำเนินการ</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>วันที่แจ้ง</th><th>อุปกรณ์ / แบรนด์</th><th>อาการที่แจ้ง</th><th>สถานะงาน</th><th>ราคา (฿)</th><th>บันทึก</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
                <td>{t.device_type}<br/><small style={{color: '#888'}}>{t.registration_number}</small></td>
                <td>{t.description}</td>
                <td>
                  <select style={styles.statusSelect} defaultValue={t.status}>
                    <option value="pending">🟡 รอรับงาน</option>
                    <option value="in_progress">🔵 กำลังซ่อม</option>
                    <option value="completed">🟢 เสร็จสิ้น</option>
                  </select>
                </td>
                <td><input style={{...styles.input, marginBottom: 0, width: '80px', textAlign: 'center'}} defaultValue={t.price || 0} /></td>
                <td style={{color: '#ffcc00', cursor: 'pointer'}}>⏳ รอใส่ราคา</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;