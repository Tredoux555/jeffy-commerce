-- =====================================================
-- INFLUENCER CONTACT UPDATE - January 2, 2026
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- First, add whatsapp column if it doesn't exist
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS management TEXT;

-- ===== BOUNCED EMAIL FIXES =====

UPDATE influencers SET 
  email = 'booking@djsproduction.co.za',
  phone = '+27 81 340 1356',
  management = 'DJs Production / The Creative Handler',
  notes = 'Treasury Designs owner. Original email bounced.'
WHERE name ILIKE '%Mihlali%';

UPDATE influencers SET 
  email = NULL,
  management = 'Another Zero Agency',
  notes = 'Contact via anotherzero.africa/sarah-langa or Instagram DM only.'
WHERE name ILIKE '%Sarah Langa%';

UPDATE influencers SET 
  email = 'casting@fergusonfilms.co.za',
  management = 'Self-managed (Connie Ferguson)',
  notes = 'Unit 1, Northcliff Office Park, 203 Beyers Naude Drive, Northcliff'
WHERE name ILIKE '%Ferguson%';

UPDATE influencers SET 
  email = 'info@maharishinstitute.org',
  phone = '+27 11 492 0005',
  whatsapp = '+27 60 013 0000',
  management = 'Dr. Taddy Blecher (CEO)',
  notes = 'Alt WhatsApp: +27 76 787 4051. 9 Ntemi Piliso Street, JHB CBD'
WHERE name ILIKE '%Maharishi%';

-- ===== VERIFIED WHATSAPP NUMBERS =====

UPDATE influencers SET 
  email = 'action@entertainment-online.co.za',
  phone = '+27 79 374 0749',
  whatsapp = '+27 79 374 0749',
  management = 'BME / Entertainment Online',
  notes = 'Also via DJs Production: booking@djsproduction.co.za, +27 81 340 1356'
WHERE name ILIKE '%Bonang%';

UPDATE influencers SET 
  email = 'wian@wianmagic.com',
  phone = '+27 82 579 9913',
  whatsapp = '+27 63 681 5661',
  management = 'Hands-On Entertainment / Entertainment Online',
  notes = 'TikTok @wian (16.8M). Alt: entertainment@hands-on.co.za'
WHERE name ILIKE '%Wian%';

-- ===== EDUCATION LEADERS =====

UPDATE influencers SET 
  email = 'info@maharishinstitute.org',
  phone = '+27 11 492 0005',
  whatsapp = '+27 60 013 0000',
  management = 'Maharishi Institute (Founder/CEO)'
WHERE name ILIKE '%Taddy%' OR name ILIKE '%Blecher%';

UPDATE influencers SET 
  email = 'info@sifiso.com',
  phone = '+27 11 268 6396',
  management = 'Sifiso Learning Group',
  notes = 'Bureau: 067 843 2362. 269 Oxford Road, Illovo, Sandton'
WHERE name ILIKE '%Sizwe Nxasana%' OR name ILIKE '%Nxasana%';

UPDATE influencers SET 
  email = 'info@sparkschools.co.za',
  phone = '+27 10 125 0600',
  management = 'SPARK Schools (CEO)',
  notes = 'Also: marketing@sparkschools.co.za. Old Sasol Building, Rosebank'
WHERE name ILIKE '%Stacey%' AND name ILIKE '%Brewer%';

UPDATE influencers SET 
  email = 'info@africateengeeks.co.za',
  management = 'Africa Teen Geeks (Founder/CEO)',
  notes = 'Presidential 4IR Commissioner. Pineslopes, Fourways'
WHERE name ILIKE '%Lindiwe%' AND name ILIKE '%Matlali%';

UPDATE influencers SET 
  email = 'kliptownyouthprogram@gmail.com',
  phone = '+27 11 528 8670',
  management = 'Kliptown Youth Program (Executive Director)',
  notes = 'CNN Hero 2012 Top 10. Alt: thu_im@hotmail.com'
WHERE name ILIKE '%Thulani%' AND name ILIKE '%Madondo%';

UPDATE influencers SET 
  email = 'contact@rapelang.com',
  management = 'Imagine Worldwide (Co-CEO) / Rekindle Learning',
  notes = 'Book via Speakers Inc. WEF Young Global Leader.'
WHERE name ILIKE '%Rapelang%';

-- ===== BUSINESS FIGURES =====

UPDATE influencers SET 
  email = 'bookings@vusi.co.za',
  phone = '+27 11 312 7551',
  management = 'MyGrowthFund / Direct',
  notes = 'Speaking fees: R75K-R85K (SA), $9,999-$11,999 (Intl)'
WHERE name ILIKE '%Vusi%' AND name ILIKE '%Thembekwayo%';

UPDATE influencers SET 
  email = 'info@thespeakersfirm.co.za',
  phone = '+27 11 482 7256',
  management = 'The Speakers Firm',
  notes = 'Bathu Shoes founder. Alt: +27 11 482 7257'
WHERE name ILIKE '%Theo%' AND name ILIKE '%Baloyi%';

-- ===== CONTENT CREATORS =====

UPDATE influencers SET 
  email = 'booking@djsproduction.co.za',
  phone = '+27 81 340 1356',
  management = 'Aline / DJs Production',
  notes = 'BT Signature gin founder.'
WHERE name ILIKE '%Boity%';

UPDATE influencers SET 
  email = 'hey@tothemaxmanagement.com',
  management = 'To The Max Brand Management',
  notes = 'tothemaxmanagement.com/linda-mtoba. Forbes 30 Under 30.'
WHERE name ILIKE '%Linda%' AND name ILIKE '%Mtoba%';

UPDATE influencers SET 
  email = NULL,
  management = 'Owen S Management (OSM Talent)',
  notes = 'Contact via osmtalent.com. Metro FM weekdays 12-3pm.'
WHERE name ILIKE '%Pearl%' AND name ILIKE '%Modiadie%';

UPDATE influencers SET 
  management = 'Kaya FM (Direct)',
  notes = 'Siz the World weekdays 06h00-09h00. Twitter @SizweDhlomo'
WHERE name ILIKE '%Sizwe%' AND name ILIKE '%Dhlomo%';

UPDATE influencers SET 
  email = 'bigmankg333@gmail.com',
  management = 'Self-managed',
  notes = 'TikTok @bigmankg (4.8M). Keegan Gordon.'
WHERE name ILIKE '%BigmanKG%' OR name ILIKE '%Bigman%';

UPDATE influencers SET 
  email = 'nicolette.mashile@gmail.com',
  phone = '+27 81 340 1356',
  management = 'Financial Fitness Bunnies / DJs Production',
  notes = 'Coco the Money Bunny. Also: booking@djsproduction.co.za'
WHERE name ILIKE '%Nicolette%' AND name ILIKE '%Mashile%';

-- ===== RESET BOUNCED OUTREACH STATUS =====

UPDATE outreach_contacts 
SET status = 'not_contacted', notes = 'Email corrected - ready for re-send'
WHERE status IN ('bounced', 'failed')
AND influencer_id IN (
  SELECT id FROM influencers 
  WHERE name ILIKE '%Mihlali%' 
     OR name ILIKE '%Sarah Langa%' 
     OR name ILIKE '%Ferguson%' 
     OR name ILIKE '%Maharishi%'
);

-- ===== VERIFY UPDATES =====
SELECT name, email, phone, whatsapp, management 
FROM influencers 
WHERE whatsapp IS NOT NULL 
ORDER BY name;
