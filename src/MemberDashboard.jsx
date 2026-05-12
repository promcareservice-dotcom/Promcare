import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const MemberDashboard = ({ session }) => {
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ตรวจสอบว่ามีข้อมูลผู้ใช้งานหรือไม่ก่อนดึงข้อมูล
    if (session?.user?.id) {
      fetchMyTasks(session.user.id);
    } else {
      // หากไม่มี session ใน 3 วินาที ให้หยุดโหลดเพื่อแสดงหน้าว่างหรือหน้าแจ้งเตือน
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  const fetchMyTasks = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('repair_tasks')
        .select('*')
        .eq('member_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRepair = async (taskId, status) => {
    try {
      const { error } = await supabase
        .from('repair_tasks')
        .update({ customer_confirmation: status })
        .eq('id', taskId);

      if (error) throw error;
      
      alert(status === 'confirmed' ? '✅ ยืนยันการซ่อมเรียบร้อยแล้ว' : '❌ ปฏิเสธการซ่อมเรียบร้อยแล้ว');
      fetchMyTasks(session.user.id); // รีโหลดข้อมูลใหม่
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', color: '#fff', minHeight: '100vh' },
    card: { backgroundColor: '#111', padding: '20px', borderRadius: '20px', marginBottom: '15px', border: '1px solid #222', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
    statusBadge: (status) => ({
      padding: '5px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      backgroundColor: status === 'completed' ? '#28a745' : '#333',
      color: '#fff',
      textTransform: 'uppercase'
    }),
    offerBox: { backgroundColor: '#fff3cd', color: '#856404', padding: '20px', borderRadius: '15px', marginTop: '15px', border: '1px solid #ffeeba' },
    priceTag: { fontSize: '24px', fontWeight: 'bold', margin: '10px 0' },
    btnConfirm: { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold', flex: 1 },
    btnReject: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', flex: 1 },
    buttonGroup: { display: 'flex', gap: '10px', marginTop: '15px' }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
        <div style={{ fontSize: '18px', color: '#888' }}>กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
        <div style={{ color: '#ff4d4d' }}>ไม่พบข้อมูลการเข้าสู่ระบบ กรุณา Login ใหม่อีกครั้ง</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#ff4d4d' }}>Repair Tracking</h2>
      
      {myTasks.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>ไม่พบรายการแจ้งซ่อมของคุณ</div>
      ) : (
        myTasks.map((task) => (
          <div key={task.id} style={styles.card}>
            <div style={styles.header}>
              <div>
                <strong style={{ fontSize: '18px', display: 'block' }}>{task.device_type}</strong>
                <span style={{ color: '#888', fontSize: '14px' }}>{task.brand} | {task.color}</span>
              </div>
              <span style={styles.statusBadge(task.status)}>{task.status}</span>
            </div>

            {/* ส่วนแจ้งเสนอราคา: แสดงเมื่อมีราคา > 0 และยังรอการตัดสินใจ (pending) */}
            {task.price > 0 && task.customer_confirmation === 'pending' && (
              <div style={styles.offerBox}>
                <p style={{ margin: 0 }}><strong>📢 ข้อเสนอราคาจากช่าง:</strong></p>
                <p style={{ margin: '8px 0', fontSize: '15px', lineHeight: '1.4' }}>{task.technician_comment || 'กรุณาตรวจสอบราคาซ่อมด้านล่าง'}</p>
                <div style={styles.priceTag}>฿ {task.price.toLocaleString()}</div>
                <div style={styles.buttonGroup}>
                  <button style={styles.btnConfirm} onClick={() => handleConfirmRepair(task.id, 'confirmed')}>ยืนยันการซ่อม</button>
                  <button style={styles.btnReject} onClick={() => handleConfirmRepair(task.id, 'rejected')}>ไม่ซ่อม / ยกเลิก</button>
                </div>
              </div>
            )}

            {/* แสดงสถานะเมื่อยืนยันแล้ว */}
            {task.customer_confirmation === 'confirmed' && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#28a74522', borderRadius: '10px', color: '#28a745', fontWeight: 'bold', textAlign: 'center', border: '1px solid #28a745' }}>
                ✅ คุณยืนยันการซ่อมแล้ว (ราคา {task.price.toLocaleString()} บาท)
              </div>
            )}

            {/* แสดงสถานะเมื่อปฏิเสธแล้ว */}
            {task.customer_confirmation === 'rejected' && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#dc354522', borderRadius: '10px', color: '#dc3545', fontWeight: 'bold', textAlign: 'center', border: '1px solid #dc3545' }}>
                ❌ คุณปฏิเสธการซ่อมรายการนี้
              </div>
            )}
            
            <div style={{ marginTop: '15px', fontSize: '11px', color: '#444', textAlign: 'right' }}>
              ID: {task.id.slice(0, 8)}...
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MemberDashboard;