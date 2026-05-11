import { createClient } from '@supabase/supabase-js'

// ต้องมีคำว่า const และเครื่องหมาย = ครบถ้วนตามนี้ครับ
const supabaseUrl = 'https://iuhywblfqodtrabeohln.supabase.co'
const supabaseAnonKey = 'sb_publishable_Kgt2KMpgBEc6qwEeOOh8Ig_L2-skiJR'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)