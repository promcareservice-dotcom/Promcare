import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = ({ session }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

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
      alert(status === 'confirmed' ? '✅ คุณยืนยันการซ่อมเรียบร้อย' : '❌ คุณปฏิเสธการซ่อมรายการนี้');
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // ฟังก์ชันแปลงสถานะเป็นภาษาไทยและกำหนดสี
  const getStatusDetails = (status) => {
    switch (status) {
      case 'pending': return { text: 'รอยืนยันการซ่อม', color: '#ffc107' }; // เหลือง
      case 'waiting': return { text: 'รอดำเนินการ', color: '#6c757d' }; // เทา
      case 'repairing': return { text: 'กำลังซ่อม', color: '#17a2b8' }; // ฟ้า
      case 'completed': return { text: 'ซ่อมเสร็จเรียบร้อย', color: '#28a745' }; // เขียว
      default: return { text: status, color: '#333' };
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '700px', margin: '0 auto', color: '#fff', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#111', padding: '25px', borderRadius: '25px', border: '1px solid #222', marginBottom: '20px' },
    title: { color: '#ff4d4d', textAlign: 'center', marginBottom: '25px', fontSize: '24px', fontWeight: 'bold' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
    label: { color: '#888', fontSize: '12px', marginBottom: '4px' },
    value: { fontSize: '15px', borderBottom: '1px solid #222', paddingBottom: '5px', minHeight: '25px' },
    input: { backgroundColor: '#222', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '8px', width: '100%', fontSize: '14px' },
    btnEdit: { backgroundColor: '#333', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', width: '100%', marginTop: '10px', fontWeight: 'bold' },
    btnSave: { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', width: '100%', marginTop: '10px', fontWeight: 'bold' },
    btnMain: { backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold', marginTop: '15px' },
    taskItem: { borderBottom: '1px solid #222', padding: '25px 0' },
    badge: (bgColor) => ({ backgroundColor: bgColor, padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: '#fff', display: 'inline-block' }),
    offerBox: { backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '15px', marginTop: '15px', border: '1px solid #ffeeba' },
    paymentBox: { backgroundColor: '#d4edda', color: '#155724', padding: '20px', borderRadius: '15px', marginTop: '15px', border: '1px solid #c3e6cb', textAlign: 'center' },
    qrPlaceholder: { backgroundColor: '#fff', padding: '10px', width: '150px', height: '150px', margin: '15px auto', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  };

  if (loading) return <div style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div style={styles.container}>
      {/* ส่วนข้อมูลสมาชิก */}
      <div style={styles.card}>
        <div style={styles.title}>ข้อมูลสมาชิก</div>
        <div style={styles.infoGrid}>
          <div>
            <div style={styles.label}>ชื่อ - นามสกุล</div>
            {isEditing ? <input style={styles.input} value={editForm.full_name || ''} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} /> : <div style={styles.value}>{profile?.full_name || '-'}</div>}
          </div>
          <div>
            <div style={styles.label}>ชื่อผู้ใช้ (Username)</div>
            {isEditing ? <input style={styles.input} value={editForm.username || ''} onChange={(e) => setEditForm({...editForm, username: e.target.value})} /> : <div style={styles.value}>{profile?.username || '-'}</div>}
          </div>
          <div>
            <div style={styles.label}>เบอร์โทรศัพท์</div>
            {isEditing ? <input style={styles.input} value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} /> : <div style={styles.value}>{profile?.phone || '-'}</div>}
          </div>
          <div>
            <div style={styles.label}>ไลน์ไอดี (Line ID)</div>
            {isEditing ? <input style={styles.input} value={editForm.line_id || ''} onChange={(e) => setEditForm({...editForm, line_id: e.target.value})} /> : <div style={styles.value}>{profile?.line_id || '-'}</div>}
          </div>
          <div style={{ gridColumn: 'span 2' }}><div style={styles.label}>อีเมล</div><div style={{ ...styles.value, color: '#666' }}>{session.user.email}</div></div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={styles.label}>ที่อยู่ปัจจุบัน</div>
            {isEditing ? <textarea style={{ ...styles.input, height: '60px', fontFamily: 'inherit' }} value={editForm.address || ''} onChange={(e) => setEditForm({...editForm, address: e.target.value})} /> : <div style={styles.value}>{profile?.address || '-'}</div>}
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
        {!isEditing && <button style={styles.btnMain} onClick={() => navigate('/repair-member')}>+ แจ้งซ่อมอุปกรณ์ใหม่</button>}
      </div>

      {/* ส่วนรายการแจ้งซ่อม */}
      <div style={styles.card}>
        <div style={styles.title}>รายการแจ้งซ่อมของสมาชิก</div>
        {myTasks.length === 0 ? <p style={{textAlign:'center', color:'#444'}}>ไม่มีประวัติการแจ้งซ่อม</p> : (
          myTasks.map((task, index) => {
            const statusInfo = getStatusDetails(task.status);
            return (
              <div key={task.id} style={styles.taskItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>#{myTasks.length - index} | รายการที่แจ้ง</span>
                  <span style={{ fontSize: '11px', color: '#666' }}>{new Date(task.created_at).toLocaleString('th-TH')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '19px', fontWeight: 'bold' }}>{task.device_type}</div>
                    <div style={{ fontSize: '14px', color: '#ff4d4d', marginTop: '2px' }}>ทะเบียน: {task.plate_number || task.brand}</div>
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>อาการ: {task.details}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={styles.badge(statusInfo.color)}>{statusInfo.text}</div>
                    <div style={{ fontSize: '11px', color: task.payment_status === 'ชำระแล้ว' ? '#28a745' : '#ff4d4d', marginTop: '8px', fontWeight: 'bold' }}>
                      💰 {task.payment_status || 'ยังไม่ชำระ'}
                    </div>
                  </div>
                </div>

                {/* ส่วนที่ 1: การยืนยันราคา (เมื่อแอดมินเสนอราคา) */}
                {task.price > 0 && task.customer_confirmation === 'pending' && (
                  <div style={styles.offerBox}>
                    <div style={{ fontSize: '13px', borderBottom: '1px solid rgba(133, 100, 4, 0.1)', paddingBottom: '8px', marginBottom: '8px' }}>
                      <strong>แจ้งราคาประเมิน:</strong> {task.technician_comment || 'ตรวจสอบเบื้องต้นเรียบร้อย'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px' }}>ราคาประเมิน: </span>
                      <span style={{ fontSize: '24px', fontWeight: 'bold' }}>฿ {task.price.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button onClick={() => handleConfirmRepair(task.id, 'confirmed')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#28a745', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>ตกลงซ่อม</button>
                      <button onClick={() => handleConfirmRepair(task.id, 'rejected')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#666', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>ปฏิเสธ</button>
                    </div>
                  </div>
                )}

                {/* ส่วนที่ 2: การชำระเงิน (เมื่อซ่อมเสร็จเรียบร้อย) */}
                {task.status === 'completed' && task.payment_status !== 'ชำระแล้ว' && (
                  <div style={styles.paymentBox}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>🎉 ซ่อมเสร็จเรียบร้อย!</div>
                    <p style={{ fontSize: '14px', margin: '5px 0' }}>ยอดที่ต้องชำระทั้งหมด:</p>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>฿ {task.price.toLocaleString()}</div>
                    
                    <div style={{ textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.05)', padding: '15px', borderRadius: '10px', marginTop: '15px' }}>
                      <div style={{ fontSize: '13px' }}><strong>ข้อมูลบัญชีธนาคาร:</strong></div>
                      <div style={{ fontSize: '14px' }}>ธนาคารกสิกรไทย (K-Bank)</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>เลขที่บัญชี: 123-4-56789-0</div>
                      <div style={{ fontSize: '14px' }}>ชื่อบัญชี: นายพร้อมแคร์ เซอร์วิส</div>
                    </div>

                    <div style={styles.qrPlaceholder}>
                      {/* หากมี URL รูป QR Code สามารถเปลี่ยนแท็ก <img> ได้ที่นี่ */}
                      <span style={{ color: '#ccc', fontSize: '12px' }}>QR CODE เพื่อชำระเงิน</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#666' }}>*กรุณาแนบสลิปผ่านทาง Line ID: {profile?.line_id || 'admin_promcare'}</p>
                  </div>
                )}

                {/* แสดงสถานะการตอบกลับของลูกค้า */}
                <div style={{ marginTop: '12px' }}>
                  {task.customer_confirmation === 'confirmed' && task.status !== 'completed' && (
                    <div style={{ color: '#28a745', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>✅</span> ยืนยันการซ่อมแล้ว (กำลังเข้าสู่ขั้นตอนการซ่อม)
                    </div>
                  )}
                  {task.customer_confirmation === 'rejected' && (
                    <div style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: 'bold' }}>❌ ปฏิเสธการซ่อมรายการนี้</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;