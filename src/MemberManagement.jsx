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

  const handleEditClick = (member) => {
    setEditingId(member.id);
    setEditForm({ fullname: member.fullname, role: member.role });
  };

  const handleUpdate = async (id) => {
    const { error } = await supabase
      .from('profiles')
      .update({ fullname: editForm.fullname, role: editForm.role })
      .eq('id', id);
    
    if (!error) {
      setEditingId(null);
      fetchMembers();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจใช่ไหมที่จะลบสมาชิกท่านนี้?')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchMembers();
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  return (
    <div style={{ padding: '20px', color: '#e0e0e0', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#ff4d4d', marginBottom: '30px' }}>จัดการสมาชิกมืออาชีพ</h2>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {members.map((m) => (
          <div key={m.id} style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            
            {editingId === m.id ? (
              <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                <input 
                  value={editForm.fullname} 
                  onChange={(e) => setEditForm({...editForm, fullname: e.target.value})}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: 'white', flex: 1 }}
                />
                <select 
                  value={editForm.role} 
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: 'white' }}
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="Technician">Technician</option>
                </select>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{m.fullname}</div>
                <div style={{ fontSize: '0.9rem', color: '#888' }}>{m.role} • @{m.username}</div>
              </div>
            )}

            <div style={{ marginLeft: '20px', display: 'flex', gap: '10px' }}>
              {editingId === m.id ? (
                <>
                  <button onClick={() => handleUpdate(m.id)} style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>บันทึก</button>
                  <button onClick={() => setEditingId(null)} style={{ background: '#555', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>ยกเลิก</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEditClick(m)} style={{ background: 'transparent', color: '#3498db', border: '1px solid #3498db', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>แก้ไข</button>
                  <button onClick={() => handleDelete(m.id)} style={{ background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>ลบ</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberManagement;