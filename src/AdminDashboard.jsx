import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ fullname: '', role: '', phone: '', line_id: '', address: '' });
  
  const [newMember, setNewMember] = useState({ 
    fullname: '', 
    username: '', 
    role: 'ลูกค้า', 
    phone: '', 
    line_id: '', 
    address: '' 
  });

  const fetchMembers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('fullname');
    setMembers(data || []);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.fullname || !newMember.username) return alert('กรุณากรอกชื่อ-นามสกุล และชื่อผู้ใช้งาน');
    
    const { error } = await supabase.from('profiles').insert([newMember]);
    
    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      alert('เพิ่มสมาชิกใหม่สำเร็จ!');
      setNewMember({ fullname: '', username: '', role: 'ลูกค้า', phone: '', line_id: '', address: '' });
      fetchMembers();
    }
  };

  const handleUpdate = async (id) => {
    const { error } = await supabase.from('profiles').update(editForm).eq('id', id);
    if (!error) {
      setEditingId(null);
      fetchMembers();
      alert('บันทึกการเปลี่ยนแปลงเรียบร้อย');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบข้อมูลสมาชิกรายนี้ใช่หรือไม่?')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchMembers();
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  return (
    <div style={{ padding: '30px', backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ color: '#ff4d4d', marginBottom: '25px', borderBottom: '2px solid #222', paddingBottom: '10px' }}>
          👥 ระบบจัดการข้อมูลสมาชิกและลูกค้า
        </h2>

        {/* --- ส่วนฟอร์มเพิ่มสมาชิกใหม่ (ภาษาไทย) --- */}
        <div style={{ background: '#161616', padding: '25px', borderRadius: '15px', border: '1px solid #333', marginBottom: '30px' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.2rem', color: '#ff4d4d', marginBottom: '20px' }}>➕ ลงทะเบียนสมาชิกใหม่</h3>
          <form onSubmit={handleAddMember} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#888' }}>ชื่อ-นามสกุล</label>
              <input 
                placeholder="ระบุชื่อและนามสกุล"
                value={newMember.fullname}
                onChange={(e) => setNewMember({...newMember, fullname: e.target.value})}
                style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#888' }}>ชื่อผู้ใช้งาน (Username)</label>
              <input 
                placeholder="ระบุชื่อผู้ใช้งานสำหรับเข้าระบบ"
                value={newMember.username}
                onChange={(e) => setNewMember({...newMember, username: e.target.value})}
                style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#888' }}>เบอร์โทรศัพท์</label>
              <input 
                placeholder="ระบุเบอร์โทรศัพท์ 10 หลัก"
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#888' }}>ไอดีไลน์ (Line ID)</label>
              <input 
                placeholder="ระบุไอดีไลน์เพื่อการติดต่อ"
                value={newMember.line_id}
                onChange={(e) => setNewMember({...newMember, line_id: e.target.value})}
                style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#888' }}>สถานะ/ระดับผู้ใช้งาน</label>
              <select 
                value={newMember.role}
                onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', boxSizing: 'border-box' }}
              >
                <option value="ลูกค้า">ลูกค้า</option>
                <option value="ช่าง">ช่าง</option>
                <option value="แอดมิน">แอดมิน</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#888' }}>ที่อยู่ติดต่อ</label>
              <input 
                placeholder="ระบุที่อยู่ปัจจุบัน"
                value={newMember.address}
                onChange={(e) => setNewMember({...newMember, address: e.target.value})}
                style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" style={{ gridColumn: 'span 2', background: '#ff4d4d', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}>
              ➕ บันทึกรายชื่อสมาชิกใหม่
            </button>
          </form>
        </div>

        {/* --- รายชื่อสมาชิกที่บันทึกแล้ว --- */}
        <div style={{ display: 'grid', gap: '15px' }}>
          {members.map((m) => (
            <div key={m.id} style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
              {editingId === m.id ? (
                /* โหมดแก้ไข */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input value={editForm.fullname} onChange={(e) => setEditForm({...editForm, fullname: e.target.value})} style={{padding:'10px', background:'#222', color:'#fff', border:'1px solid #444', borderRadius:'8px'}} />
                  <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} style={{padding:'10px', background:'#222', color:'#fff', border:'1px solid #444', borderRadius:'8px'}}>
                    <option value="ลูกค้า">ลูกค้า</option>
                    <option value="ช่าง">ช่าง</option>
                    <option value="แอดมิน">แอดมิน</option>
                  </select>
                  <input placeholder="เบอร์โทร" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} style={{padding:'10px', background:'#222', color:'#fff', border:'1px solid #444', borderRadius:'8px'}} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleUpdate(m.id)} style={{flex: 1, background:'#2ecc71', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer'}}>บันทึก</button>
                    <button onClick={() => setEditingId(null)} style={{flex: 1, background:'#555', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer'}}>ยกเลิก</button>
                  </div>
                </div>
              ) : (
                /* โหมดแสดงผล */
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {m.fullname} 
                      <span style={{ fontSize: '0.8rem', padding: '3px 8px', backgroundColor: m.role === 'แอดมิน' ? '#ff4d4d' : m.role === 'ช่าง' ? '#3498db' : '#555', borderRadius: '5px', marginLeft: '10px' }}>
                        {m.role}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#aaa', marginTop: '8px' }}>
                      📞 โทร: {m.phone || 'ไม่ระบุ'} | 📱 Line: {m.line_id || 'ไม่ระบุ'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#777', marginTop: '5px' }}>📍 ที่อยู่: {m.address || 'ไม่มีข้อมูลที่อยู่'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => {setEditingId(m.id); setEditForm(m);}} style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', border: '1px solid #3498db', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>แก้ไข</button>
                    <button onClick={() => handleDelete(m.id)} style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: '1px solid #e74c3c', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>ลบ</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;