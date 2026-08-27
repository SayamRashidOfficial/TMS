const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function testLogin() {
  console.log('Testing login with:', supabaseUrl);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@huzaifa.com',
      password: 'Admin123!'
    });

    if (error) {
      console.error('Auth Error Details:', Object.getOwnPropertyNames(error).reduce((acc, key) => { acc[key] = error[key]; return acc; }, {}));
      console.error('Error stringified:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } else {
      console.log('Login Success! User ID:', data.user.id);
    }
  } catch (e) {
    console.error('Caught Exception:', e);
  }
}

testLogin();
