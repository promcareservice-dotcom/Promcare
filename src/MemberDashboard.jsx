import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const MemberDashboard = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. ดึงข้อมูลโปรไฟล์สมาชิก (ส่วนที่หายไป)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(profileData);

      // 2. ดึงข้อมูลรายการแจ้งซ่อม
      const { data: tasksData } = await supabase
        .from('repair_tasks')
        .select('*')
        .eq('member_id', session.user.id)
        .order('created_at', { ascending: false });
      setMyTasks(tasksData || []);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRepair = async (taskId, status) => {
    const { error } = await supabase
      .from('repair_tasks')
      .update({ customer_confirmation: status })
      .eq('id', taskId);

    if (!error) {
      alert(status === 'confirmed' ? 'ยืนยันการซ่อมเรียบร้อย' : 'ปฏิเสธการซ่อมเรียบร้อย');
      fetchData();
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#fff', fontFamily: 'sans-serif' },
    profileCard: { backgroundColor: '#111', padding: '30px', borderRadius: '25px', textAlign: 'center', marginBottom: '30px', border: '1px solid #222' },
    repairSection: { backgroundColor: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #222' },
    taskCard: { borderBottom: '1px solid #222', padding: '15px 0', marginBottom: '10px' },
    offerBox: { backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '12px', marginTop: '10px' },
    btnMain: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '10px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold', marginTop: '15px' },
    btnConfirm: { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' },
    btnReject: { backgroundColor: '#666', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>กำลังโหลด...</div>;

  return (
    <div style={styles.container}>
      {/* --- ส่วนที่ 1: Member Profile (ดึงกลับมาแล้ว) --- */}
      <div style={styles.profileCard}>
        <h2 style={{ color: '#ff4d4d', marginBottom: '20px' }}>Member Profile</h2>
        <div style={{ marginBottom: '10px', color: '#888', fontSize: '12px' }}>FULL NAME</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>{profile?.full_name || 'ไม่ระบุชื่อ'}</div>
        
        <div style={{ marginBottom: '10px', color: '#888', fontSize: '12px' }}>PHONE NUMBER</div>
        <div style={{ fontSize: '18px', marginBottom: '25px' }}>{profile?.phone || 'ไม่ระบุเบอร์โทร'}</div>
        
        <button style={styles.btnMain} onClick={() => window.location.href='/repair-member'}>
          + แจ้งซ่อมอุปกรณ์ใหม่
        </button>
      </div>

      {/* --- ส่วนที่ 2: Repair Tracking (เพิ่มระบบยืนยันราคา) --- */}
      <div style={styles.repairSection}>
        <h3 style={{ textAlign: 'center', color: '#ff4d4d', marginBottom: '20px' }}>Repair Tracking</h3>
        
        {myTasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#444' }}>ไม่มีรายการแจ้งซ่อม</p>
        ) : (
          myTasks.map((task) => (
            <div key={task.id} style={styles.taskCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong>{task.device_type} {task.brand}</strong>
                <span style={{ fontSize: '12px', color: '#888' }}>{task.status}</span>
              </div>
              
              {/* ส่วนเสนอราคาจากแอดมิน */}
              {task.price > 0 && task.customer_confirmation === 'pending' && (
                <div style={styles.offerBox}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}><strong>ช่างแจ้งราคา:</strong> {task.technician_comment}</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>ราคา: {task.price} บาท</p>
                  <div style={{ marginTop: '10px' }}>
                    <button style={styles.btnConfirm} onClick={() => handleConfirmRepair(task.id, 'confirmed')}>ตกลงซ่อม</button>
                    <button style={styles.btnReject} onClick={() => handleConfirmRepair(task.id, 'rejected')}>ปฏิเสธ</button>
                  </div>
                </div>
              )}

              {/* สถานะหลังยืนยัน */}
              {task.customer_confirmation === 'confirmed' && <p style={{ color: '#28a745', fontSize: '13px', marginTop: '5px' }}>✅ ยืนยันการซ่อมแล้ว</p>}
              {task.customer_confirmation === 'rejected' && <p style={{ color: '#ff4d4d', fontSize: '13px', marginTop: '5px' }}>❌ ปฏิเสธการซ่อม</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;