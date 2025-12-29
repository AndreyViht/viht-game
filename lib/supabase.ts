import { createClient } from '@supabase/supabase-js';

// Данные для подключения к Supabase
const SUPABASE_URL = 'https://irtwyprryptdqtusxjvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydHd5cHJyeXB0ZHF0dXN4anZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0ODA3NzIsImV4cCI6MjA3NDA1Njc3Mn0.YcL9S3a_RxK9CuWNkhicjCLVbTf0jTmLvsbwxXLkB4w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);