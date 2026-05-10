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
        .order('updated_at', { ascending: false }); // เรียงตามการอัปเดตล่าสุด

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
        .update({ 
          fullname: editForm.fullname, 
          role: editForm.role,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      fetchMembers();
      alert('อัปเดตข้อมูลสำเร็จ');
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const deleteMember = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบสมาชิกท่านนี้? ประวัติจะหายถาวร')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchMembers();
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  return (
    <div style={{ padding: '20px', color: 'white', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h2 style={{ borderLeft: '4px solid #ef4444', paddingLeft: '15px' }}>จัดการสมาชิก & ประวัติ</h2>
        <button onClick={fetchMembers} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>🔄 ซิงค์ข้อมูล</button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {members.map((member) => (
          <div key={member.id} style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)' 
          }}>
            {editingId === member.id ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                <input 
                  value={editForm.fullname} 
                  onChange={(e) => setEditForm({...editForm, fullname: e.target.value})}
                  style={{ background: '#222', color: 'white', padding: '8px', border: '1px solid #ef4444' }}
                />
                <select 
                  value={editForm.role} 
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  style={{ background: '#222', color: 'white', padding: '8px' }}
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleUpdate(member.id)} style={{ background: '#ef4444', color: 'white', padding: '5px 15px', border: 'none' }}>บันทึก</button>
                  <button onClick={() => setEditingId(null)} style={{ background: '#444', color: 'white', padding: '5px 15px', border: 'none' }}>ยกเลิก</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{member.fullname}</div>
                  <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>@{member.username} | สิทธิ์: {member.role}</div>
                  <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '5px' }}>
                    แก้ไขล่าสุด:  {member.updated_at ? new Date(member.updated_at).toLocaleString('th-TH') : 'ไม่มีประวัติ'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleEdit(member)} style={{ color: '#aaa', background: 'none', border: '1px solid #444', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>แก้ไข</button>
                  <button onClick={() => deleteMember(member.id)} style={{ color: '#ef4444', background: 'none', border: '1px solid #ef4444', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>ลบ</button>
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