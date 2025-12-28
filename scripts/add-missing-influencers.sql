-- ADD ALL MISSING INFLUENCERS FROM YOUR DOCUMENTS
-- Run this in Supabase SQL Editor

-- From jeffy_letters_relaxed_original8.docx (5 missing)
INSERT INTO influencers (name, email, phone, platform, category, priority, notes) VALUES
('Wian van den Berg', 'wian@wianmagic.com', NULL, 'TikTok', 'Entertainment/Magic', 'high', '16.8M TikTok followers. Biggest magician Southern Hemisphere. Self-taught since 16. Free State to Vegas.'),
('BigmanKG', 'bigmankg333@gmail.com', NULL, 'YouTube', 'Content Creator', 'high', 'Keegan Gordon. 8M followers. "Mr Beast of SA". Thomas street vendor video. Age 24. #Car4Brian.'),
('Pearl Modiadie', 'booking@djsproduction.co.za', '+27 81 340 1356', 'TV/Radio', 'Media', 'high', 'Grew up in shack in Tembisa. 17 years in media. Gave R250,000 Deal or No Deal winnings to Tshepang Care Centre.'),
('Linda Mtoba', NULL, NULL, 'Instagram', 'Entertainment', 'medium', 'Via tothemaxmanagement.com. From Umlazi. isiZulu teacher. Founded Linda Mtoba Foundation - bursaries during COVID.'),
('Mihlali Ndamase', 'hello@mihlalindamase.com', NULL, 'Instagram', 'Beauty/Business', 'medium', '2M+ Instagram. Forbes 30 Under 30. Treasury Designs. Siyasizana Foundation for independent sustainability.');

-- From jeffy_letters_new20.docx (13 missing)
INSERT INTO influencers (name, email, phone, platform, category, priority, notes) VALUES
('Stacey Brewer', NULL, NULL, 'Education', 'Education Pioneer', 'high', 'Via sparkschools.co.za. SPARK Schools founder. 24 schools. 15,000+ students. World Best School 2023 Soweto. Forbes Africa.'),
('Rapelang Rabana', 'media@rekindlelearning.com', NULL, 'Tech/Education', 'Tech Entrepreneur', 'high', 'Rekindle Learning. Imagine Worldwide. Forbes before 30. WEF Young Global Leader. Oprah O Power List.'),
('Kent Cooper', 'kent01cooper@gmail.com', NULL, 'Permaculture', 'Sustainability Expert', 'medium', '30+ years permaculture. Oudeberg 600 hectares Klein Karoo. Teaches food, electricity, water harvesting.'),
('Rose Williams', 'info@biowatch.org.za', NULL, 'Agriculture', 'Food Sovereignty', 'medium', 'Biowatch SA. Landmark GMO court case. Works with smallholder farmers KZN. Seed saving. Food sovereignty.'),
('Joe Matimba', NULL, NULL, 'Agriculture', 'Greening Pioneer', 'medium', 'Via LinkedIn or Food & Trees for Africa. Make Africa Green. 35+ years greening. 25+ school food gardens Limpopo.'),
('Off-Grid Strength', NULL, NULL, 'YouTube', 'Homesteading', 'medium', 'Carenna & Charné via renoffgrid.org. Sold everything, lived from car. Eastern Cape homestead. 2 videos/week.'),
('Mamphela Ramphele', 'info@mamphela-ramphele.com', NULL, 'Education/Politics', 'Liberation Leader', 'high', 'Co-founded Black Consciousness with Biko. UCT Vice-Chancellor. World Bank MD. LEAP Schools founder.'),
('Thabo Mbeki Foundation', 'info@mbeki.org', '+27 11 486 1560', 'Foundation', 'Policy/Pan-African', 'medium', 'African Renaissance. African solutions to African challenges. Ubuntu philosophy.'),
('Luvuyo Rani', 'luvuyo.rani@silulo.com', NULL, 'Tech/Business', 'Tech Entrepreneur', 'medium', 'Silulo Ulutho Technologies. Car trunk 2004 to 43+ branches. Schwab Foundation. WEF 2018. Stanford Seed.'),
('Bulelani Balabala', 'media@JoinUsForTEA.co.za', '+27 68 158 9484', 'Entrepreneurship', 'Township Business', 'medium', 'TEA - Township Entrepreneurs Alliance. 100,000+ entrepreneurs impacted. 400,000+ jobs. Dropped out Grade 9.'),
('Bushra Razack', 'bushra@philippivillage.co.za', NULL, 'Community Dev', 'Social Enterprise', 'medium', 'Philippi Village. Abandoned cement factory to 80+ tenants. Forty Under 40 Africa 2024. World Youth Congress at 12.'),
('Thato Kgatlhanye', NULL, NULL, 'Manufacturing', 'Social Enterprise', 'medium', 'Via speakersinc.co.za or Rethaka socials. Repurpose Schoolbags. 400,000 plastic bags recycled. Solar backpacks.'),
('Francois van Niekerk', NULL, NULL, 'Philanthropy', 'Foundation', 'medium', 'Via mergon.co.za. Mergon Foundation. Gave 70% equity (~$170M). Skills Schools - barista, coding, construction.');

-- Verify total count
SELECT COUNT(*) as total_contacts FROM influencers;
