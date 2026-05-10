import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ fullname: '', role: '' });

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('fullname', { ascending: true });
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setEditForm({ fullname: member.fullname, role: member.role });
  };

  const handleUpdate = async (id) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ fullname: editForm.fullname, role: editForm.role })
        .eq('id', id);
      if (error) throw error;
      setEditingId(null);
      fetchMembers();
      alert('อัปเดตสำเร็จ!');
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteMember = async (id) => {
    if (window.confirm('ยืนยันการลบสมาชิก?')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchMembers();
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2 style={{ borderLeft: '4px solid #ef4444', paddingLeft: '15px', marginBottom: '20px' }}>จัดการสมาชิก</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {members.map((member) => (
          <div key={member.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {editingId === member.id ? (
              <div>
                <input value={editForm.fullname} onChange={(e) => setEditForm({...editForm, fullname: e.target.value})} style={{ background: '#222', color: 'white', marginBottom: '10px', width: '100%' }} />
                <button onClick={() => handleUpdate(member.id)} style={{ background: '#ef4444', color: 'white', marginRight: '10px' }}>บันทึก</button>
                <button onClick={() => setEditingId(null)}>ยกเลิก</button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{member.fullname}</strong>
                  <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>@{member.username} | {member.role}</div>
                </div>
                <div>
                  <button onClick={() => handleEdit(member)} style={{ marginRight: '10px', cursor: 'pointer' }}>แก้ไข</button>
                  <button onClick={() => deleteMember(member.id)} style={{ color: '#ef4444', cursor: 'pointer' }}>ลบ</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberManagement;