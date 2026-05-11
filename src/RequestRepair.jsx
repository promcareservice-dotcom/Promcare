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

  // ตรวจสอบว่าเป็นกลุ่มยานพาหนะหรือไม่
  const isVehicle = ["รถยนต์", "รถจักรยานยนต์", "เครื่องยนต์การเกษตร"].includes(formData.device_type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let publicImageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('repair-images')
          .upload(`requests/${fileName}`, imageFile);

        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('repair-images').getPublicUrl(`requests/${fileName}`);
        publicImageUrl = urlData.publicUrl;
      }

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
          image_url: publicImageUrl,
          status: 'รอดำเนินการ'
        }]);

      if (error) throw error;
      alert('ส่งข้อมูลแจ้งซ่อมเรียบร้อย!');
      navigate('/track-status');
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="max-w-xl mx-auto glass-card p-8 rounded-3xl mt-6 border border-white/10 shadow-2xl">
        <h2 className="text-3xl font-extrabold mb-8 text-red-600 text-center tracking-tighter uppercase">
          Repair Request
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ข้อมูลลูกค้า */}
          <div className="space-y-4">
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">ข้อมูลติดต่อ</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="ชื่อผู้แจ้ง" className="glass-input p-4 rounded-2xl bg-white/5 border border-white/10" required
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
              <input type="text" placeholder="เบอร์โทรศัพท์" className="glass-input p-4 rounded-2xl bg-white/5 border border-white/10" required
                onChange={(e) => setFormData({...formData, contact_number: e.target.value})} />
            </div>
          </div>

          {/* รายละเอียดอุปกรณ์ */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">รายละเอียดอุปกรณ์</p>
            <select className="glass-input w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-red-500 transition-all" required 
              onChange={(e) => setFormData({...formData, device_type: e.target.value})}>
              <option value="" className="bg-black text-white">-- เลือกประเภทอุปกรณ์ --</option>
              {deviceCategories.map(cat => <option key={cat} value={cat} className="bg-black text-white">{cat}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="ยี่ห้อ (Brand)" className="glass-input p-4 rounded-2xl bg-white/5 border border-white/10"
                onChange={(e) => setFormData({...formData, brand: e.target.value})} />
              <input type="text" placeholder="สี (Color)" className="glass-input p-4 rounded-2xl bg-white/5 border border-white/10"
                onChange={(e) => setFormData({...formData, color: e.target.value})} />
            </div>

            <input type="text" placeholder={isVehicle ? "รุ่น / ซีรี่ส์" : "รุ่น / รหัสสินค้า"} className="glass-input w-full p-4 rounded-2xl bg-white/5 border border-white/10"
              onChange={(e) => setFormData({...formData, model: e.target.value})} />

            {/* ช่องทะเบียนจะโผล่มาเฉพาะเมื่อเลือกยานพาหนะ */}
            {isVehicle && (
              <input type="text" placeholder="เลขทะเบียนรถ" className="glass-input w-full p-4 rounded-2xl bg-red-600/10 border border-red-500/50 placeholder:text-red-300/50 animate-pulse"
                onChange={(e) => setFormData({...formData, plate_number: e.target.value})} />
            )}
          </div>

          {/* อาการเสียและการแนบรูป */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <textarea placeholder="ระบุอาการเสีย หรือข้อมูลเพิ่มเติมที่ต้องการให้ช่างทราบ..." className="glass-input w-full h-32 p-4 rounded-2xl bg-white/5 border border-white/10" required
              onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>

            <div className="relative group p-4 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:border-red-500/50 transition-all cursor-pointer">
              <label className="block text-center text-sm text-gray-400 group-hover:text-red-400">
                {imageFile ? `เลือกรูปภาพแล้ว: ${imageFile.name}` : "📸 แนบรูปภาพประกอบ (ถ้ามี)"}
              </label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl bg-red-600 hover:bg-red-700 font-black text-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            {loading ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันการแจ้งซ่อม'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestRepair;