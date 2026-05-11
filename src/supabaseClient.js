import { createClient } from '@supabase/supabase-js'

// ตรวจสอบว่ามีคำว่า const และเครื่องหมาย = ครบถ้วนนะครับ
const supabaseUrl = 'https://iuhywblfqodtrabeohln.supabase.co'
const supabaseAnonKey = 'sb_publishable_Kgt2KMpgBEc6qwEeOOh8Ig_L2-skiJR'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)