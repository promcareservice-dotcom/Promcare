import { createClient } from '@supabase/supabase-js'

// 1. ตรวจสอบว่า URL และ Key ถูกต้อง (ก๊อปปี้มาจากหน้า Settings > API ใน Supabase)
const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'your-anon-key-here'

// 2. สร้าง Client และ Export ออกไปใช้งาน
// ตรวจสอบการสะกดชื่อตัวแปร supabase ให้เป็นตัวพิมพ์เล็กทั้งหมด
export const supabase = createClient(supabaseUrl, supabaseAnonKey)