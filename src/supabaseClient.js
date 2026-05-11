import { supabase } from '../supabaseClient.js';

// 1. ตรวจสอบว่า URL และ Key ถูกต้อง (ก๊อปปี้มาจากหน้า Settings > API ใน Supabase)
const supabaseUrl = 'https://iuhywblfqodtrabeohln.supabase.co'
const supabaseAnonKey = 'sb_publishable_KgT2KMpgBEc6qwEeOOh8Ig_L2-skiJR'

// 2. สร้าง Client และ Export ออกไปใช้งาน
// ตรวจสอบการสะกดชื่อตัวแปร supabase ให้เป็นตัวพิมพ์เล็กทั้งหมด
export const supabase = createClient(supabaseUrl, supabaseAnonKey)