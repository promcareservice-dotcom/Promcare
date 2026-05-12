import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const MemberDashboard = ({ session }) => {
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTasks();
  }, [session]);

  const fetchMyTasks = async () => {
    const { data, error } = await supabase
      .from('repair_tasks')
      .select('*')
      .eq('member_id', session?.user?.id) // ดึงเฉพาะงานของตัวเอง
      .order('created_at', { ascending: false });

    if (data) setMyTasks(data);
    setLoading(false);
  };

  // ฟังก์ชันให้ลูกค้ายืนยันราคา
  const handleConfirmRepair = async (taskId, status) => {
    const message = status === 'confirmed' ? 'ยืนยันการซ่อมเรียบร้อย' : 'ปฏิเสธการซ่อมเรียบร้อย';
    const { error } = await supabase
      .from('repair_tasks')
      .update({ customer_confirmation: status })
      .eq('id', taskId);

    if (error) alert(error.message);
    else {
      alert(message);
      fetchMyTasks(); // รีโหลดข้อมูลใหม่
    }
  };

  const styles = {
    // ... สไตล์เดิมของคุณ ...
    offerBox: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      padding: '15px',
      borderRadius: '10px',
      marginTop: '10px',
      border: '1px solid #ffeeba'
    },
    btnConfirm: { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' },
    btnReject: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <h2>Repair Tracking</h2>
      {myTasks.map((task) => (
        <div key={task.id} style={{ backgroundColor: '#111', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>{task.device_type}</strong> - {task.brand}</span>
            <span style={{ color: '#888' }}>{task.status}</span>
          </div>

          {/* ส่วนที่แสดงเมื่อแอดมินเสนอราคามาแล้ว และลูกค้ายังไม่ได้ตัดสินใจ */}
          {task.price > 0 && task.customer_confirmation === 'pending' && (
            <div style={styles.offerBox}>
              <p><strong>📢 ข้อเสนอราคาจากช่าง:</strong></p>
              <p>{task.technician_comment || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
              <h3 style={{ margin: '10px 0' }}>ราคาประเมิน: {task.price} บาท</h3>
              <div style={{ marginTop: '10px' }}>
                <button style={styles.btnConfirm} onClick={() => handleConfirmRepair(task.id, 'confirmed')}>ยืนยันการซ่อม</button>
                <button style={styles.btnReject} onClick={() => handleConfirmRepair(task.id, 'rejected')}>ไม่ซ่อม / ยกเลิก</button>
              </div>
            </div>
          )}

          {/* ส่วนแสดงสถานะที่ตัดสินใจไปแล้ว */}
          {task.customer_confirmation === 'confirmed' && (
            <p style={{ color: '#28a745', marginTop: '10px', fontWeight: 'bold' }}>✅ คุณได้ยืนยันการซ่อมแล้ว (ราคา {task.price} บาท)</p>
          )}
          {task.customer_confirmation === 'rejected' && (
            <p style={{ color: '#dc3545', marginTop: '10px', fontWeight: 'bold' }}>❌ คุณได้ปฏิเสธการซ่อมนี้</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default MemberDashboard;