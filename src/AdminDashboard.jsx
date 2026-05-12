import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับ Modal แก้ไข
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (data) {
      const roleOrder = { admin: 1, technician: 2, customer: 3 };
      const sortedData = data.sort((a, b) => 
        (roleOrder[a.role?.toLowerCase()] || 99) - (roleOrder[b.role?.toLowerCase()] || 99)
      );
      setMembers(sortedData);
    }
    setLoading(false);
  };

  // เปิด Modal เพื่อดู/แก้ไข
  const openEditModal = (member) => {
    setSelectedMember({ ...member });
    setIsModalOpen(true);
  };

  // อัปเดตข้อมูลสมาชิก
  const handleUpdateMember = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: selectedMember.full_name,
        phone: selectedMember.phone,
        line_id: selectedMember.line_id,
        address: selectedMember.address,
        role: selectedMember.role
      })
      .eq('id', selectedMember.id);

    if (error) {
      alert('ไม่สามารถอัปเดตได้: ' + error.message);
    } else {
      alert('อัปเดตข้อมูลสำเร็จ!');
      setIsModalOpen(false);
      fetchMembers(); // โหลดข้อมูลใหม่
    }
  };

  const deleteMember = async (id, name) => {
    if (window.confirm(`ยืนยันการลบสมาชิก: ${name}?`)) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchMembers();
    }
  };

  const styles = {
    sectionBox: { backgroundColor: '#111', borderRadius: '15px', padding: '25px', border: '1px solid #222' },
    title: { color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', color: '#fff', padding: '12px', borderBottom: '1px solid #333' },
    td: { padding: '15px 12px', borderBottom: '1px solid #222', color: '#fff' },
    nameLink: { color: '#fff', cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '15px', width: '400px', border: '1px solid #333' },
    input: { width: '100%', padding: '10px', marginBottom: '15px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '5px' },
    saveBtn: { width: '100%', padding: '12px', backgroundColor: '#d92b2b', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    cancelBtn: { width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#888', border: 'none', cursor: 'pointer', marginTop: '10px' }
  };

  return (
    <div style={styles.sectionBox}>
      <h3 style={styles.title}>👥 รายชื่อสมาชิกในระบบ</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ชื่อ</th>
            <th style={styles.th}>เบอร์ติดต่อ</th>
            <th style={styles.th}>บทบาท</th>
            <th style={{ ...styles.th, textAlign: 'center' }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td style={styles.td}>
                <span style={styles.nameLink} onClick={() => openEditModal(m)}>{m.full_name}</span>
              </td>
              <td style={styles.td}>{m.phone || '-'}</td>
              <td style={styles.td}>
                <span style={{ color: m.role === 'admin' ? '#ff4d4d' : '#fff', marginRight: '8px' }}>●</span>
                {m.role === 'admin' ? 'Admin' : m.role === 'technician' ? 'ช่าง' : 'ลูกค้า'}
              </td>
              <td style={{ ...styles.td, textAlign: 'center' }}>
                <span style={{ color: '#4d94ff', cursor: 'pointer', marginRight: '15px' }} onClick={() => openEditModal(m)}>แก้ไข</span>
                <span style={{ color: '#ff4d4d', cursor: 'pointer' }} onClick={() => deleteMember(m.id, m.full_name)}>ลบ</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- Modal หน้าต่างแก้ไขข้อมูล --- */}
      {isModalOpen && selectedMember && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#ff4d4d', marginTop: 0 }}>📝 แก้ไขข้อมูลสมาชิก</h3>
            <label style={{ fontSize: '12px', color: '#888' }}>ชื่อ-นามสกุล</label>
            <input 
              style={styles.input} 
              value={selectedMember.full_name} 
              onChange={(e) => setSelectedMember({...selectedMember, full_name: e.target.value})} 
            />
            
            <label style={{ fontSize: '12px', color: '#888' }}>เบอร์ติดต่อ</label>
            <input 
              style={styles.input} 
              value={selectedMember.phone} 
              onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})} 
            />

            <label style={{ fontSize: '12px', color: '#888' }}>ที่อยู่</label>
            <textarea 
              style={{ ...styles.input, height: '60px', fontFamily: 'inherit' }} 
              value={selectedMember.address} 
              onChange={(e) => setSelectedMember({...selectedMember, address: e.target.value})} 
            />

            <label style={{ fontSize: '12px', color: '#888' }}>บทบาท</label>
            <select 
              style={styles.input} 
              value={selectedMember.role} 
              onChange={(e) => setSelectedMember({...selectedMember, role: e.target.value})}
            >
              <option value="customer">ลูกค้า (Customer)</option>
              <option value="technician">ช่าง (Technician)</option>
              <option value="admin">แอดมิน (Admin)</option>
            </select>

            <button style={styles.saveBtn} onClick={handleUpdateMember}>อัปเดตข้อมูล</button>
            <button style={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;