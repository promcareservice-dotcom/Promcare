import { createClient } from '@supabase/supabase-js';

// URL ต้องจบที่ .co เท่านั้น ห้ามมี /rest/v1/ ต่อท้ายเด็ดขาด
const supabaseUrl = 'https://iuhywblfqodtrabeohln.supabase.co';
const supabaseAnonKey = 'sb_publishable_Kgt2KMpgBEc6qwEeOOh8Ig_L2-skiJR'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);