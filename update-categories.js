import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Starting category migration...');

  // 1. Create "Others" category
  const { data: othersCat, error: othersError } = await supabase
    .from('categories')
    .insert({
      id: 'c1000000-0000-0000-0000-000000000013',
      name: 'Others',
      slug: 'others',
      description: 'Other clothing items',
      sort_order: 13
    })
    .select()
    .single();

  if (othersError && othersError.code !== '23505') { // Ignore unique violation if it already exists
    console.error('Error creating Others category:', othersError);
  } else {
    console.log('Created Others category.');
  }

  // 2. Move products from Men, Women, Kids to Others
  const oldIds = [
    'c1000000-0000-0000-0000-000000000001', // Men
    'c1000000-0000-0000-0000-000000000002', // Women
    'c1000000-0000-0000-0000-000000000003'  // Kids
  ];

  const { data: updatedProducts, error: updateError } = await supabase
    .from('products')
    .update({ category_id: 'c1000000-0000-0000-0000-000000000013' })
    .in('category_id', oldIds);

  if (updateError) {
    console.error('Error updating products:', updateError);
  } else {
    console.log('Successfully moved products to Others category.');
  }

  // 3. Delete old categories
  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .in('id', oldIds);

  if (deleteError) {
    console.error('Error deleting old categories:', deleteError);
  } else {
    console.log('Successfully deleted Men, Women, and Kids categories.');
  }

  console.log('Migration complete.');
}

run();
