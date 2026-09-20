import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', 'demo.delivery@vastranow.com')
    .single();

  if (profile) {
    const { error } = await supabase.from('delivery_partners').insert({
      user_id: profile.id,
      name: profile.full_name,
      phone: '+910000000000',
      availability: 'AVAILABLE'
    });
    
    if (error) {
      console.log("Error inserting:", error.message);
    } else {
      console.log("Successfully added demo delivery partner to delivery_partners table!");
    }
  } else {
    console.log("Could not find demo delivery profile.");
  }
}

fix();
