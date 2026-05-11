import React, { useState } from 'react';
import { supabase } from './supabaseClient.js'; // ใช้ ./ เพราะอยู่ใน src เหมือนกัน
import { useNavigate } from 'react-router-dom';

const RequestRepair = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // ... (ส่วน useState ของ formData เหมือนเดิม)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('repair_tasks')
        .insert([{
          customer_name: formData.customer_name,
          contact_number: formData.contact_number,
          device_type: formData.device_type, 
          brand: formData.brand,
          model: formData.model,
          color: formData.color,
          description: formData.description,
          status: 'รอดำเนินการ'
        }]);

      if (error) throw error;
      alert('บันทึกข้อมูลแจ้งซ่อมสำเร็จ!');
      navigate('/'); 
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (ส่วน return JSX ของคุณ)
};

export default RequestRepair;