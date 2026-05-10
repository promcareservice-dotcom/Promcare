import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ fullname: '', role: '' });
  
  // ฟอร์มสำหรับเพิ่มสมาชิกใหม่
  const [newMember, setNewMember] = useState({ fullname: '', username: '', role: 'User' });

  const fetchMembers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('fullname');
    setMembers(data || []);
  };

  // ฟังก์ชันเพิ่มสมาชิกใหม่
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.fullname || !newMember.username) return alert('กรุณากรอกข้อมูลให้ครบ');
    
    const { error } = await supabase.from('profiles').insert([newMember]);
    
    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      alert('เพิ่มสมาชิกเรียบร้อย!');
      setNewMember({ fullname: '', username: '', role: 'User' }); // ล้างฟอร์ม
      fetchMembers(); // โหลดรายการใหม่
    }
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
    if (window.confirm('ยืนยันการลบสมาชิก?')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchMembers();
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  return (
    <div style={{ padding: '30px', backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ color: '#ff4d4d', marginBottom: '25px', borderBottom: '2px solid #222', paddingBottom: '10px' }}>
          ⚙️ ระบบจัดการสมาชิก (Admin)
        </h2>

        {/* --- ส่วนฟอร์มเพิ่มสมาชิกใหม่ --- */}
        <div style={{ background: '#161616', padding: '20px', borderRadius: '15px', border: '1px solid #ff4d4d', marginBottom: '30px' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem', color: '#ff4d4d' }}>➕ เพิ่มสมาชิกใหม่</h3>
          <form onSubmit={handleAddMember} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px', gap: '10px' }}>
            <input 
              placeholder="ชื่อ-นามสกุล"
              value={newMember.fullname}
              onChange={(e) => setNewMember({...newMember, fullname: e.target.value})}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff' }}
            />
            <input 
              placeholder="Username"
              value={newMember.username}
              onChange={(e) => setNewMember({...newMember, username: e.target.value})}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff' }}
            />
            <select 
              value={newMember.role}
              onChange={(e) => setNewMember({...newMember, role: e.target.value})}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff' }}
            >
              <option value="User">User</option>
              <option value="Technician">Technician</option>
              <option value="Admin">Admin</option>
            </select>
            <button type="submit" style={{ background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>เพิ่ม</button>
          </form>
        </div>

        {/* --- ส่วนรายชื่อสมาชิก --- */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {members.map((m) => (
            <div key={m.id} style={{ background: '#1a1a1a', padding: '15px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #333' }}>
              {editingId === m.id ? (
                <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                  <input 
                    value={editForm.fullname} 
                    onChange={(e) => setEditForm({...editForm, fullname: e.target.value})}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff', flex: 1 }}
                  />
                  <select 
                    value={editForm.role} 
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff' }}
                  >
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="Technician">Technician</option>
                  </select>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 'bold' }}>{m.fullname}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>@{m.username} | <span style={{color: '#3498db'}}>{m.role}</span></div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
                {editingId === m.id ? (
                  <>
                    <button onClick={() => handleUpdate(m.id)} style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>บันทึก</button>
                    <button onClick={() => setEditingId(null)} style={{ background: '#555', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>ยกเลิก</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditingId(m.id); setEditForm({fullname: m.fullname, role: m.role}); }} style={{ background: 'transparent', color: '#3498db', border: '1px solid #3498db', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>แก้ไข</button>
                    <button onClick={() => handleDelete(m.id)} style={{ background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>ลบ</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;