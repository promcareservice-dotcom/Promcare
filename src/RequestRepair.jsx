import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const RequestRepair = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // State สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_number: '',
    device_type: '', // ประเภทอุปกรณ์ (ตัวเลือก)
    brand: '',       // ยี่ห้อ
    model: '',       // รุ่น
    color: '',       // สี
    plate_number: '', // ทะเบียน
    description: ''  // อาการเสีย
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
        .insert([
          { 
            customer_name: formData.customer_name,
            contact_number: formData.contact_number,
            device_type: formData.device_type,
            brand: formData.brand,
            model: formData.model,
            color: formData.color,
            plate_number: formData.plate_number,
            description: formData.description,
            status: 'รอดำเนินการ'
          }
        ]);

      if (error) throw error;
      alert('ส่งข้อมูลแจ้งซ่อมเรียบร้อยแล้ว!');
      navigate('/track-status');
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto glass-card p-8 rounded-2xl">
        <h2 className="text-3xl font-bold mb-6 text-red-600 text-center">แจ้งซ่อมอุปกรณ์</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="ชื่อผู้แจ้ง"
            className="glass-input w-full"
            value={formData.customer_name}
            onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="เบอร์โทรศัพท์"
            className="glass-input w-full"
            value={formData.contact_number}
            onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
            required
          />

          {/* เลือกประเภทอุปกรณ์ */}
          <select 
            className="glass-input w-full"
            value={formData.device_type}
            onChange={(e) => setFormData({...formData, device_type: e.target.value})}
            required
          >
            <option value="">-- เลือกประเภทอุปกรณ์ --</option>
            {deviceCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          {/* ช่องกรอกตามเงื่อนไข */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ยี่ห้อ"
              className="glass-input"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
            />
            <input
              type="text"
              placeholder="สี"
              className="glass-input"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
            />
          </div>

          <input
            type="text"
            placeholder="รุ่น / รายละเอียดเพิ่มเติม"
            className="glass-input w-full"
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
          />

          {/* โชว์ช่องทะเบียนเฉพาะกลุ่มยานพาหนะ */}
          {["รถยนต์", "รถจักรยานยนต์", "เครื่องยนต์การเกษตร"].includes(formData.device_type) && (
            <input
              type="text"
              placeholder="เลขทะเบียน"
              className="glass-input w-full"
              value={formData.plate_number}
              onChange={(e) => setFormData({...formData, plate_number: e.target.value})}
            />
          )}

          <textarea
            placeholder="อาการเสีย / งานที่ต้องการให้ทำ"
            className="glass-input w-full h-32"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 font-bold transition-all transform hover:scale-105"
          >
            {loading ? 'กำลังส่งข้อมูล...' : 'ยืนยันการแจ้งซ่อม'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestRepair;