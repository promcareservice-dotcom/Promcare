import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AdminDashboard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [filterStatus, setFilterStatus] = useState('all');
  const [priceInput, setPriceInput] = useState({});

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('repair_tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setTasks(data);
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('fullname', { ascending: true });
    if (!error) setMembers(data);
  };

  const updateStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'success' : 'pending';
    const priceValue = priceInput[taskId] || 0;
    const { error } = await supabase.from('repair_tasks').update({ status: newStatus, price: priceValue }).eq('id', taskId);
    if (!error) fetchTasks();
  };

  // --- ฟังก์ชันพิมพ์ใบเสร็จ (ใหม่) ---
  const handlePrint = (task) => {
    const printContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Sarabun', sans-serif; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .content { margin-top: 20px; line-height: 1.6; }
            .total { text-align: right; font-size: 1.5rem; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PROMCARE RECEIPT</h1>
            <p>ใบเสร็จรับเงิน / ใบแจ้งหนี้</p>
          </div>
          <div class="content">
            <p><b>ชื่อลูกค้า:</b> ${task.customer_name}</p>
            <p><b>รถ / ทะเบียน:</b> ${task.title} (${task.license_plate})</p>
            <p><b>รายการซ่อม:</b> ${task.description}</p>
            <p><b>วันที่:</b> ${new Date(task.created_at).toLocaleDateString('th-TH')}</p>
          </div>
          <div class="total">
            <b>ยอดชำระทั้งสิ้น: ฿${task.price || 0}</b>
          </div>
          <p style="text-align:center; margin-top:50px; color:#888;">ขอบคุณที่ใช้บริการ PROMCARE</p>
        </body>
      </html>
    `;
    const win = window.open('', '', 'width=800,height=900');
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const successTasks = tasks.filter(t => t.status === 'success').length;
  const totalRevenue = tasks.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  const displayedTasks = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
      
      <header className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0 }}>PROMCARE <span style={{ color: '#ef4444' }}>ADMIN</span></h2>
          <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>ระบบจัดการงานซ่อมครบวงจร</p>
        </div>
        <button onClick={onLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </header>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <button onClick={() => setActiveTab('tasks')} style={activeTab === 'tasks' ? activeTabStyle : inactiveTabStyle}>📋 งานซ่อม</button>
        <button onClick={() => setActiveTab('members')} style={activeTab === 'members' ? activeTabStyle : inactiveTabStyle}>👥 สมาชิก</button>
      </div>

      {activeTab === 'tasks' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #fb923c' }}>
              <p style={{ color: '#888', fontSize: '0.8rem' }}>รอดำเนินการ</p>
              <h2 style={{ color: '#fb923c' }}>{pendingTasks}</h2>
            </div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #34d399' }}>
              <p style={{ color: '#888', fontSize: '0.8rem' }}>ซ่อมเสร็จ</p>
              <h2 style={{ color: '#34d399' }}>{successTasks}</h2>
            </div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
              <p style={{ color: '#888', fontSize: '0.8rem' }}>รายได้รวม</p>
              <h2 style={{ color: 'white' }}>฿{totalRevenue.toLocaleString()}</h2>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '25px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #333', color: '#555' }}>
                  <th style={{ padding: '15px' }}>ข้อมูลรถ</th>
                  <th style={{ padding: '15px' }}>ค่าบริการ</th>
                  <th style={{ padding: '15px' }}>หลักฐานชำระเงิน</th>
                  <th style={{ padding: '15px' }}>สถานะ</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {displayedTasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 'bold' }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>{task.license_plate}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      {task.status === 'pending' ? (
                        <input 
                          type="number" 
                          placeholder="ราคา"
                          style={{ background: '#222', color: 'white', border: '1px solid #444', padding: '5px', borderRadius: '5px', width: '80px' }}
                          onChange={(e) => setPriceInput({...priceInput, [task.id]: e.target.value})}
                        />
                      ) : (
                        <span style={{ color: '#34d399' }}>฿{task.price || 0}</span>
                      )}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {/* ส่วนแสดงสลิป (ใหม่) */}
                      {task.slip_url ? (
                        <a href={task.slip_url} target="_blank" rel="noreferrer" style={{ color: '#34d399', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}>
                          👁️ ดูสลิป
                        </a>
                      ) : (
                        <span style={{ color: '#444', fontSize: '0.85rem' }}>ยังไม่แนบ</span>
                      )}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '15px', fontSize: '0.7rem', border: task.status === 'success' ? '1px solid #34d399' : '1px solid #fb923c', color: task.status === 'success' ? '#34d399' : '#fb923c' }}>
                        {task.status === 'success' ? 'SUCCESS' : 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      {/* ปุ่มพิมพ์ใบเสร็จ (ใหม่) */}
                      {task.status === 'success' && (
                        <button onClick={() => handlePrint(task)} style={{ marginRight: '8px', background: '#333', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>🖨️</button>
                      )}
                      <button onClick={() => updateStatus(task.id, task.status)} style={{ background: task.status === 'success' ? '#444' : '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                        {task.status === 'success' ? 'เปิดงาน' : 'ปิดงาน'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="glass-card" style={{ padding: '30px' }}>
            {/* ตารางจัดการสมาชิก (คงเดิม) */}
            <h3 style={{marginBottom:'20px'}}>รายชื่อสมาชิก</h3>
            {members.map(m => (
                <div key={m.id} style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid #222'}}>
                    <span>{m.fullname} (@{m.username})</span>
                    <button style={{color:'#555', background:'none', border:'none', cursor:'pointer'}}>ลบ</button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

const activeTabStyle = { background: '#ef4444', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const inactiveTabStyle = { background: 'rgba(255,255,255,0.05)', color: '#888', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer' };

export default AdminDashboard;