import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles') // ดึงจากตาราง profiles ที่คุณสร้างไว้
      .select('*')
      .order('fullname', { ascending: true });
    
    if (!error) setMembers(data);
    setLoading(false);
  };

  const deleteMember = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบสมาชิกท่านนี้?')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) fetchMembers();
    }
  };

  return (
    <div className="glass-card" style={{ padding: '30px' }}>
      <h3 style={{ marginBottom: '20px', borderLeft: '4px solid #ef4444', paddingLeft: '15px' }}>
        จัดการรายชื่อสมาชิก
      </h3>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #333', color: '#888' }}>
            <th style={{ padding: '15px' }}>ชื่อ-นามสกุล</th>
            <th style={{ padding: '15px' }}>Username</th>
            <th style={{ padding: '15px' }}>Role</th>
            <th style={{ padding: '15px', textAlign: 'right' }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
              <td style={{ padding: '15px' }}>{member.fullname}</td>
              <td style={{ padding: '15px', color: '#ef4444' }}>@{member.username}</td>
              <td style={{ padding: '15px' }}>
                <span style={{ 
                  padding: '3px 10px', borderRadius: '10px', fontSize: '0.7rem',
                  background: member.role === 'Admin' ? '#ef4444' : '#333'
                }}>
                  {member.role}
                </span>
              </td>
              <td style={{ padding: '15px', textAlign: 'right' }}>
                <button 
                  onClick={() => deleteMember(member.id)}
                  style={{ background: 'transparent', color: '#555', border: '1px solid #333', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberManagement;