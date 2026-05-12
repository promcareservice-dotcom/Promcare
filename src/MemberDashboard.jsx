import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const MemberDashboard = ({ session }) => {
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyTasks();
    }
  }, [session]);

  const fetchMyTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('repair_tasks')
      .select('*')
      .eq('member_id', session?.user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error.message);
    } else {
      setMyTasks(data || []);
    }
    setLoading(false);
  };

  const handleConfirmRepair = async (taskId, status) => {
    const { error } = await supabase
      .from('repair_tasks')
      .update({ customer_confirmation: status })
      .eq('id', taskId);

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      alert(status === 'confirmed' ? 'ยืนยันการซ่อมเรียบร้อยแล้ว' : 'ปฏิเสธการซ่อมเรียบร้อยแล้ว');
      fetchMyTasks();
    }
  };

  // กำหนดสไตล์ภายในไฟล์เพื่อป้องกัน Error จากการหาตัวแปร styles ไม่เจอ
  const styles = {
    container: { padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', color: '#fff' },
    card: { backgroundColor: '#111', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #222' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', backgroundColor: '#333' },
    offerBox: { backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '10px', marginTop: '15px', border: '1px solid #ffeeba' },
    btnConfirm: { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' },
    btnReject: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', color: '#ff4d4d', marginBottom: '30px' }}>Repair Tracking</h2>
      
      {myTasks.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666' }}>ยังไม่มีรายการแจ้งซ่อมของคุณ</div>
      ) : (
        myTasks.map((task) => (
          <div key={task.id} style={styles.card}>
            <div style={styles.header}>
              <strong style={{ fontSize: '18px' }}>{task.device_type} {task.brand}</strong>
              <span style={styles.statusBadge}>{task.status?.toUpperCase()}</span>
            </div>
            <div style={{ color: '#888', fontSize: '14px' }}>สี: {task.color || '-'}</div>

            {/* แสดงส่วนเสนอราคาเมื่อมีการระบุราคาและยังรอการยืนยัน */}
            {task.price > 0 && task.customer_confirmation === 'pending' && (
              <div style={styles.offerBox}>
                <p style={{ margin: '0 0 10px 0' }}><strong>📢 ช่างเสนอราคาซ่อม:</strong></p>
                <p style={{ fontSize: '15px', marginBottom: '10px' }}>{task.technician_comment || 'ไม่มีหมายเหตุเพิ่มเติม'}</p>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
                  ราคา: {task.price.toLocaleString()} บาท
                </div>
                <div>
                  <button style={styles.btnConfirm} onClick={() => handleConfirmRepair(task.id, 'confirmed')}>ยืนยันการซ่อม</button>
                  <button style={styles.btnReject} onClick={() => handleConfirmRepair(task.id, 'rejected')}>ไม่ซ่อม / ยกเลิก</button>
                </div>
              </div>
            )}

            {/* แสดงสถานะหลังจากยืนยันแล้ว */}
            {task.customer_confirmation === 'confirmed' && (
              <div style={{ marginTop: '15px', color: '#28a745', fontWeight: 'bold' }}>
                ✅ ยืนยันการซ่อมแล้ว (ราคา {task.price.toLocaleString()} บาท)
              </div>
            )}
            {task.customer_confirmation === 'rejected' && (
              <div style={{ marginTop: '15px', color: '#ff4d4d', fontWeight: 'bold' }}>
                ❌ ปฏิเสธการซ่อมแล้ว
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MemberDashboard;