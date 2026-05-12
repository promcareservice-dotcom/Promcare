import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = ({ session }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // ควบคุมโหมดแก้ไข
  const [editForm, setEditForm] = useState({}); // เก็บข้อมูลที่กำลังแก้ไข

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
      setEditForm(profileData || {});

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

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          line_id: editForm.line_id,
          address: editForm.address,
          username: editForm.username
        })
        .eq('id', session.user.id);

      if (error) throw error;
      alert('✅ อัปเดตข้อมูลสำเร็จ');
      setIsEditing(false);
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleConfirmRepair = async (taskId, status) => {
    try {
      const { error } = await supabase
        .from('repair_tasks')
        .update({ customer_confirmation: status })
        .eq('id', taskId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '700px', margin: '0 auto', color: '#fff', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#111', padding: '25px', borderRadius: '25px', border: '1px solid #222', marginBottom: '20px' },
    title: { color: '#ff4d4d', textAlign: 'center', marginBottom: '25px', fontSize: '24px', fontWeight: 'bold' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
    label: { color: '#888', fontSize: '12px', marginBottom: '4px' },
    value: { fontSize: '15px', borderBottom: '1px solid #222', paddingBottom: '5px', minHeight: '25px' },
    input: { backgroundColor: '#222', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '8px', width: '100%', fontSize: '14px', outline: 'none' },
    btnEdit: { backgroundColor: '#333', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', width: '100%', marginTop: '10px', fontWeight: 'bold' },
    btnSave: { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', width: '100%', marginTop: '10px', fontWeight: 'bold' },
    btnMain: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold', marginTop: '15px' },
    taskItem: { borderBottom: '1px solid #222', padding: '20px 0' },
    badge: (bgColor) => ({ backgroundColor: bgColor, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' })
  };

  if (loading) return <div style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>กำลังโหลด...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.title}>ข้อมูลสมาชิก</div>
        
        <div style={styles.infoGrid}>
          {/* ชื่อ-นามสกุล */}
          <div>
            <div style={styles.label}>ชื่อ - นามสกุล</div>
            {isEditing ? (
              <input style={styles.input} value={editForm.full_name || ''} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} />
            ) : (
              <div style={styles.value}>{profile?.full_name || '-'}</div>
            )}
          </div>

          {/* Username */}
          <div>
            <div style={styles.label}>ชื่อผู้ใช้ (Username)</div>
            {isEditing ? (
              <input style={styles.input} value={editForm.username || ''} onChange={(e) => setEditForm({...editForm, username: e.target.value})} />
            ) : (
              <div style={styles.value}>{profile?.username || '-'}</div>
            )}
          </div>

          {/* เบอร์โทร */}
          <div>
            <div style={styles.label}>เบอร์โทรศัพท์</div>
            {isEditing ? (
              <input style={styles.input} value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
            ) : (
              <div style={styles.value}>{profile?.phone || '-'}</div>
            )}
          </div>

          {/* Line ID */}
          <div>
            <div style={styles.label}>ไลน์ไอดี (Line ID)</div>
            {isEditing ? (
              <input style={styles.input} value={editForm.line_id || ''} onChange={(e) => setEditForm({...editForm, line_id: e.target.value})} />
            ) : (
              <div style={styles.value}>{profile?.line_id || '-'}</div>
            )}
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <div style={styles.label}>อีเมล (แก้ไขไม่ได้)</div>
            <div style={{ ...styles.value, color: '#666' }}>{session.user.email}</div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <div style={styles.label}>ที่อยู่ปัจจุบัน</div>
            {isEditing ? (
              <textarea style={{ ...styles.input, height: '60px', fontFamily: 'inherit' }} value={editForm.address || ''} onChange={(e) => setEditForm({...editForm, address: e.target.value})} />
            ) : (
              <div style={styles.value}>{profile?.address || '-'}</div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={styles.btnSave} onClick={handleUpdateProfile}>บันทึกข้อมูล</button>
            <button style={{ ...styles.btnEdit, flex: 1 }} onClick={() => setIsEditing(false)}>ยกเลิก</button>
          </div>
        ) : (
          <button style={styles.btnEdit} onClick={() => setIsEditing(true)}>📝 แก้ไข / อัปเดตข้อมูล</button>
        )}
        
        {!isEditing && (
          <button style={styles.btnMain} onClick={() => navigate('/repair-member')}>+ แจ้งซ่อมอุปกรณ์ใหม่</button>
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.title}>รายการแจ้งซ่อมของสมาชิก</div>
        {myTasks.map((task, index) => (
          <div key={task.id} style={styles.taskItem}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>#{myTasks.length - index} | รายการที่แจ้ง</span>
              <span style={{ fontSize: '12px', color: '#666' }}>{new Date(task.created_at).toLocaleString('th-TH')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{task.device_type}</div>
                <div style={{ fontSize: '14px', color: '#ff4d4d' }}>ทะเบียน: {task.plate_number || task.brand}</div>
                <div style={{ fontSize: '13px', color: '#888' }}>อาการ: {task.details}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={styles.badge(task.status === 'ซ่อมเสร็จแล้ว' ? '#28a745' : '#333')}>{task.status}</div>
                <div style={{ fontSize: '11px', color: '#ff4d4d', marginTop: '8px', fontWeight: 'bold' }}>💰 {task.payment_status || 'รอสรุปยอด'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberDashboard;