import { createClient } from '@supabase/supabase-js';

// ใช้ URL แค่ถึง .co (ห้ามมี /rest/v1/ ต่อท้าย)
const supabaseUrl = 'https://iuhywblfqodtrabeohln.supabase.co';
const supabaseAnonKey = 'sb_publishable_Kgt2KMpgBEc6qwEeOOh8Ig_L2-skiJR'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);