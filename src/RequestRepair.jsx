import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // ตรวจสอบ Path ให้ถูกต้อง

const RepairRequest = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    registration_number: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // 1. ตรวจสอบสถานะว่าผู้ใช้ล็อกอินอยู่หรือไม่ (ว่าเป็น Member หรือไม่)
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 2. เตรียมโครงสร้างข้อมูลพื้นฐาน (Common Fields)
      const repairPayload = {
        description: formData.description,
        registration_number: formData.registration_number, // ตาม image_0a6cda.png
        status: 'pending', // สถานะเริ่มต้น ตาม image_0a7002.png
        created_at: new Date().toISOString(),
      };

      // 3. แยกเงื่อนไขการส่งข้อมูลระหว่าง Member และ Guest
      if (user) {
        // กรณีเป็นสมาชิก (Member)
        repairPayload.phone = formData.contact_number; // ส่งเข้าคอลัมน์ phone
        repairPayload.member_id = user.id;            // เก็บ ID สมาชิก ตาม image_0a703f.png
        repairPayload.member_name = formData.name;      // (ถ้ามีคอลัมน์นี้)
      } else {
        // กรณีเป็นบุคคลทั่วไป (Guest)
        repairPayload.guest_tel = formData.contact_number; // ส่งเข้าคอลัมน์ guest_tel
        repairPayload.guest_name = formData.name;          // ส่งเข้าคอลัมน์ guest_name ตาม image_0a6c79.png
      }

      // 4. ส่งข้อมูลไปยัง Supabase
      const { error } = await supabase
        .from('repair_tasks')
        .insert([repairPayload]);

      if (error) throw error;

      alert('ส่งข้อมูลแจ้งซ่อมสำเร็จ!');
      // ล้างฟอร์มหลังส่งสำเร็จ
      setFormData({ name: '', contact_number: '', registration_number: '', description: '' });

    } catch (error) {
      console.error('Error:', error.message);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="repair-form-container">
      <h2>แจ้งซ่อมอุปกรณ์</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="ชื่อผู้แจ้ง"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="contact_number"
          placeholder="เบอร์โทรศัพท์"
          value={formData.contact_number}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="registration_number"
          placeholder="เลขทะเบียน / หมายเลขเครื่อง"
          value={formData.registration_number}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="รายละเอียดอาการเสีย"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'กำลังบันทึก...' : 'ยืนยันการแจ้งซ่อม'}
        </button>
      </form>
    </div>
  );
};

export default RepairRequest;