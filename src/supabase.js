import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vvityqfkazcqnporvwka.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aXR5cWZrYXpjcW5wb3J2d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODkxMTEsImV4cCI6MjA4OTY2NTExMX0.GFrM0Wt5Qcb63382bmOSXEhqWrqlgORh2mUDNNHSB4k'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
