import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ fullname: '', role: '' });

  const fetchMembers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('fullname');
    setMembers(data || []);
  };

  useEffect(() => { fetchMembers(); }, []);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2 style={{ marginBottom: '20px' }}>จัดการสมาชิก</h2>
      {members.map((m) => (
        <div key={m.id} style={{ background: '#222', padding: '15px', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid #333' }}>
          <div>
            <strong>{m.fullname}</strong>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>@{m.username} | {m.role}</div>
          </div>
          {/* ส่วนของปุ่มที่หายไป */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => alert('ปุ่มแก้ไขทำงาน!')} style={{ cursor: 'pointer' }}>แก้ไข</button>
            <button onClick={() => alert('ปุ่มลบทำงาน!')} style={{ color: 'red', cursor: 'pointer' }}>ลบ</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberManagement;