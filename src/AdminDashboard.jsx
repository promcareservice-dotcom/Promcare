import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function AdminDashboard() {
  const [members, setMembers] = useState([]); // สำหรับจัดการสมาชิก
  const [repairs, setRepairs] = useState([]); // สำหรับงานซ่อม
  const [loading, setLoading] = useState(true);

  // --- 1. ฟังก์ชันดึงข้อมูลทั้งหมด ---
  const fetchData = async () => {
    setLoading(true);
    // ดึงข้อมูลสมาชิก
    const { data: memberData } = await supabase.from('profiles').select('*');
    if (memberData) setMembers(memberData);

    // ดึงข้อมูลงานซ่อม
    const { data: repairData } = await supabase.from('repair_tasks').select('*').order('created_at', { ascending: false });
    if (repairData) setRepairs(repairData);
    
    setLoading(false);
  };

  // --- 2. ฟังก์ชันอัปเดตสถานะการซ่อม ---
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('repair_tasks').update({ status: newStatus }).eq('id', id);
    if (!error) fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      
      {/* ส่วนที่ 1: ระบบจัดการข้อมูลสมาชิก (ที่เคยหายไป) */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#ff4d4d', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
          👥 ระบบจัดการข้อมูลสมาชิกและลูกค้า
        </h2>
        <div style={{ marginTop: '20px' }}>
          {/* คุณสามารถนำ Component หรือ Form ลงทะเบียนสมาชิกมาวางตรงนี้ได้ตาม image_de9eb4.png */}
          <p style={{ color: '#888' }}>พบสมาชิกทั้งหมด {members.length} ท่าน</p>
        </div>
      </section>

      {/* ส่วนที่ 2: รายการแจ้งซ่อมและจัดการสถานะ */}
      <section>
        <h2 style={{ color: '#ff4d4d', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
          🔧 รายการแจ้งซ่อมและจัดการสถานะ
        </h2>
        
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {repairs.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center' }}>ไม่มีข้อมูลการแจ้งซ่อม</p>
          ) : (
            repairs.map((task) => (
              <div key={task.id} style={{ background: '#161616', padding: '20px', borderRadius: '15px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ background: '#ff4d4d', padding: '3px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {task.device_type}
                    </span>
                    <h3 style={{ margin: '10px 0' }}>{task.brand} {task.device_name} (สี: {task.color})</h3>
                    <p>ทะเบียน: <strong>{task.registration_number || 'ไม่ระบุ'}</strong></p>
                    <p style={{ color: '#ccc' }}>อาการ: {task.issue}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p>สถานะ: <strong style={{ color: '#fbbf24' }}>{task.status}</strong></p>
                    <select 
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      style={{ background: '#000', color: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #ff4d4d' }}
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