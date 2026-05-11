import { createClient } from '@supabase/supabase-js';

// 1. ตั้งค่าเชื่อมต่อ (ตรวจสอบความถูกต้องของ URL และ Key)
const supabaseUrl = 'https://iuhywblfqodtrabeohln.supabase.co';
const supabaseAnonKey = 'sb_publishable_Kgt2KMpgBEc6qwEeOOh8Ig_L2-skiJR'; 

// 2. สร้างและส่งออก Client เพื่อให้ไฟล์อื่นเรียกใช้
export const supabase = createClient(supabaseUrl, supabaseAnonKey);