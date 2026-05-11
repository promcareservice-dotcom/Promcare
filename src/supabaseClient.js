import { createClient } from '@supabase/supabase-js'

// ต้องเขียนให้ครบตามนี้ ห้ามลบ const หรือเครื่องหมายเท่ากับออกนะครับ
const supabaseUrl = 'https://iuhywblfqodtrabeohln.supabase.co'
const supabaseAnonKey = 'sb_publishable_Kgt2KMpgBEc6qwEeOOh8Ig_L2-skiJR'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)