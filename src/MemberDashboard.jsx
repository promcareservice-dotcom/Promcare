import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = ({ session }) => {
  const navigate = useNavigate();
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
      // 1. ดึงข้อมูลโปรไฟล์
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
      console.error('Error fetching data:', error.message);
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
      
      alert(status === 'confirmed' ? '✅ ยืนยันการซ่อมเรียบร้อย' : '❌ ปฏิเสธการซ่อมเรียบร้อย');
      fetchData();
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#fff', fontFamily: 'sans-serif' },
    profileCard: { backgroundColor: '#111', padding: '30px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '1px solid #222' },
    repairSection: { backgroundColor: '#111', padding: '20px', borderRadius: '25px', border: '1px solid #222' },
    taskCard: { borderBottom: '1px solid #222', padding: '15px 0' },
    offerBox: { backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '15px', marginTop: '10px', textAlign: 'left' },
    btnMain: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold', marginTop: '20px' },
    btnConfirm: { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' },
    btnReject: { backgroundColor: '#666', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }
  };

  if (loading) return <div style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div style={styles.container}>
      {/* Member Profile Section */}
      <div style={styles.profileCard}>
        <h2 style={{ color: '#ff4d4d', marginBottom: '25px', marginTop: 0 }}>Member Profile</h2>
        <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>FULL NAME</div>
        <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>{profile?.full_name || 'ไม่พบข้อมูล'}</div>
        
        <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>PHONE NUMBER</div>
        <div style={{ fontSize: '18px', marginBottom: '20px' }}>{profile?.phone || 'ไม่พบข้อมูล'}</div>
        
        <button style={styles.btnMain} onClick={() => navigate('/repair-member')}>
          + แจ้งซ่อมอุปกรณ์ใหม่
        </button>
      </div>

      {/* Repair Tracking Section */}
      <div style={styles.repairSection}>
        <h3 style={{ textAlign: 'center', color: '#ff4d4d', marginBottom: '20px', marginTop: 0 }}>Repair Tracking</h3>
        {myTasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#444' }}>ไม่มีรายการแจ้งซ่อม</p>
        ) : (
          myTasks.map((task) => (
            <div key={task.id} style={styles.taskCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{task.device_type}</strong>
                  <div style={{ fontSize: '13px', color: '#888' }}>{task.brand}</div>
                </div>
                <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#333', borderRadius: '10px' }}>{task.status}</span>
              </div>

              {/* ส่วนเสนอราคา */}
              {task.price > 0 && task.customer_confirmation === 'pending' && (
                <div style={styles.offerBox}>
                  <p style={{ margin: '0 0 5px 0' }}><strong>เสนอราคาซ่อม:</strong> {task.technician_comment}</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '5px 0' }}>฿ {task.price.toLocaleString()}</p>
                  <div style={{ marginTop: '10px' }}>
                    <button style={styles.btnConfirm} onClick={() => handleConfirmRepair(task.id, 'confirmed')}>ตกลงซ่อม</button>
                    <button style={styles.btnReject} onClick={() => handleConfirmRepair(task.id, 'rejected')}>ปฏิเสธ</button>
                  </div>
                </div>
              )}

              {task.customer_confirmation === 'confirmed' && <div style={{ color: '#28a745', fontSize: '13px', marginTop: '10px' }}>✅ ยืนยันการซ่อมแล้ว</div>}
              {task.customer_confirmation === 'rejected' && <div style={{ color: '#ff4d4d', fontSize: '13px', marginTop: '10px' }}>❌ ปฏิเสธการซ่อม</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;