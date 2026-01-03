// Create Life OS tables in Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read .env.local
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
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[key] = value;
});

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY']
);

async function createLifeOSTables() {
  console.log('🚀 Creating Life OS tables...\n');

  // Read SQL file
  const sqlPath = join(process.cwd(), 'scripts', 'life-os-schema.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  // Split into individual statements (simple split on semicolon + newline)
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  let success = 0;
  let failed = 0;

  for (const statement of statements) {
    if (!statement) continue;
    
    // Skip comments-only blocks
    const lines = statement.split('\n').filter(l => !l.trim().startsWith('--'));
    if (lines.length === 0) continue;
    
    const cleanStatement = statement + ';';
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: cleanStatement });
      if (error) {
        // Try direct query for DDL
        const { error: error2 } = await supabase.from('_dummy').select().limit(0);
        // Can't run DDL through JS client, need to use SQL editor
        console.log(`⚠️  Statement needs SQL Editor (DDL not supported via JS client)`);
        console.log(`   First 50 chars: ${cleanStatement.slice(0, 50)}...`);
        failed++;
      } else {
        success++;
      }
    } catch (e) {
      failed++;
    }
  }

  console.log(`\n📊 Results: ${success} succeeded, ${failed} need SQL Editor`);
  console.log('\n⚠️  Supabase JS client cannot run DDL (CREATE TABLE, etc.)');
  console.log('📋 Copy the SQL from scripts/life-os-schema.sql and run in Supabase SQL Editor');
  console.log('   URL: https://supabase.com/dashboard/project/inhrgiakjyprabxluppv/sql');
}

createLifeOSTables();
