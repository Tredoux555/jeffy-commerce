// Cleanup script - run with: npx tsx scripts/clear-test-data.ts
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read .env.local manually
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) return;
  const key = trimmed.slice(0, eqIndex).trim();
  let value = trimmed.slice(eqIndex + 1).trim();
  // Remove quotes if present
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[key] = value;
});

console.log('Connecting to:', env['NEXT_PUBLIC_SUPABASE_URL']);

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY']
);

async function clearTestData() {
  console.log('🧹 Clearing test data...\n');

  // Clear zone_partners
  const { error: partnersError } = await supabase
    .from('zone_partners')
    .delete()
    .gte('created_at', '1900-01-01');

  if (partnersError) {
    console.error('❌ Error clearing zone_partners:', partnersError.message);
  } else {
    console.log('✅ Cleared zone_partners');
  }

  // Clear wants
  const { error: wantsError } = await supabase
    .from('wants')
    .delete()
    .gte('created_at', '1900-01-01');

  if (wantsError) {
    console.error('❌ Error clearing wants:', wantsError.message);
  } else {
    console.log('✅ Cleared wants');
  }

  console.log('\n🎉 Done! Tables cleared for testing.');
}

clearTestData();
