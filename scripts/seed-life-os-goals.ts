// Seed initial Life OS goals
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

const initialGoals = [
  {
    name: 'Zone Partner Recruitment',
    description: 'Recruit Zone Partners for Jeffy launch. Quality over speed - each partner is a business owner.',
    category: 'jeffy',
    target_value: 20,
    current_value: 0,
    unit: 'partners',
    deadline: '2026-06-01',
    priority: 1,
    status: 'active',
    milestones: JSON.stringify([
      { value: 5, label: 'Minimum viable network', reached: false },
      { value: 10, label: 'Proof of concept', reached: false },
      { value: 20, label: 'Launch ready', reached: false }
    ]),
    why_this_matters: 'Zone Partners are the distribution network. No partners = no Jeffy. They are the first wave of the movement.',
  },
  {
    name: 'Wants Collected',
    description: 'Collect validated customer wants before sourcing. Each want is market research that converts to revenue.',
    category: 'jeffy',
    target_value: 500,
    current_value: 0,
    unit: 'wants',
    deadline: '2026-06-01',
    priority: 2,
    status: 'active',
    milestones: JSON.stringify([
      { value: 100, label: 'Minimum for launch', reached: false },
      { value: 250, label: 'Strong signal', reached: false },
      { value: 500, label: 'Excellent validation', reached: false }
    ]),
    why_this_matters: 'Demand-first model. Only source products with validated demand. Cash flow positive from day one.',
  },
  {
    name: 'Influencer Responses',
    description: '40 personalized letters sent Jan 2. Track responses.',
    category: 'jeffy',
    target_value: 5,
    current_value: 0,
    unit: 'responses',
    deadline: '2026-01-31',
    priority: 1,
    status: 'active',
    milestones: JSON.stringify([
      { value: 1, label: 'First response', reached: false },
      { value: 3, label: 'Momentum', reached: false },
      { value: 5, label: 'Strong interest', reached: false }
    ]),
    why_this_matters: 'One influencer could change everything. The story sells itself.',
  },
  {
    name: 'Monthly Net Profit',
    description: 'Target: ~20 active Zone Partners at R80/order Jeffy share.',
    category: 'jeffy',
    target_value: 50000,
    current_value: 0,
    unit: 'ZAR',
    deadline: '2027-12-31',
    priority: 3,
    status: 'active',
    milestones: JSON.stringify([
      { value: 10000, label: 'Ramen profitable', reached: false },
      { value: 30000, label: 'Sustainable', reached: false },
      { value: 50000, label: 'Financial freedom', reached: false }
    ]),
    why_this_matters: 'Every rand goes toward schools in SA. This is the vehicle.',
  },
  {
    name: "Son's Model Portfolio",
    description: 'Create professional model portfolio for son.',
    category: 'family',
    target_value: 1,
    current_value: 0,
    unit: 'portfolio',
    deadline: '2026-02-28',
    priority: 1,
    status: 'active',
    milestones: JSON.stringify([
      { value: 0.25, label: 'Research complete', reached: false },
      { value: 0.5, label: 'Photos taken', reached: false },
      { value: 0.75, label: 'Portfolio compiled', reached: false },
      { value: 1, label: 'Submitted to agencies', reached: false }
    ]),
    why_this_matters: 'He is drop dead gorgeous. This could open opportunities.',
  },
  {
    name: 'Relocate to Qingdao',
    description: 'Get out of Beijing. God willing.',
    category: 'career',
    target_value: 1,
    current_value: 0,
    unit: 'move',
    deadline: '2026-06-30',
    priority: 1,
    status: 'active',
    milestones: JSON.stringify([
      { value: 0.25, label: 'Job secured', reached: false },
      { value: 0.5, label: 'Housing found', reached: false },
      { value: 0.75, label: 'Schools arranged', reached: false },
      { value: 1, label: 'Move complete', reached: false }
    ]),
    why_this_matters: 'Better quality of life. New chapter.',
  }
];

async function seedGoals() {
  console.log('🌱 Seeding Life OS goals...\n');

  for (const goal of initialGoals) {
    const { error } = await supabase.from('life_goals').insert(goal);
    
    if (error) {
      console.error(`❌ Failed to insert "${goal.name}":`, error.message);
    } else {
      console.log(`✅ Created: ${goal.name}`);
    }
  }

  console.log('\n🎉 Done seeding goals!');
}

seedGoals();
