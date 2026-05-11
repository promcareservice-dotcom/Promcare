import { createClient } from '@supabase/supabase-js';

// 1. กำหนดค่า URL และ Anon Key ของคุณ
// (ตรวจสอบให้แน่ใจว่าไม่มีช่องว่างเกินมา และ URL ขึ้นต้นด้วย https://)
const supabaseUrl = 'https://iuhywblfqodtrabeohln.supabase.co';
const supabaseAnonKey = 'sb_publishable_Kgt2KMpgBEc6qwEeOOh8Ig_L2-skiJR'; 

// 2. สร้าง Client และส่งออก (Export) เพื่อไปใช้งานในไฟล์อื่น
// ห้าม import { supabase } เข้ามาในไฟล์นี้อีกเด็ดขาด
export const supabase = createClient(supabaseUrl, supabaseAnonKey);