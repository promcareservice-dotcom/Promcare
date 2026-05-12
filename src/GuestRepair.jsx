import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const GuestRepair = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: '', phone: '', device_type: '', brand: '', model: '', description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // บันทึกลงตาราง repair_tasks โดยไม่ต้องมี member_id
    const { error } = await supabase.from('repair_tasks').insert([
      { ...formData, status: 'pending' }
    ]);

    if (error) {
      alert('ผิดพลาด: ' + error.message);
    } else {
      alert('ส่งข้อมูลแจ้งซ่อมสำเร็จ! เจ้าหน้าที่จะติดต่อกลับครับ');
      navigate('/');
    }
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      <h2>📋 ฟอร์มแจ้งซ่อม (สำหรับลูกค้าทั่วไป)</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <input placeholder="ชื่อ-นามสกุล" required onChange={e => setFormData({...formData, customer_name: e.target.value})} style={{ padding: '10px' }} />
        <input placeholder="เบอร์โทรศัพท์" required onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '10px' }} />
        <input placeholder="ประเภทอุปกรณ์" required onChange={e => setFormData({...formData, device_type: e.target.value})} style={{ padding: '10px' }} />
        <textarea placeholder="อาการเสีย" required onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '10px', height: '100px' }} />
        <button type="submit" style={{ backgroundColor: '#ff4d4d', color: '#fff', padding: '15px', border: 'none', cursor: 'pointer' }}>ส่งข้อมูล</button>
        <button type="button" onClick={() => navigate('/')} style={{ backgroundColor: 'transparent', color: '#888', border: 'none' }}>ยกเลิก</button>
      </form>
    </div>
  );
};

export default GuestRepair;