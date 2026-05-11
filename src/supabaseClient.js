import { createClient } from '@supabase/supabase-js';

// ตรวจสอบ: ต้องไม่มี /rest/v1 ต่อท้าย URL
const supabaseUrl = 'https://iuhywblfqodtrabeohln.supabase.co';
const supabaseAnonKey = 'sb_publishable_Kgt2KMpgBEc6qwEeOOh8Ig_L2-skiJR'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);