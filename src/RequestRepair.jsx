import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const RequestRepair = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_number: '',
    device_type: '',
    brand: '',
    model: '',
    color: '',
    plate_number: '',
    description: ''
  });

  const deviceCategories = ["รถยนต์", "รถจักรยานยนต์", "เครื่องยนต์การเกษตร", "เครื่องตัดหญ้า", "แอร์", "ทีวี", "ตู้เย็น", "พัดลม"];

  // ตรวจสอบว่าเป็นกลุ่มยานพาหนะหรือไม่ เพื่อเปิดช่องทะเบียน
  const isVehicle = ["รถยนต์", "รถจักรยานยนต์", "เครื่องยนต์การเกษตร"].includes(formData.device_type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ส่งข้อมูลเข้า Database (ข้ามขั้นตอนรูปภาพไปก่อนเพื่อเช็คระบบหลัก)
      const { error } = await supabase
        .from('repair_tasks')
        .insert([{
          customer_name: formData.customer_name,
          contact_number: formData.contact_number,
          device_type: formData.device_type,
          brand: formData.brand,
          model: formData.model,
          color: formData.color,
          plate_number: isVehicle ? formData.plate_number : null,
          description: formData.description,
          status: 'รอดำเนินการ'
        }]);

      if (error) throw error;

      alert('บันทึกข้อมูลแจ้งซ่อมสำเร็จ!');
      navigate('/'); // ส่งกลับไปหน้าแรก หรือหน้าติดตามสถานะ
    } catch (err) {
      console.error('Error details:', err);
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="max-w-xl mx-auto glass-card p-8 rounded-3xl mt-6 border border-white/10 shadow-2xl" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
        <h2 className="text-3xl font-extrabold mb-8 text-red-600 text-center uppercase tracking-widest">
          Repair Request
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="ชื่อผู้แจ้ง" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-red-500 outline-none transition-all" required
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
              <input type="text" placeholder="เบอร์โทรศัพท์" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-red-500 outline-none transition-all" required
                onChange={(e) => setFormData({...formData, contact_number: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <select className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 focus:border-red-500 outline-none transition-all" required 
              onChange={(e) => setFormData({...formData, device_type: e.target.value})}>
              <option value="" className="bg-black text-white">-- เลือกประเภทอุปกรณ์ --</option>
              {deviceCategories.map(cat => <option key={cat} value={cat} className="bg-black text-white">{cat}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="ยี่ห้อ" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10"
                onChange={(e) => setFormData({...formData, brand: e.target.value})} />
              <input type="text" placeholder="สี" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10"
                onChange={(e) => setFormData({...formData, color: e.target.value})} />
            </div>

            <input type="text" placeholder="รุ่น / รายละเอียด" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10"
              onChange={(e) => setFormData({...formData, model: e.target.value})} />

            {isVehicle && (
              <input type="text" placeholder="เลขทะเบียนรถ" className="w-full p-4 rounded-2xl bg-red-600/20 border border-red-500/50"
                onChange={(e) => setFormData({...formData, plate_number: e.target.value})} />
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <textarea placeholder="ระบุอาการเสีย..." className="w-full h-32 p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-red-500" required
              onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl bg-red-600 hover:bg-red-700 font-black text-xl transition-all active:scale-95 shadow-lg shadow-red-600/20">
            {loading ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันการแจ้งซ่อม'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestRepair;