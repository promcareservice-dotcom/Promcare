import { createClient } from '@supabase/supabase-js'

// เปลี่ยนจากกุญแจยาวๆ ให้เหลือแค่นี้ครับ
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)