import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const CustomerRepair = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    device_type: '', brand: '', model: '', license_plate: '', color: '', description: ''
  });

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    };
    getProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('repair_tasks').insert([
      { 
        ...formData, 
        customer_name: profile.full_name, // ดึงจากโปรไฟล์อัตโนมัติ
        phone: profile.phone,           // ดึงจากโปรไฟล์อัตโนมัติ
        status: 'pending' 
      }
    ]);

    if (!error) {
      alert('ส่งข้อมูลแจ้งซ่อมสำเร็จ!');
      navigate('/member-dashboard'); // ส่งกลับหน้าติดตามงานทันที
    }
  };

  // ... (ใช้ Styles เดียวกับ GuestRepair ได้เลยครับ)
  return (
    // ... ฟอร์มที่เหลือจะเหมือน GuestRepair แต่ไม่ต้องมีช่องกรอกชื่อและเบอร์โทร
  );
};