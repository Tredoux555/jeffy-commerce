-- =============================================
-- COMPLETE INFLUENCER OUTREACH DATABASE
-- With personalized pitch letters
-- =============================================

-- Drop existing data to refresh
DELETE FROM outreach_contacts;
DELETE FROM influencers;

-- Insert all researched influencers with full contact details
INSERT INTO influencers (name, email, phone, platform, handle, followers, category, priority, notes, profile_url) VALUES

-- TIER 1: Direct Mission Alignment
('Taddy Blecher', 'info@maharishiinstitute.org', '+27 11 492 0005', 'LinkedIn', 'taddyblecher', 50000, 'education', 'high', 'CIDA City Campus founder - FREE education pioneer. Co-founded Branson Centre. PERFECT alignment with Jeffy schools mission.', 'https://linkedin.com/in/taddyblecher'),

('Siyanda Calvin Ntenga', 'info@ntenga.co.za', '073 254 3146', 'Instagram', 'ntenga3zn', 69000, 'philanthropy', 'high', 'Ntenga Foundation provides school shoes to underprivileged children. DIRECT mission alignment.', 'https://instagram.com/ntenga3zn'),

('Theo Baloyi', 'info@bathu.co.za', NULL, 'Instagram', 'theo_baloyi', 559000, 'entrepreneur', 'high', 'Bathu Shoes founder. "Bathu for Batho" pledges 1 MILLION school shoes. Perfect partner.', 'https://instagram.com/theo_baloyi'),

('Dr Sizwe Nxasana', 'info@sifiso.com', NULL, 'LinkedIn', 'sizwe-nxasana-691433123', 25000, 'education', 'high', 'Former FirstRand CEO. ACTIVELY building affordable schools with 100% matric pass. Chairs NECT.', 'https://linkedin.com/in/sizwe-nxasana-691433123'),

('Lindiwe Matlali', 'info@africateengeeks.co.za', NULL, 'LinkedIn', 'lindiwematlali', 15000, 'education', 'high', 'Africa Teen Geeks founder. Trained 800,000+ kids in coding. Presidential 4IR Commission.', 'https://linkedin.com/in/lindiwematlali'),

('Thulani Madondo', 'info@kliptownyouthprogram.org.za', NULL, 'LinkedIn', 'thulani-madondo-44176114', 5000, 'education', 'high', 'CNN Hero Top 10. Kliptown Youth Program supports 1,400+ children. Grew up in poverty.', 'https://kliptownyouthprogram.org.za'),

-- TIER 2: High Reach + Social Impact
('Vusi Thembekwayo', 'info@vusithembekwayo.com', '+27 11 312 7551', 'LinkedIn', 'vusithembekwayo', 6200000, 'business', 'high', 'Africa most-followed business voice. 6.2M followers. MyGrowthFund creates 100K jobs. Dragons Den.', 'https://vusithembekwayo.com'),

('Bonang Matheba', 'action@entertainment-online.co.za', '+27 79 374 0749', 'Instagram', 'bonang_m', 10500000, 'lifestyle', 'high', 'Queen B. 10.5M followers. House of BNG. Forbes Africa 50 Most Powerful Women. Dropped out due to fee issues.', 'https://instagram.com/bonang_m'),

('Motsepe Foundation', 'info@motsepefoundation.org', '+27 11 324 1500', 'LinkedIn', 'motsepe-foundation', 80000, 'foundation', 'high', 'Patrice Motsepe foundation. Committed R1.5 BILLION to education. Major funding potential.', 'https://motsepefoundation.org'),

('Connie Ferguson', 'info@fergusonfilms.com', NULL, 'Instagram', 'conaborokopele', 5800000, 'media', 'high', 'Ferguson Films. 5.8M followers. Ferguson Foundation funds disadvantaged youth education.', 'https://instagram.com/conaborokopele'),

('Sizwe Dhlomo', 'pr@kaya959.co.za', NULL, 'Twitter', 'SizweDhlomo', 2500000, 'media', 'medium', 'Kaya 959 host. 2.5M Twitter followers. One of SA most influential voices.', 'https://twitter.com/SizweDhlomo'),

-- TIER 3: Strategic Value  
('Trevor Noah Foundation', 'info@trevornoahfoundation.org', NULL, 'Instagram', 'trevornoah', 23000000, 'global', 'low', 'Long shot but foundation funds SA youth education. 23M global reach.', 'https://trevornoahfoundation.org'),

('Nicolette Mashile', 'me@nicolettem.com', NULL, 'Instagram', 'nicolettemashile', 221000, 'finance', 'medium', 'Financial Bunny. Kids book author. Gates Foundation Goalkeepers. School workshops.', 'https://instagram.com/nicolettemashile'),

('Gugu Khathi', NULL, NULL, 'Instagram', 'gugu.khathi', 793000, 'entrepreneur', 'medium', 'Woman of Influence Network. TEDx speaker. Reaches aspirational SA women.', 'https://instagram.com/gugu.khathi'),

('James Urdang', 'info@educationafrica.org', NULL, 'LinkedIn', 'james-urdang-158b1318', 10000, 'education', 'high', 'Education Africa founder. 30+ years. Mentored by Sisulu, worked with Mandela. Built Masibambane College.', 'https://jamesurdang.net'),

('Aisha Pandor', 'aisha@sweepsouth.com', '+27 84 705 5768', 'Twitter', 'aishapandor', 19000, 'tech', 'medium', 'SweepSouth founder. Created 30,000+ jobs for women. WEF breakthrough innovator.', 'https://sweepsouth.com'),

('Katlego Maphai', NULL, NULL, 'LinkedIn', 'katlegomaphai', 50000, 'tech', 'medium', 'Yoco co-founder. SA largest SME payments. 200,000+ merchants empowered.', 'https://linkedin.com/in/katlegomaphai'),

('Boity Thulo', 'shingaidarangwa@gmail.com', NULL, 'Instagram', 'boity', 6000000, 'entertainment', 'medium', 'Rapper, entrepreneur. 6M followers. Forbes 30 Under 30. #OwnYourThrone. Dropped out due to fees.', 'https://instagram.com/boity'),

('Dr Precious Moloi-Motsepe', 'info@motsepefoundation.org', NULL, 'LinkedIn', 'precious-moloi-motsepe', 5000, 'philanthropy', 'high', 'Motsepe Foundation CEO. UCT Chancellor. Giving Pledge. Committed R1.5B to education.', 'https://motsepefoundation.org'),

('Terra-Khaya (Shane Eades)', 'info@terrakhaya.co.za', '+27 82 897 7503', 'Instagram', 'terrakhaya', 4165, 'sustainability', 'medium', 'Off-grid eco-lodge. Permaculture, natural building. Engaged eco-conscious community.', 'https://terrakhaya.co.za'),

('IkamvaYouth (Joy Olivier)', 'info@ikamvayouth.org', '021 820 7444', 'Website', NULL, 5000, 'education', 'high', 'Ashoka Fellow. 17 branches nationally. 80-100% matric pass rates. Scalable model.', 'https://ikamvayouth.org'),

('Thato Kgatlhanye', NULL, NULL, 'LinkedIn', 'thato-kgatlhanye', 10000, 'social-enterprise', 'medium', 'Repurpose Schoolbags. Solar-powered bags from recycled plastic. Forbes/CNN featured.', 'https://anzisha.org/fellows/thato-kgatlhanye'),

('Sarah Langa', NULL, NULL, 'Instagram', 'sarahlanga', 688000, 'lifestyle', 'low', 'Fashion entrepreneur. Supports education of gifted children from low-income families.', 'https://instagram.com/sarahlanga');
