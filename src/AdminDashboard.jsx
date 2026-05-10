// ... ส่วนของฟังก์ชัน fetch และ updateStatus เหมือนเดิม ...

return (
  <div style={{ padding: '20px', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
    <h2 style={{ color: '#ff4d4d', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
      🛠️ รายการแจ้งซ่อมและจัดการสถานะ
    </h2>
    
    <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
      {repairs.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center' }}>ไม่มีข้อมูลการแจ้งซ่อม</p>
      ) : (
        repairs.map((task) => (
          <div key={task.id} style={{ 
            background: '#161616', 
            padding: '20px', 
            borderRadius: '15px', 
            border: '1px solid #333',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
              
              {/* ฝั่งซ้าย: ข้อมูลอุปกรณ์/ยานพาหนะ */}
              <div style={{ flex: '1', minWidth: '250px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ background: '#ff4d4d', padding: '3px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {task.device_type}
                  </span>
                  {task.color && (
                    <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
                      🎨 สี: <strong>{task.color}</strong>
                    </span>
                  )}
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>
                  {task.brand} <span style={{ color: '#888' }}>{task.device_name}</span>
                </h3>

                {task.registration_number && (
                  <div style={{ background: '#222', display: 'inline-block', padding: '5px 15px', borderRadius: '8px', border: '1px solid #444', marginBottom: '10px' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#fff', letterSpacing: '1px' }}>
                      ทะเบียน: <strong>{task.registration_number}</strong>
                    </p>
                  </div>
                )}

                <p style={{ color: '#ddd', marginTop: '10px', background: '#222', padding: '10px', borderRadius: '8px' }}>
                  <strong>อาการเสีย:</strong> {task.issue}
                </p>
              </div>

              {/* ฝั่งขวา: จัดการสถานะ */}
              <div style={{ width: '180px', textAlign: 'right', borderLeft: '1px solid #333', paddingLeft: '20px' }}>
                <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '5px' }}>อัปเดตสถานะ</label>
                <div style={{ 
                  color: task.status === 'success' ? '#4ade80' : task.status === 'fixing' ? '#60a5fa' : '#fbbf24',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  marginBottom: '15px'
                }}>
                  {task.status === 'pending' ? '⏳ รอดำเนินการ' : 
                   task.status === 'fixing' ? '🔧 กำลังซ่อม' : '✅ เสร็จสิ้น'}
                </div>
                
                <select 
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value)}
                  style={{ 
                    width: '100%',
                    background: '#000', 
                    color: 'white', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: '1px solid #ff4d4d',
                    cursor: 'pointer'
                  }}
                >
                  <option value="pending">รอดำเนินการ</option>
                  <option value="fixing">กำลังซ่อม</option>
                  <option value="success">เสร็จสิ้น</option>
                </select>
              </div>

            </div>
          </div>
        ))
      )}
    </div>
  </div>
);