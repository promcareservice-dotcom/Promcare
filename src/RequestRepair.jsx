import React, { useState } from 'react';
import { supabase } from './supabaseClient.js'; // เรียกไฟล์ที่อยู่ข้างๆ กัน
import { useNavigate } from 'react-router-dom';

const RequestRepair = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ customer_name: '', contact_number: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('repair_tasks').insert([formData]);
      if (error) throw error;
      alert('✅ ส่งข้อมูลสำเร็จ!');
      navigate('/');
    } catch (err) {
      alert('❌ เชื่อมต่อไม่ได้: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', background: '#111', padding: '30px', borderRadius: '15px', border: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center', color: '#ff4d4d' }}>ฟอร์มแจ้งซ่อมอุปกรณ์</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <input placeholder="ชื่อผู้แจ้ง" required style={{ padding: '12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px' }}
            onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
          <input placeholder="เบอร์โทรศัพท์" required style={{ padding: '12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px' }}
            onChange={(e) => setFormData({...formData, contact_number: e.target.value})} />
          <textarea placeholder="รายละเอียดอาการเสีย" required style={{ padding: '12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px', minHeight: '100px' }}
            onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <button type="submit" disabled={loading} style={{ padding: '15px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันการแจ้งซ่อม'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestRepair;