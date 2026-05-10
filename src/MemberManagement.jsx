import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลสมาชิก
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles') // ดึงข้อมูลจากตาราง profiles ตามที่คุณตั้งไว้
        .select('*')
        .order('fullname', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันลบสมาชิก
  const deleteMember = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบสมาชิกท่านนี้?')) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchMembers(); // โหลดข้อมูลใหม่หลังจากลบสำเร็จ
      } catch (error) {
        console.error('Error deleting member:', error.message);
      }
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="glass-card" style={{ padding: '30px', minHeight: '100vh', color: 'white' }}>
      <h3 style={{ 
        marginBottom: '20px', 
        borderLeft: '4px solid #ef4444', 
        paddingLeft: '15px',
        fontSize: '1.5rem'
      }}>
        จัดการรายชื่อสมาชิก
      </h3>

      {loading ? (
        <p style={{ color: '#888' }}>กำลังโหลดข้อมูลสมาชิก...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #333', color: '#888' }}>
                <th style={{ padding: '15px' }}>ชื่อ-นามสกุล</th>
                <th style={{ padding: '15px' }}>Username</th>
                <th style={{ padding: '15px' }}>Role</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '15px' }}>{member.fullname}</td>
                    <td style={{ padding: '15px', color: '#ef4444' }}>@{member.username}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '10px',
                        fontSize: '0.7rem',
                        background: member.role === 'Admin' ? '#ef4444' : '#333'
                      }}>
                        {member.role}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <button
                        onClick={() => deleteMember(member.id)}
                        style={{
                          background: 'transparent',
                          color: '#555',
                          border: '1px solid #333',
                          padding: '5px 15px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          transition: '0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.color = '#ef4444'}
                        onMouseOut={(e) => e.target.style.color = '#555'}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#555' }}>
                    ไม่พบข้อมูลสมาชิกในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;