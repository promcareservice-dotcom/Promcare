import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const RequestRepair = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let publicImageUrl = null;

      // 1. ถ้ามีการเลือกรูป ให้เอาขึ้น Storage ก่อน
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `requests/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('repair-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('repair-images')
          .getPublicUrl(filePath);
        
        publicImageUrl = urlData.publicUrl;
      }

      // 2. ส่งข้อมูลเข้า Database (ไม่มี device_name แล้ว)
      const { error } = await supabase
        .from('repair_tasks')
        .insert([{
          customer_name: formData.customer_name,
          contact_number: formData.contact_number,
          device_type: formData.device_type,
          brand: formData.brand,
          model: formData.model,
          color: formData.color,
          plate_number: formData.plate_number,
          description: formData.description,
          image_url: publicImageUrl, // เก็บลิงก์รูป
          status: 'รอดำเนินการ'
        }]);

      if (error) throw error;
      alert('แจ้งซ่อมและอัปโหลดรูปสำเร็จ!');
      navigate('/track-status');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-lg mx-auto glass-card p-6 md:p-8 rounded-2xl mt-5">
        <h2 className="text-2xl font-bold mb-6 text-red-600 text-center uppercase">Request Service</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="ชื่อผู้แจ้ง" className="glass-input w-full" required
            onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
          
          <input type="text" placeholder="เบอร์โทรติดต่อ" className="glass-input w-full" required
            onChange={(e) => setFormData({...formData, contact_number: e.target.value})} />

          <select className="glass-input w-full" required onChange={(e) => setFormData({...formData, device_type: e.target.value})}>
            <option value="">-- เลือกประเภทอุปกรณ์ --</option>
            {deviceCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="ยี่ห้อ" className="glass-input" onChange={(e) => setFormData({...formData, brand: e.target.value})} />
            <input type="text" placeholder="สี" className="glass-input" onChange={(e) => setFormData({...formData, color: e.target.value})} />
          </div>

          {["รถยนต์", "รถจักรยานยนต์", "เครื่องยนต์การเกษตร"].includes(formData.device_type) && (
            <input type="text" placeholder="เลขทะเบียน" className="glass-input w-full" onChange={(e) => setFormData({...formData, plate_number: e.target.value})} />
          )}

          <textarea placeholder="อาการเสีย..." className="glass-input w-full h-24" required
            onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>

          {/* ส่วนอัปโหลดรูปภาพ */}
          <div className="bg-white/5 p-4 rounded-xl border border-dashed border-red-500/30">
            <label className="block text-sm mb-2 text-gray-400">แนบรูปภาพอุปกรณ์ (ถ้ามี)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-red-600 file:text-white hover:file:bg-red-700" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 font-bold transition-all">
            {loading ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันการแจ้งซ่อม'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestRepair;