import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลสมาชิกและงานซ่อม
  const fetchData = async () => {
    setLoading(true);
    const { data: memberData } = await supabase.from('profiles').select('*');
    if (memberData) setMembers(memberData);

    const { data: repairData } = await supabase.from('repair_tasks').select('*').order('created_at', { ascending: false });
    if (repairData) setRepairs(repairData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('repair_tasks').update({ status: newStatus }).eq('id', id);
    if (!error) fetchData();
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* --- ส่วนที่ 1: ระบบจัดการสมาชิก (ยึดตามดีไซน์ image_de9eb4) --- */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '30px' }}>👥 ระบบจัดการข้อมูลสมาชิกและลูกค้า</h2>
        
        <div style={{ background: '#161616', padding: '30px', borderRadius: '15px', border: '1px solid #333', maxWidth: '900px', margin: '0 auto' }}>
          <h3 style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '20px' }}>➕ ลงทะเบียนสมาชิกใหม่</h3>
          {/* ส่วนนี้คือโครงสร้างฟอร์มที่คุณเคยมีในรูป image_de9eb4 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             <div>
               <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>ชื่อ-นามสกุล</label>
               <input type="text" placeholder="ระบุชื่อและนามสกุล" style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' }} />
             </div>
             <div>
               <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>ชื่อผู้ใช้งาน (Username)</label>
               <input type="text" placeholder="ระบุชื่อผู้ใช้งาน" style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' }} />
             </div>
          </div>
          <button style={{ width: '100%', padding: '15px', marginTop: '25px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
            ➕ บันทึกรายชื่อสมาชิกใหม่
          </button>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ color: '#aaa' }}>พบสมาชิกทั้งหมด {members.length} ท่าน</p>
        </div>
      </section>

      {/* --- ส่วนที่ 2: รายการแจ้งซ่อม (ยึดตามดีไซน์ image_de2e77 ที่มีรายละเอียดครบ) --- */}
      <section style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ color: '#ff4d4d', borderBottom: '2px solid #333', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🔧 รายการแจ้งซ่อมและจัดการสถานะ
        </h2>

        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {repairs.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center' }}>ไม่มีข้อมูลการแจ้งซ่อม</p>
          ) : (
            repairs.map((task) => (
              <div key={task.id} style={{ background: '#161616', padding: '25px', borderRadius: '15px', border: '1px solid #333', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ flex: '1' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ background: '#ff4d4d', padding: '3px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>{task.device_type}</span>
                      {task.color && <span style={{ color: '#aaa', fontSize: '0.85rem' }}>🎨 สี: {task.color}</span>}
                    </div>
                    <h3 style={{ margin: '0 0 10px 0' }}>{task.brand} {task.device_name}</h3>
                    {task.registration_number && (
                      <div style={{ background: '#222', padding: '5px 12px', borderRadius: '5px', border: '1px solid #444', display: 'inline-block' }}>
                         <span style={{ fontSize: '0.9rem' }}>ทะเบียน: <strong>{task.registration_number}</strong></span>
                      </div>
                    )}
                    <p style={{ color: '#eee', marginTop: '15px', background: '#222', padding: '10px', borderRadius: '8px' }}>
                      <strong>อาการเสีย:</strong> {task.issue}
                    </p>
                  </div>

                  <div style={{ width: '200px', textAlign: 'right' }}>
                    <p style={{ fontSize: '0.8rem', color: '#888' }}>สถานะการดำเนินการ</p>
                    <div style={{ color: task.status === 'success' ? '#4ade80' : '#fbbf24', fontWeight: 'bold', fontSize: '1.2rem', margin: '10px 0' }}>
                      {task.status === 'pending' ? '⏳ รอดำเนินการ' : task.status === 'fixing' ? '🔧 กำลังซ่อม' : '✅ เสร็จสิ้น'}
                    </div>
                    <select 
                      value={task.status} 
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      style={{ width: '100%', background: '#000', color: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #ff4d4d' }}
                    >
                      <option value="pending">รอดำเนินการ</option>
                      <option value="fixing">กำลังซ่อม</option>
                      <option value="success">เสร็จสิ้น</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;