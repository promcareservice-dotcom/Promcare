import React, { useState } from 'react';
import { supabase } from './supabaseClient.js'; 
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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-red-500 text-center">แจ้งซ่อมอุปกรณ์</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="ชื่อผู้แจ้ง" required
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
            onChange={(e) => setFormData({...formData, customer_name: e.target.value})} 
          />
          <input 
            type="text" placeholder="เบอร์โทรศัพท์" required
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
            onChange={(e) => setFormData({...formData, contact_number: e.target.value})} 
          />
          <textarea 
            placeholder="อาการเสีย" required
            className="w-full p-3 h-32 rounded bg-gray-800 border border-gray-700 text-white"
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
          <button 
            type="submit" disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-all"
          >
            {loading ? 'กำลังบันทึก...' : 'ยืนยันการส่งข้อมูล'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestRepair;