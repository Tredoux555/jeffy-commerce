const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://inhrgiakjyprabxluppv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function deleteAllProducts() {
  // First get all products
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, name');
  
  if (fetchError) {
    console.log('Error fetching:', fetchError.message);
    return;
  }
  
  console.log(`Found ${products?.length || 0} products to delete`);
  
  if (!products || products.length === 0) {
    console.log('No products to delete');
    return;
  }

  // Delete all
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (dummy condition)
  
  if (deleteError) {
    console.log('Error deleting:', deleteError.message);
  } else {
    console.log('All products deleted!');
  }
}

deleteAllProducts();
