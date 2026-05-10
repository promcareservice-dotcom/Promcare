import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const MemberDashboard = ({ user, onLogout }) => {
  const [carModel, setCarModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [issue, setIssue] = useState('');
  const [myTasks, setMyTasks] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchMyTasks(); }, []);

  const fetchMyTasks = async () => {
    const { data } = await supabase.from('repair_tasks').select('*').eq('username', user.username).order('created_at', { ascending: false });
    if (data) setMyTasks(data);
  };

  // ฟังก์ชันอัปโหลดสลิป
  const handleUploadSlip = async (taskId, file) => {
    if (!file) return;
    setUploading(true);
    const fileName = `slip_${taskId}_${Date.now()}`;
    
    // 1. อัปโหลดไฟล์ไปที่ Storage
    const { data, error } = await supabase.storage.from('slips').upload(fileName, file);
    
    if (error) {
      alert('อัปโหลดไม่สำเร็จ');
    } else {
      // 2. ดึง Public URL มาบันทึกลงฐานข้อมูล
      const { data: urlData } = supabase.storage.from('slips').getPublicUrl(fileName);
      await supabase.from('repair_tasks').update({ slip_url: urlData.publicUrl }).eq('id', taskId);
      alert('อัปโหลดสลิปเรียบร้อยแล้ว!');
      fetchMyTasks();
    }
    setUploading(false);
  };

  const handlePrint = (task) => {
    const printContent = `
      <html>
        <body style="font-family: Arial; padding: 40px; border: 2px solid #000;">
          <h1 style="text-align:center;">PROMCARE RECEIPT</h1>
          <hr/>
          <p><b>ชื่อลูกค้า:</b> ${task.customer_name}</p>
          <p><b>ข้อมูลรถ:</b> ${task.title} (${task.license_plate})</p>
          <p><b>รายการซ่อม:</b> ${task.description}</p>
          <h2 style="text-align:right;">ยอดรวมชำระ: ฿${task.price}</h2>
          <p style="text-align:center; margin-top:50px;">ขอบคุณที่ใช้บริการ</p>
        </body>
      </html>
    `;
    const win = window.open('', '', 'width=600,height=800');
    win.document.write(printContent);
    win.print();
    win.close();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2>PROMCARE <span style={{ color: '#ef4444' }}>MEMBER</span></h2>
        <p onClick={onLogout} style={{ cursor: 'pointer', color: '#888' }}>Logout @{user.username}</p>
      </header>

      {/* ฟอร์มแจ้งซ่อมเดิม ... */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '30px' }}>
         {/* (ส่วนฟอร์ม Input CarModel, License, Issue เหมือนเดิม) */}
         <h4 style={{color:'#ef4444'}}>แจ้งซ่อมคันใหม่</h4>
         <input placeholder="รุ่นรถ" style={inputStyle} value={carModel} onChange={e=>setCarModel(e.target.value)} />
         <button onClick={async() => {
             await supabase.from('repair_tasks').insert([{ title: carModel, description: issue, license_plate: licensePlate, status: 'pending', username: user.username, customer_name: user.fullname }]);
             alert('ส่งงานสำเร็จ'); fetchMyTasks();
         }} style={btnStyle}>ส่งงานซ่อม</button>
      </div>

      <h3>สถานะงานและการชำระเงิน</h3>
      {myTasks.map(task => (
        <div key={task.id} className="glass-card" style={{ padding: '20px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{task.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>ยอดเงิน: <span style={{color:'#34d399'}}>฿{task.price || 0}</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: task.status === 'success' ? '#34d399' : '#fb923c' }}>{task.status.toUpperCase()}</span>
            </div>
          </div>

          {/* เงื่อนไข: ถ้าซ่อมเสร็จและมีราคา ให้โชว์ปุ่มชำระเงิน/อัปโหลดสลิป */}
          {task.status === 'success' && (
            <div style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '10px' }}>
              {!task.slip_url ? (
                <div>
                  <p style={{fontSize:'0.8rem', color:'#aaa'}}>แนบสลิปโอนเงิน:</p>
                  <input type="file" accept="image/*" onChange={(e) => handleUploadSlip(task.id, e.target.files[0])} disabled={uploading} />
                </div>
              ) : (
                <div style={{display:'flex', gap:'10px'}}>
                   <span style={{color:'#34d399'}}>✅ จ่ายแล้ว</span>
                   <button onClick={() => handlePrint(task)} style={{background:'#333', color:'white', border:'none', borderRadius:'5px', padding:'5px 10px', cursor:'pointer'}}>พิมพ์ใบเสร็จ</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', background: '#222', border: '1px solid #444', color: 'white' };
const btnStyle = { width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 'bold' };

export default MemberDashboard;