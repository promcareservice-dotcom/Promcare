import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function AdminDashboard() {
  const [repairs, setRepairs] = useState([]);

  // 1. ฟังก์ชันดึงข้อมูลงานซ่อม
  const fetchRepairs = async () => {
    const { data, error } = await supabase
      .from('repair_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching:', error);
    else setRepairs(data);
  };

  // 2. ฟังก์ชันอัปเดตสถานะ
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('repair_tasks')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) fetchRepairs();
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  // 3. ส่วนการแสดงผล (JSX) - ต้องอยู่ในเครื่องหมายปีกกาของฟังก์ชัน
  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <h2 style={{ color: '#ff4d4d', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
        🛠️ รายการแจ้งซ่อมและจัดการสถานะ
      </h2>
      
      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {repairs.length === 0 ? (
          <p style={{ color: '#888' }}>ไม่มีข้อมูลการแจ้งซ่อม</p>
        ) : (
          repairs.map((task) => (
            <div key={task.id} style={{ 
              background: '#161616', padding: '20px', borderRadius: '15px', border: '1px solid #333' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ background: '#ff4d4d', padding: '3px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {task.device_type}
                    </span>
                    {task.color && (
                      <span style={{ color: '#aaa', fontSize: '0.85rem' }}>🎨 สี: <strong>{task.color}</strong></span>
                    )}
                  </div>

                  <h3 style={{ margin: '0 0 8px 0' }}>{task.brand} {task.device_name}</h3>

                  {task.registration_number && (
                    <div style={{ background: '#222', padding: '5px 15px', borderRadius: '8px', border: '1px solid #444', display: 'inline-block' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>ทะเบียน: <strong>{task.registration_number}</strong></p>
                    </div>
                  )}

                  <p style={{ color: '#ddd', marginTop: '10px' }}><strong>อาการเสีย:</strong> {task.issue}</p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.8rem', color: '#888' }}>สถานะ: <strong style={{ color: '#fbbf24' }}>{task.status}</strong></p>
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
    </div>
  );
} // ปิดฟังก์ชัน AdminDashboard

export default AdminDashboard;