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

  const deviceCategories = [
    "รถยนต์", "รถจักรยานยนต์", "เครื่องยนต์การเกษตร", "เครื่องตัดหญ้า", 
    "แอร์", "ทีวี", "ตู้เย็น", "พัดลม"
  ];

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
          plate_number: formData.plate_number,
          description: formData.description,
          status: 'รอดำเนินการ',
          created_at: new Date()
        }]);

      if (error) throw error;
      alert('บันทึกข้อมูลแจ้งซ่อมสำเร็จ!');
      navigate('/track-status');
    } catch (error) {
      console.error('Error:', error);
      alert('ส่งข้อมูลไม่ได้: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-lg mx-auto glass-card p-6 md:p-8 rounded-2xl mt-10">
        <h2 className="text-2xl font-bold mb-6 text-red-600 text-center uppercase tracking-widest">
          Request Repair Service
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ชื่อผู้แจ้ง"
              className="glass-input"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="เบอร์โทรติดต่อ"
              className="glass-input"
              value={formData.contact_number}
              onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
              required
            />
          </div>

          <select 
            className="glass-input w-full"
            value={formData.device_type}
            onChange={(e) => setFormData({...formData, device_type: e.target.value})}
            required
          >
            <option value="">-- เลือกประเภทอุปกรณ์ --</option>
            {deviceCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ยี่ห้อ (Brand)"
              className="glass-input"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
            />
            <input
              type="text"
              placeholder="สี (Color)"
              className="glass-input"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
            />
          </div>

          <input
            type="text"
            placeholder="รุ่น / รหัสสินค้า (Model)"
            className="glass-input w-full"
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
          />

          {/* เงื่อนไข: ถ้าเลือกยานพาหนะ ให้กรอกทะเบียน */}
          {["รถยนต์", "รถจักรยานยนต์", "เครื่องยนต์การเกษตร"].includes(formData.device_type) && (
            <input
              type="text"
              placeholder="เลขทะเบียนรถ"
              className="glass-input w-full border-red-500/50"
              value={formData.plate_number}
              onChange={(e) => setFormData({...formData, plate_number: e.target.value})}
            />
          )}

          <textarea
            placeholder="ระบุอาการเสีย หรือข้อมูลเพิ่มเติม..."
            className="glass-input w-full h-24"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 font-bold transition-all active:scale-95 shadow-lg shadow-red-600/20"
          >
            {loading ? 'Processing...' : 'CONFIRM REQUEST'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestRepair;