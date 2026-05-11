import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function TrackStatus() {
  const [tel, setTel] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!tel) return alert("กรุณากรอกเบอร์โทรครับ");
    setLoading(true);
    
    // ค้นหาทั้งจาก guest_tel และจากเบอร์ใน profiles (กรณีเป็นสมาชิก)
    const { data, error } = await supabase
      .from('repair_tasks')
      .select('*')
      .or(`guest_tel.eq.${tel},member_id.in.(select id from profiles where tel='${tel}')`)
      .order('created_at', { ascending: false });

    if (data) setTasks(data);
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#ff4d4d', textAlign: 'center' }}>🔍 ติดตามสถานะงานซ่อม</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <input 
            placeholder="กรอกเบอร์โทรศัพท์" 
            style={inputStyle} 
            onChange={e => setTel(e.target.value)} 
          />
          <button onClick={handleSearch} style={btnSearch}>ค้นหา</button>
        </div>

        {loading ? <p>กำลังค้นหา...</p> : (
          tasks.map(task => (
            <div key={task.id} style={itemCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{task.device_name}</strong>
                <span style={badge(task.status)}>{task.status}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#888' }}>{task.issue}</p>
              {task.price > 0 && <p style={{ color: '#4ade80' }}>ค่าซ่อม: ฿{task.price}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const btnSearch = { padding: '10px 20px', background: '#ff4d4d', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer' };
const itemCard = { padding: '15px', background: '#111', border: '1px solid #222', borderRadius: '12px', marginBottom: '10px' };
const badge = (s) => ({ fontSize: '11px', padding: '3px 8px', borderRadius: '10px', background: s === 'done' ? '#4ade80' : '#fbbf24', color: '#000' });
// (Style อื่นๆ ใช้เหมือน RequestRepair)

export default TrackStatus;