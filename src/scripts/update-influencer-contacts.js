/**
 * One-time script to update influencer contacts with verified information
 * Run with: node src/scripts/update-influencer-contacts.js
 * 
 * Data gathered: January 2, 2026
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.startsWith('#') || !line.trim()) return;
  const eqIndex = line.indexOf('=');
  if (eqIndex > 0) {
    const key = line.substring(0, eqIndex).trim();
    let value = line.substring(eqIndex + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

console.log('Supabase URL:', envVars.NEXT_PUBLIC_SUPABASE_URL);

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

const CONTACT_UPDATES = [
  // ===== BOUNCED EMAIL FIXES =====
  {
    name: 'Mihlali Ndamase',
    email: 'booking@djsproduction.co.za',
    phone: '+27 81 340 1356',
    management: 'DJs Production / The Creative Handler (Livy Seboko)',
    notes: 'Treasury Designs boutique owner. Original email hello@mihlalindamase.com bounced.'
  },
  {
    name: 'Sarah Langa',
    email: '', // No direct email - agency only
    management: 'Another Zero Agency',
    notes: 'Contact via agency form at anotherzero.africa/sarah-langa or Instagram DM. No public email available.'
  },
  {
    name: 'Ferguson Films',
    email: 'casting@fergusonfilms.co.za',
    management: 'Self-managed (Connie Ferguson)',
    notes: 'All casting handled internally. Address: Unit 1, Northcliff Office Park, 203 Beyers Naude Drive, Northcliff, Gauteng, 2195'
  },
  {
    name: 'Maharishi',
    email: 'info@maharishinstitute.org',
    phone: '+27 11 492 0005',
    whatsapp: '+27 60 013 0000',
    management: 'Dr. Taddy Blecher (CEO)',
    notes: 'Additional WhatsApp: +27 76 787 4051 (preschool). Address: 9 Ntemi Piliso Street, Johannesburg CBD'
  },

  // ===== VERIFIED WHATSAPP NUMBERS =====
  {
    name: 'Bonang Matheba',
    email: 'action@entertainment-online.co.za',
    phone: '+27 79 374 0749',
    whatsapp: '+27 79 374 0749',
    management: 'Bonang Matheba Entertainment (BME) / Entertainment Online',
    notes: 'Self-managed via BME. Also available via DJs Production: booking@djsproduction.co.za, +27 81 340 1356'
  },
  {
    name: 'Wian',
    email: 'wian@wianmagic.com',
    phone: '+27 82 579 9913',
    whatsapp: '+27 63 681 5661',
    management: 'Hands-On Entertainment / Entertainment Online',
    notes: 'TikTok @wian (16.8M). Alt WhatsApp: +27 79 374 0749. Alt email: entertainment@hands-on.co.za'
  },

  // ===== EDUCATION LEADERS =====
  {
    name: 'Taddy Blecher',
    email: 'info@maharishinstitute.org',
    phone: '+27 11 492 0005',
    whatsapp: '+27 60 013 0000',
    management: 'Maharishi Institute (Founder/CEO)',
    notes: 'Pioneer of free higher education in SA. Address: 9 Ntemi Piliso Street, Johannesburg CBD'
  },
  {
    name: 'Sizwe Nxasana',
    email: 'info@sifiso.com',
    phone: '+27 11 268 6396',
    management: 'Sifiso Learning Group',
    notes: 'Bureau: GuestSpeaker.co.za, 067 843 2362. Address: 269 Oxford Road, Illovo, Sandton.'
  },
  {
    name: 'Stacey Brewer',
    email: 'info@sparkschools.co.za',
    phone: '+27 10 125 0600',
    management: 'SPARK Schools (CEO)',
    notes: 'Also: marketing@sparkschools.co.za. Address: 2nd Floor, Old Sasol Building, Rosebank, JHB'
  },
  {
    name: 'Lindiwe Matlali',
    email: 'info@africateengeeks.co.za',
    management: 'Africa Teen Geeks (Founder/CEO)',
    notes: 'Presidential 4IR Commissioner. Address: 9 The Straight, Pineslopes, Fourways, 2194'
  },
  {
    name: 'Thulani Madondo',
    email: 'kliptownyouthprogram@gmail.com',
    phone: '+27 11 528 8670',
    management: 'Kliptown Youth Program (Executive Director)',
    notes: 'CNN Hero 2012 Top 10. Alt email: thu_im@hotmail.com'
  },
  {
    name: 'Rapelang Rabana',
    email: 'contact@rapelang.com',
    management: 'Imagine Worldwide (Co-CEO) / Rekindle Learning',
    notes: 'Book via Speakers Inc. WEF Young Global Leader.'
  },

  // ===== BUSINESS FIGURES =====
  {
    name: 'Vusi Thembekwayo',
    email: 'bookings@vusi.co.za',
    phone: '+27 11 312 7551',
    management: 'MyGrowthFund / Direct',
    notes: 'Speaking fees: R75K-R85K (SA), $9,999-$11,999 (Intl)'
  },
  {
    name: 'Theo Baloyi',
    email: 'info@thespeakersfirm.co.za',
    phone: '+27 11 482 7256',
    management: 'The Speakers Firm',
    notes: 'Bathu Shoes founder. Alt phone: +27 11 482 7257'
  },

  // ===== CONTENT CREATORS =====
  {
    name: 'Boity',
    email: 'booking@djsproduction.co.za',
    phone: '+27 81 340 1356',
    management: 'Aline (CEO Sibo Mhlungu) / DJs Production',
    notes: 'BT Signature gin founder. Also try Instagram DM.'
  },
  {
    name: 'Linda Mtoba',
    email: 'hey@tothemaxmanagement.com',
    management: 'To The Max Brand Management',
    notes: 'Website: tothemaxmanagement.com/linda-mtoba. Forbes 30 Under 30.'
  },
  {
    name: 'Pearl Modiadie',
    email: '',
    management: 'Owen S Management (OSM Talent)',
    notes: 'Contact via osmtalent.com. Metro FM weekdays 12-3pm.'
  },
  {
    name: 'Sizwe Dhlomo',
    management: 'Kaya FM (Direct)',
    notes: 'Hosts "Siz the World" weekdays 06h00-09h00. Contact via Twitter @SizweDhlomo'
  },
  {
    name: 'BigmanKG',
    email: 'bigmankg333@gmail.com',
    management: 'Self-managed',
    notes: 'TikTok @bigmankg (4.8M). Keegan Gordon - handles bookings directly.'
  },
  {
    name: 'Nicolette Mashile',
    email: 'nicolette.mashile@gmail.com',
    phone: '+27 81 340 1356',
    management: 'Financial Fitness Bunnies / DJs Production',
    notes: 'Coco the Money Bunny creator. Also: booking@djsproduction.co.za'
  }
];

async function updateInfluencerContacts() {
  console.log('\n🚀 Starting influencer contact updates...\n');

  let updated = 0;
  let notFound = 0;
  let errors = 0;

  for (const contact of CONTACT_UPDATES) {
    process.stdout.write(`Processing: ${contact.name}... `);

    // Check if influencer exists (search by partial name match)
    const { data: existing, error: fetchError } = await supabase
      .from('influencers')
      .select('id, name, email, phone')
      .ilike('name', `%${contact.name}%`);

    if (fetchError) {
      console.log(`❌ Error: ${fetchError.message}`);
      errors++;
      continue;
    }

    if (existing && existing.length > 0) {
      const record = existing[0];
      
      // Update existing record
      const updateData = {};
      
      if (contact.email !== undefined) updateData.email = contact.email || null;
      if (contact.phone) updateData.phone = contact.phone;
      if (contact.management) updateData.management = contact.management;
      if (contact.notes) updateData.notes = contact.notes;
      if (contact.whatsapp) updateData.whatsapp = contact.whatsapp;

      const { error: updateError } = await supabase
        .from('influencers')
        .update(updateData)
        .eq('id', record.id);

      if (updateError) {
        console.log(`❌ Update failed: ${updateError.message}`);
        errors++;
      } else {
        console.log(`✅ Updated`);
        if (contact.whatsapp) console.log(`   └─ WhatsApp: ${contact.whatsapp}`);
        updated++;
      }

      // Reset outreach status if email was changed
      if (contact.email !== undefined) {
        await supabase
          .from('outreach_contacts')
          .update({ status: 'not_contacted', notes: 'Email corrected - ready for re-send' })
          .eq('influencer_id', record.id)
          .in('status', ['bounced', 'failed']);
      }
    } else {
      console.log(`⚠️ Not found in database`);
      notFound++;
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(50));
  console.log(`✅ Updated: ${updated}`);
  console.log(`⚠️ Not found: ${notFound}`);
  console.log(`❌ Errors: ${errors}`);
  
  console.log('\n' + '═'.repeat(50));
  console.log('📱 VERIFIED WHATSAPP NUMBERS');
  console.log('═'.repeat(50));
  console.log('Bonang Matheba: +27 79 374 0749');
  console.log('Wian van den Berg: +27 63 681 5661');
  console.log('Maharishi Institute: +27 60 013 0000');
  
  console.log('\n' + '═'.repeat(50));
  console.log('📞 KEY BOOKING PHONES');
  console.log('═'.repeat(50));
  console.log('DJs Production: +27 81 340 1356');
  console.log('Vusi Thembekwayo: +27 11 312 7551');
  console.log('Thulani Madondo (KYP): +27 11 528 8670');
  console.log('');
}

// Run the update
updateInfluencerContacts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
