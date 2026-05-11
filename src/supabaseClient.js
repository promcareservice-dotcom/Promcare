import { createClient } from '@supabase/supabase-js'

// 1. URL ต้องไม่มี /rest/v1/ และห้ามมีช่องว่างข้างหน้าหรือข้างหลัง
const supabaseUrl = 'https://iuhywblfqodtrabeohln.supabase.co'

// 2. Key ต้องเป็น anon public key (ตัวที่ขึ้นต้นด้วย sb_publishable...) 
// ตรวจสอบว่าคัดลอกมาครบทุกตัวอักษร ห้ามมีช่องว่างแอบแฝง
const supabaseAnonKey = 'sb_publishable_Kgt2KMpgBEc6qwEeOOh8Ig_L2-skiJR'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)