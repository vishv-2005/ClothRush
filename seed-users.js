import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const users = [
  { email: 'demo.customer@vastranow.com', full_name: 'Demo Customer', role: 'CUSTOMER' },
  { email: 'demo.seller@vastranow.com', full_name: 'Demo Seller', role: 'SELLER' },
  { email: 'demo.delivery@vastranow.com', full_name: 'Demo Delivery', role: 'DELIVERY_PARTNER' },
  { email: 'demo.admin@vastranow.com', full_name: 'Demo Admin', role: 'ADMIN' },
];

async function seed() {
  console.log("Seeding users...");
  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'demo123456',
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        role: user.role
      }
    });

    if (error) {
      if (error.message.includes("already registered")) {
        console.log(`User ${user.email} already exists.`);
      } else {
        console.error(`Error creating ${user.email}:`, error.message);
      }
    } else {
      console.log(`Successfully created ${user.email}`);
    }
  }
  console.log("Done!");
}

seed();
