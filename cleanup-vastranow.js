import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('Searching for users with vastranow in their email...');

  // Supabase admin api doesn't have a direct 'like' search for users, 
  // so we'll fetch profiles, or list users and filter
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error fetching users:', listError);
    return;
  }

  const vastranowUsers = users.filter(u => u.email && u.email.includes('vastranow'));
  
  if (vastranowUsers.length === 0) {
    console.log('No users found with vastranow in their email.');
    return;
  }

  console.log(`Found ${vastranowUsers.length} users to delete.`);

  for (const user of vastranowUsers) {
    console.log(`Deleting user: ${user.email} (ID: ${user.id})...`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error(`Failed to delete ${user.email}:`, deleteError);
    } else {
      console.log(`Successfully deleted ${user.email}.`);
    }
  }

  console.log('Cleanup complete!');
}

cleanup();
