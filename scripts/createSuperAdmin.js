// scripts/createSuperAdmin.js
//
// The approval workflow requires an EXISTING admin to approve new ones —
// so the very first Super Admin has to be created directly. Run this once:
//
//   node ksk-admin/scripts/createSuperAdmin.js "Your Name" you@example.com "a-strong-password"
//
require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

async function run() {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.log('Usage: node createSuperAdmin.js "Full Name" email@example.com "password"');
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert({
      name,
      email: email.toLowerCase().trim(),
      password_hash,
      role: 'super_admin',
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create super admin:', error.message);
    process.exit(1);
  }

  console.log('Super Admin created:');
  console.log(`  Name:  ${data.name}`);
  console.log(`  Email: ${data.email}`);
  console.log('You can now log in at /admin/login');
  process.exit(0);
}

run();
