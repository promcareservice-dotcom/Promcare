import { createClient } from '@supabase/supabase-js';

// ลิงก์ URL จากหน้า API Settings (ตัดส่วน /rest/v1/ ออก)
const supabaseUrl = 'https://iuhywblfqodtrabeohln.supabase.co';
// Publishable key ที่คุณคัดลอกมา
const supabaseAnonKey = 'sb_publishable_Kgt2KMpgBEc6qwEeOOh8Ig_L2-skiJR'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);