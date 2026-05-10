import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AdminDashboard = () => {
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
      alert('อัปเดตข้อมูลสำเร็จ!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจว่าต้องการลบสมาชิกรายนี้?')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchMembers();
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
      <h2 style={{ color: '#ff4d4d', borderBottom: '2px solid #222', paddingBottom: '10px' }}>จัดการสมาชิก (Admin)</h2>
      
      <div style={{ marginTop: '20px' }}>
        {members.map((m) => (
          <div key={m.id} style={{ background: '#111', padding: '15px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #333' }}>
            
            {editingId === m.id ? (
              <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                <input 
                  value={editForm.fullname} 
                  onChange={(e) => setEditForm({...editForm, fullname: e.target.value})}
                  style={{ padding: '8px', borderRadius: '5px', border: '1px solid #444', background: '#222', color: '#fff', flex: 1 }}
                />
                <select 
                  value={editForm.role} 
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  style={{ padding: '8px', borderRadius: '5px', border: '1px solid #444', background: '#222', color: '#fff' }}
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="Technician">Technician</option>
                </select>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{m.fullname}</div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>@{m.username} | <span style={{color: '#3498db'}}>{m.role}</span></div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
              {editingId === m.id ? (
                <>
                  <button onClick={() => handleUpdate(m.id)} style={{ backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>บันทึก</button>
                  <button onClick={() => setEditingId(null)} style={{ backgroundColor: '#555', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>ยกเลิก</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEditClick(m)} style={{ backgroundColor: 'transparent', color: '#3498db', border: '1px solid #3498db', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer' }}>แก้ไข</button>
                  <button onClick={() => handleDelete(m.id)} style={{ backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer' }}>ลบ</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;