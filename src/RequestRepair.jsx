import React, { useState } from 'react';
import { supabase } from './supabaseClient.js'; // ใช้ ./ เพราะอยู่ใน src เหมือนกัน
import { useNavigate } from 'react-router-dom';

const RequestRepair = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_number: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('repair_tasks')
        .insert([{
          ...formData,
          status: 'รอดำเนินการ',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      alert('✅ บันทึกข้อมูลสำเร็จ! เจ้าหน้าที่จะติดต่อกลับโดยเร็ว');
      navigate('/');
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '40px 20px', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '450px', margin: '0 auto', backgroundColor: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
        <h2 style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '25px' }}>ฟอร์มแจ้งซ่อมอุปกรณ์</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label>ชื่อผู้แจ้ง:</label>
          <input type="text" required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#222', color: '#fff' }}
            onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
          
          <label>เบอร์โทรศัพท์:</label>
          <input type="text" required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#222', color: '#fff' }}
            onChange={(e) => setFormData({...formData, contact_number: e.target.value})} />
          
          <label>รายละเอียดอาการเสีย:</label>
          <textarea required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', minHeight: '100px' }}
            onChange={(e) => setFormData({...formData, description: e.target.value})} />
          
          <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '12px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลแจ้งซ่อม'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestRepair;