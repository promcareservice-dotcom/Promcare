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

  const handleUpdate = async (id) => {
    await supabase.from('profiles').update({ fullname: editForm.fullname, role: editForm.role }).eq('id', id);
    setEditingId(null);
    fetchMembers();
  };

  const deleteMember = async (id) => {
    if (window.confirm('ลบสมาชิกรายนี้?')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchMembers();
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2>รายชื่อสมาชิก</h2>
      {members.map(m => (
        <div key={m.id} style={{ background: '#222', padding: '15px', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
          {editingId === m.id ? (
            <input value={editForm.fullname} onChange={e => setEditForm({...editForm, fullname: e.target.value})} />
          ) : (
            <div>{m.fullname} ({m.role})</div>
          )}
          <div>
            {editingId === m.id ? (
              <button onClick={() => handleUpdate(m.id)}>บันทึก</button>
            ) : (
              <button onClick={() => { setEditingId(m.id); setEditForm({fullname: m.fullname, role: m.role}); }}>แก้ไข</button>
            )}
            <button onClick={() => deleteMember(m.id)} style={{ color: 'red', marginLeft: '10px' }}>ลบ</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberManagement;