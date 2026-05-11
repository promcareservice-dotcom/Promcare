// ส่วนบนของไฟล์ RequestRepair.jsx ต้อง import แบบนี้
import { supabase } from './supabaseClient.js';

// ภายในฟังก์ชัน handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // ใช้คำสั่ง insert ที่ตรงกับคอลัมน์ใน Supabase เป๊ะๆ
    const { error } = await supabase
      .from('repair_tasks')
      .insert([{
        customer_name: formData.customer_name,
        contact_number: formData.contact_number,
        device_type: formData.device_type, // ใช้ชื่อนี้ตามตารางที่สร้างใหม่
        brand: formData.brand,
        model: formData.model,
        color: formData.color,
        plate_number: isVehicle ? formData.plate_number : null,
        description: formData.description,
        status: 'รอดำเนินการ'
      }]);

    if (error) throw error;
    alert('บันทึกสำเร็จ! ข้อมูลไปอยู่ที่ Supabase แล้ว');
    navigate('/'); 
  } catch (err) {
    alert('ยังติดปัญหา: ' + err.message);
  } finally {
    setLoading(false);
  }
};