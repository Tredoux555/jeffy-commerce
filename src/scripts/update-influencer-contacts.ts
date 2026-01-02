/**
 * One-time script to update influencer contacts with verified information
 * Run with: npx ts-node src/scripts/update-influencer-contacts.ts
 * 
 * Data gathered: January 2, 2026
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ContactUpdate {
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  management?: string;
  notes?: string;
}

const CONTACT_UPDATES: ContactUpdate[] = [
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
    name: 'Maharishi Institute',
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
    name: 'Wian van den Berg',
    email: 'wian@wianmagic.com',
    phone: '+27 82 579 9913',
    whatsapp: '+27 63 681 5661',
    management: 'Hands-On Entertainment / Entertainment Online',
    notes: 'TikTok @wian (16.8M). Alt WhatsApp: +27 79 374 0749. Alt email: entertainment@hands-on.co.za, action@entertainment-online.co.za'
  },

  // ===== EDUCATION LEADERS =====
  {
    name: 'Taddy Blecher',
    email: 'info@maharishinstitute.org',
    phone: '+27 11 492 0005',
    whatsapp: '+27 60 013 0000',
    management: 'Maharishi Institute (Founder/CEO)',
    notes: 'Pioneer of free higher education in SA. Address: 9 Ntemi Piliso Street + 45 Main Street (Anglo American building)'
  },
  {
    name: 'Dr Sizwe Nxasana',
    email: 'info@sifiso.com',
    phone: '+27 11 268 6396',
    management: 'Sifiso Learning Group',
    notes: 'Bureau: GuestSpeaker.co.za, 067 843 2362. Address: 269 Oxford Road, Illovo, Sandton. Future Nation Schools founder.'
  },
  {
    name: 'Stacey Brewer',
    email: 'info@sparkschools.co.za',
    phone: '+27 10 125 0600',
    management: 'SPARK Schools (CEO)',
    notes: 'Also: marketing@sparkschools.co.za. Address: 2nd Floor, Old Sasol Building, Rosebank, Johannesburg'
  },
  {
    name: 'Lindiwe Matlali',
    email: 'info@africateengeeks.co.za',
    management: 'Africa Teen Geeks (Founder/CEO)',
    notes: 'Presidential 4IR Commissioner. Address: 9 The Straight, Straight Avenue, Pineslopes, Fourways, 2194'
  },
  {
    name: 'Thulani Madondo',
    email: 'kliptownyouthprogram@gmail.com',
    phone: '+27 11 528 8670',
    management: 'Kliptown Youth Program (Executive Director)',
    notes: 'CNN Hero 2012 Top 10. Alt email: thu_im@hotmail.com, info@kliptownyouthprogram.org.za'
  },
  {
    name: 'Rapelang Rabana',
    email: 'contact@rapelang.com',
    management: 'Imagine Worldwide (Co-CEO) / Rekindle Learning',
    notes: 'Book via Speakers Inc or uniquespeakerbureauint.com. WEF Young Global Leader.'
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
    name: 'Boity Thulo',
    email: 'booking@djsproduction.co.za',
    phone: '+27 81 340 1356',
    management: 'Aline (CEO Sibo Mhlungu) / DJs Production',
    notes: 'BT Signature gin founder. Also try Instagram DM.'
  },
  {
    name: 'Linda Mtoba',
    email: 'hey@tothemaxmanagement.com',
    management: 'To The Max Brand Management',
    notes: 'Website: tothemaxmanagement.com/linda-mtoba. Forbes 30 Under 30. 2M Instagram followers.'
  },
  {
    name: 'Pearl Modiadie',
    email: '', // Via agency
    management: 'Owen S Management (OSM Talent)',
    notes: 'Contact via osmtalent.com. Metro FM weekdays 12-3pm. SAFTA Best TV Presenter winner.'
  },
  {
    name: 'Sizwe Dhlomo',
    management: 'Kaya FM (Direct)',
    notes: 'Hosts "Siz the World" weekdays 06h00-09h00. No public management - contact via Kaya FM or Twitter @SizweDhlomo'
  },
  {
    name: 'BigmanKG',
    email: 'bigmankg333@gmail.com',
    management: 'Self-managed',
    notes: 'TikTok @bigmankg (4.8M), Instagram @bigmankg_. Keegan Gordon - handles bookings directly.'
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
  console.log('Starting influencer contact updates...\n');

  for (const contact of CONTACT_UPDATES) {
    console.log(`Processing: ${contact.name}`);

    // Check if influencer exists
    const { data: existing, error: fetchError } = await supabase
      .from('influencers')
      .select('id, name, email, phone')
      .ilike('name', `%${contact.name}%`)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error(`  Error fetching ${contact.name}:`, fetchError.message);
      continue;
    }

    if (existing) {
      // Update existing record
      const updateData: Record<string, any> = {};
      
      if (contact.email !== undefined) updateData.email = contact.email;
      if (contact.phone) updateData.phone = contact.phone;
      if (contact.management) updateData.management = contact.management;
      if (contact.notes) updateData.notes = contact.notes;
      if (contact.whatsapp) updateData.whatsapp = contact.whatsapp;

      const { error: updateError } = await supabase
        .from('influencers')
        .update(updateData)
        .eq('id', existing.id);

      if (updateError) {
        console.error(`  Error updating ${contact.name}:`, updateError.message);
      } else {
        console.log(`  ✓ Updated ${contact.name}`);
        if (contact.whatsapp) console.log(`    WhatsApp: ${contact.whatsapp}`);
      }

      // Reset outreach status if email was bounced
      if (contact.email !== undefined) {
        const { error: resetError } = await supabase
          .from('outreach_contacts')
          .update({ status: 'not_contacted', notes: 'Email corrected - ready for re-send' })
          .eq('influencer_id', existing.id)
          .eq('status', 'bounced');

        if (!resetError) {
          console.log(`    Outreach status reset to not_contacted`);
        }
      }
    } else {
      console.log(`  ! ${contact.name} not found in database - skipping`);
    }
  }

  console.log('\n✅ Contact update complete!');
  
  // Summary
  console.log('\n=== VERIFIED WHATSAPP NUMBERS ===');
  console.log('Bonang Matheba: +27 79 374 0749');
  console.log('Wian van den Berg: +27 63 681 5661 / +27 79 374 0749');
  console.log('Maharishi Institute: +27 60 013 0000 / +27 76 787 4051');
  console.log('Entertainment Online (agency): +27 79 374 0749');
  console.log('Hands-On Entertainment (agency): +27 63 681 5661');
  
  console.log('\n=== KEY BOOKING PHONES ===');
  console.log('DJs Production: +27 81 340 1356 (Mihlali, Bonang, Boity, Nicolette)');
  console.log('Speakers Inc SA: +27 21 001 2937');
  console.log('The Speakers Firm: +27 11 482 7256/7 (Theo Baloyi)');
  console.log('Vusi Thembekwayo: +27 11 312 7551');
  console.log('Kliptown Youth Program: +27 11 528 8670 (Thulani Madondo)');
  console.log('Maharishi Institute: +27 11 492 0005 (Taddy Blecher)');
  console.log('SPARK Schools: +27 10 125 0600 (Stacey Brewer)');
  console.log('Sifiso Learning Group: +27 11 268 6396 (Dr Sizwe Nxasana)');
}

// Run the update
updateInfluencerContacts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
