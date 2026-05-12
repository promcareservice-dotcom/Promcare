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
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(profileData);

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
    try {
      const { error } = await supabase
        .from('repair_tasks')
        .update({ customer_confirmation: status })
        .eq('id', taskId);

      if (error) throw error;
      alert(status === 'confirmed' ? '✅ รับทราบการยืนยันครับ' : '❌ ปฏิเสธการซ่อมเรียบร้อย');
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#fff', fontFamily: 'sans-serif' },
    profileCard: { backgroundColor: '#111', padding: '30px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '1px solid #222' },
    repairSection: { backgroundColor: '#111', padding: '20px', borderRadius: '25px', border: '1px solid #222' },
    taskCard: { borderBottom: '1px solid #222', padding: '20px 0', position: 'relative' },
    statusBadge: { fontSize: '11px', padding: '3px 10px', borderRadius: '15px', backgroundColor: '#333', color: '#aaa', textTransform: 'uppercase' },
    btnMain: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold', marginTop: '20px' },
    offerBox: { backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '15px', marginTop: '15px' }
  };

  if (loading) return <div style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>Loading...</div>;

  return (
    <div style={styles.container}>
      {/* ส่วน Profile */}
      <div style={styles.profileCard}>
        <h2 style={{ color: '#ff4d4d', marginBottom: '25px', marginTop: 0 }}>Member Profile</h2>
        <div style={{ color: '#888', fontSize: '11px', letterSpacing: '1px' }}>FULL NAME</div>
        <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>{profile?.full_name || '-'}</div>
        <div style={{ color: '#888', fontSize: '11px', letterSpacing: '1px' }}>PHONE NUMBER</div>
        <div style={{ fontSize: '18px', marginBottom: '20px' }}>{profile?.phone || '-'}</div>
        <button style={styles.btnMain} onClick={() => navigate('/repair-member')}>+ แจ้งซ่อมอุปกรณ์ใหม่</button>
      </div>

      {/* ส่วนรายการแจ้งซ่อม */}
      <div style={styles.repairSection}>
        <h3 style={{ textAlign: 'center', color: '#ff4d4d', marginBottom: '10px', marginTop: 0 }}>Repair Tracking</h3>
        {myTasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#444' }}>ไม่มีรายการแจ้งซ่อม</p>
        ) : (
          myTasks.map((task) => (
            <div key={task.id} style={styles.taskCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{task.device_type}</div>
                  <div style={{ fontSize: '14px', color: '#ff4d4d', marginTop: '2px' }}>
                    {task.plate_number ? `ทะเบียน: ${task.plate_number}` : task.brand}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                    อาการ: {task.details || 'ตรวจสอบอาการเสีย'}
                  </div>
                </div>
                <div style={styles.statusBadge}>{task.status}</div>
              </div>

              {/* ส่วนเสนอราคาจากแอดมิน */}
              {task.price > 0 && task.customer_confirmation === 'pending' && (
                <div style={styles.offerBox}>
                  <p style={{ margin: '0', fontSize: '14px' }}>ช่างแจ้งราคา: {task.technician_comment}</p>
                  <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '8px 0' }}>฿ {task.price.toLocaleString()}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleConfirmRepair(task.id, 'confirmed')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#28a745', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>ตกลงซ่อม</button>
                    <button onClick={() => handleConfirmRepair(task.id, 'rejected')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#666', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>ปฏิเสธ</button>
                  </div>
                </div>
              )}

              {/* แสดงผลเมื่อยืนยันแล้วเหมือนในภาพ e02981.png */}
              {task.customer_confirmation === 'confirmed' && (
                <div style={{ color: '#28a745', fontSize: '13px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>✅ ยืนยันการซ่อมแล้ว</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;