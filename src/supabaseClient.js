import { createClient } from '@supabase/supabase-js'

// ค่าเหล่านี้ดึงมาจากหน้า Settings ของคุณใน Supabase
const supabaseUrl = 'https://iuhywblfqodtrabeohln.supabase.co'
const supabaseAnonKey = 'sb_publishable_KgT2KMpgBEc6qwEeOOh8Ig_L2-skiJR' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)