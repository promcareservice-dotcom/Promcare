import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const deleteMember = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบสมาชิกท่านนี้?')) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        fetchMembers();
      } catch (error) {
        console.error('Error:', error.message);
      }
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div style={{ padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '300', borderLeft: '4px solid #ef4444', paddingLeft: '15px' }}>
          รายชื่อสมาชิก <span style={{ fontSize: '1rem', color: '#666', marginLeft: '10px' }}>({members.length})</span>
        </h2>
        <button onClick={fetchMembers} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}>
          🔄 รีเฟรช
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>กำลังดึงข้อมูลอย่างละเอียด...</div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {members.length > 0 ? (
            members.map((member) => (
              <div 
                key={member.id} 
                className="glass-card"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '15px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.2s'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '4px' }}>
                    {member.fullname}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>@{member.username}</span>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: member.role === 'Admin' ? '#ef4444' : '#333', 
                      padding: '2px 8px', 
                      borderRadius: '5px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {member.role}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteMember(member.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    transition: '0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#ef4444';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.target.style.color = '#ef4444';
                  }}
                >
                  ลบข้อมูล
                </button>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#444', marginTop: '50px' }}>ไม่พบข้อมูลสมาชิกในระบบ</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberManagement;