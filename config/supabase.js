// config/supabase.js
// Central Supabase client used by every controller in the admin addon.
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
// Use the SERVICE ROLE key here (not the anon key) — the server is trusted
// and handles its own auth/role checks via middleware. NEVER expose the
// service role key to the browser/frontend.
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn(
    '[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env — ' +
    'the admin CMS will not be able to reach the database.'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

module.exports = supabase;
