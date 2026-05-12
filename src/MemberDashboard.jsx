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
      // 1. ดึงข้อมูลสมาชิกแบบละเอียด
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(profileData);

      // 2. ดึงรายการแจ้งซ่อมพร้อมเรียงลำดับเวลา
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
      alert(status === 'confirmed' ? '✅ ยืนยันการซ่อมเรียบร้อย' : '❌ ปฏิเสธการซ่อมเรียบร้อย');
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '700px', margin: '0 auto', color: '#fff', fontFamily: 'sans-serif', lineHeight: '1.6' },
    card: { backgroundColor: '#111', padding: '25px', borderRadius: '25px', border: '1px solid #222', marginBottom: '20px' },
    title: { color: '#ff4d4d', textAlign: 'center', marginBottom: '25px', fontSize: '24px', fontWeight: 'bold' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', textAlign: 'left' },
    label: { color: '#888', fontSize: '12px', marginBottom: '2px' },
    value: { fontSize: '15px', fontWeight: '500', borderBottom: '1px solid #222', paddingBottom: '5px' },
    btnEdit: { backgroundColor: '#333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', width: '100%', marginTop: '10px' },
    btnMain: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold', marginTop: '15px' },
    taskItem: { borderBottom: '1px solid #222', padding: '20px 0' },
    badge: (bgColor) => ({ backgroundColor: bgColor, color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }),
    offerBox: { backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '15px', marginTop: '15px' }
  };

  if (loading) return <div style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>กำลังโหลดข้อมูลสมาชิก...</div>;

  return (
    <div style={styles.container}>
      {/* 1. ส่วนข้อมูลสมาชิก (Member Profile) */}
      <div style={styles.card}>
        <div style={styles.title}>ข้อมูลสมาชิก</div>
        <div style={styles.infoGrid}>
          <div>
            <div style={styles.label}>ชื่อ - นามสกุล</div>
            <div style={styles.value}>{profile?.full_name || '-'}</div>
          </div>
          <div>
            <div style={styles.label}>ชื่อผู้ใช้ (Username)</div>
            <div style={styles.value}>{profile?.username || session.user.email.split('@')[0]}</div>
          </div>
          <div>
            <div style={styles.label}>เบอร์โทรศัพท์</div>
            <div style={styles.value}>{profile?.phone || '-'}</div>
          </div>
          <div>
            <div style={styles.label}>ไลน์ไอดี (Line ID)</div>
            <div style={styles.value}>{profile?.line_id || '-'}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={styles.label}>อีเมล</div>
            <div style={styles.value}>{session.user.email}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={styles.label}>ที่อยู่ปัจจุบัน</div>
            <div style={styles.value}>{profile?.address || '-'}</div>
          </div>
        </div>
        <button style={styles.btnEdit} onClick={() => navigate('/edit-profile')}>📝 แก้ไข / อัปเดตข้อมูล</button>
        <button style={styles.btnMain} onClick={() => navigate('/repair-member')}>+ แจ้งซ่อมอุปกรณ์ใหม่</button>
      </div>

      {/* 2. ส่วนรายการแจ้งซ่อม (Repair Tracking) */}
      <div style={styles.card}>
        <div style={styles.title}>รายการแจ้งซ่อมของสมาชิก</div>
        {myTasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#444' }}>ยังไม่มีประวัติการแจ้งซ่อม</p>
        ) : (
          myTasks.map((task, index) => (
            <div key={task.id} style={styles.taskItem}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>#{myTasks.length - index} | รายการที่แจ้ง</span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(task.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{task.device_type}</div>
                  <div style={{ fontSize: '14px', color: '#ff4d4d' }}>ทะเบียน: {task.plate_number || task.brand}</div>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>อาการ: {task.details}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={styles.badge(task.status === 'ซ่อมเสร็จแล้ว' ? '#28a745' : '#333')}>{task.status}</div>
                  <div style={{ fontSize: '11px', color: task.payment_status === 'ชำระเงินแล้ว' ? '#28a745' : '#ff4d4d', marginTop: '8px', fontWeight: 'bold' }}>
                    💰 {task.payment_status || 'รอสรุปยอด'}
                  </div>
                </div>
              </div>

              {/* ส่วนตอบรับราคาแจ้งซ่อม */}
              {task.price > 0 && task.customer_confirmation === 'pending' && (
                <div style={styles.offerBox}>
                  <p style={{ margin: '0', fontSize: '14px' }}><strong>ช่างแจ้งราคา:</strong> {task.technician_comment}</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>฿ {task.price.toLocaleString()}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleConfirmRepair(task.id, 'confirmed')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#28a745', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>ตกลงซ่อม</button>
                    <button onClick={() => handleConfirmRepair(task.id, 'rejected')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#666', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>ปฏิเสธ</button>
                  </div>
                </div>
              )}

              {task.customer_confirmation === 'confirmed' && (
                <div style={{ color: '#28a745', fontSize: '13px', marginTop: '12px', fontWeight: 'bold' }}>✅ ยืนยันการซ่อมแล้ว</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;