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
    if (window.confirm('ยืนยันการลบสมาชิกรายนี้?')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchMembers();
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  return (
    <div style={{ padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>รายชื่อสมาชิก</h2>
      {members.map((m) => (
        <div key={m.id} style={{ background: '#222', padding: '15px', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #333' }}>
          {editingId === m.id ? (
            <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
              <input value={editForm.fullname} onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })} style={{ padding: '5px', borderRadius: '4px' }} />
              <button onClick={() => handleUpdate(m.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px' }}>บันทึก</button>
              <button onClick={() => setEditingId(null)} style={{ background: '#555', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px' }}>ยกเลิก</button>
            </div>
          ) : (
            <>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{m.fullname}</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>@{m.username} | {m.role}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setEditingId(m.id); setEditForm({ fullname: m.fullname, role: m.role }); }} style={{ background: 'transparent', color: '#aaa', border: '1px solid #444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>แก้ไข</button>
                <button onClick={() => deleteMember(m.id)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>ลบ</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default MemberManagement;