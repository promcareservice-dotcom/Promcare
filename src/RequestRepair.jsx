import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function RequestRepair() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    device_name: '',
    brand: '',
    issue: '',
    guest_name: '',
    guest_tel: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    checkUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.device_name || !form.issue) return alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
    if (!user && (!form.guest_name || !form.guest_tel)) return alert("⚠️ กรุณากรอกชื่อและเบอร์โทรติดต่อ");

    setLoading(true);
    const payload = {
      device_name: form.device_name,
      brand: form.brand,
      issue: form.issue,
      status: 'pending',
      member_id: user ? user.id : null, // ใช้ชื่อคอลัมน์ตามตารางของคุณ
      guest_name: user ? null : form.guest_name,
      guest_tel: user ? null : form.guest_tel
    };

    const { error } = await supabase.from('repair_tasks').insert([payload]);

    if (error) {
      alert("❌ เกิดข้อผิดพลาด: " + error.message);
    } else {
      alert("✅ ส่งข้อมูลแจ้งซ่อมเรียบร้อย! เจ้าหน้าที่จะติดต่อกลับครับ");
      navigate('/'); // กลับหน้าแรก
    }
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#ff4d4d', textAlign: 'center' }}>🔧 แจ้งซ่อมด่วน</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          {!user && (
            <div style={guestBox}>
              <p style={{ fontSize: '14px', color: '#888' }}>ข้อมูลติดต่อลูกค้าทั่วไป</p>
              <input 
                placeholder="ชื่อ-นามสกุล" 
                style={inputStyle} 
                onChange={e => setForm({...form, guest_name: e.target.value})} 
              />
              <input 
                placeholder="เบอร์โทรศัพท์" 
                style={inputStyle} 
                onChange={e => setForm({...form, guest_tel: e.target.value})} 
              />
            </div>
          )}
          <input 
            placeholder="ชื่ออุปกรณ์ / รุ่น" 
            style={inputStyle} 
            onChange={e => setForm({...form, device_name: e.target.value})} 
          />
          <input 
            placeholder="ยี่ห้อ" 
            style={inputStyle} 
            onChange={e => setForm({...form, brand: e.target.value})} 
          />
          <textarea 
            placeholder="อาการเสียที่พบ" 
            style={{...inputStyle, height: '100px'}} 
            onChange={e => setForm({...form, issue: e.target.value})} 
          />
          <button type="submit" disabled={loading} style={btnSubmit}>
            {loading ? 'กำลังส่งข้อมูล...' : '🚀 ส่งข้อมูลแจ้งซ่อม'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Styles
const containerStyle = { display: 'flex', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#000', padding: '20px', color: '#fff', fontFamily: 'Kanit' };
const cardStyle = { maxWidth: '500px', width: '100%', background: '#0a0a0a', padding: '30px', borderRadius: '20px', border: '1px solid #222' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' };
const inputStyle = { padding: '12px', background: '#161616', border: '1px solid #333', color: 'white', borderRadius: '10px' };
const guestBox = { display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', background: '#111', borderRadius: '10px', border: '1px dotted #444' };
const btnSubmit = { padding: '15px', background: 'linear-gradient(45deg, #ff4d4d, #b30000)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };

export default RequestRepair;