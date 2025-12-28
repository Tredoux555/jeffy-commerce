'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Mail, Send, CheckCircle, Clock, MessageSquare, Calendar,
  Search, Phone, Instagram, Linkedin, Twitter, XCircle, 
  Rocket, Copy, Check, ChevronDown, ChevronUp, Zap, Star,
  Trophy, Target, Users
} from 'lucide-react';

interface Influencer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  platform: string | null;
  handle: string | null;
  followers: number | null;
  category: string | null;
  priority: string;
  notes: string | null;
  profile_url: string | null;
  outreach_contacts?: OutreachContact[];
}

interface OutreachContact {
  id: string;
  influencer_id: string;
  status: string;
  pitch_type: string;
  sent_at: string | null;
  replied_at: string | null;
  notes: string | null;
}

// ============================================
// ALL PERSONALIZED LETTERS - FROM YOUR DOCS + NEW RESEARCH
// ============================================
const PITCHES: Record<string, { subject: string; body: string }> = {

  // ========== ORIGINAL 8 (from jeffy_letters_relaxed_original8.docx) ==========
  
  'Vusi Thembekwayo': {
    subject: "From walking through malls with CVs to building free schools",
    body: `Hey Vusi,

I'm going to be straight with you — I've followed your journey for years and it took me a while to work up the nerve to send this. But here goes.

I know where you came from. The gunmen. Losing your father at 13. Your mom working herself to the bone. Living at your grandfather's place with no electricity, waking before dawn just to catch buses to school. Dropping out of university when the money dried up. Walking through malls for six weeks handing out CVs.

And I know where you ended up. Business from your bedroom at 17. World champion speaker by 22. MyGrowthFund. 300 Black businesses. 100,000 jobs by 2030.

Here's the thing — I'm building something that I think speaks to everything you've been fighting for. It's called Jeffy, and on the surface it's just a commerce platform. But underneath? It's the engine for something bigger.

The profits from Jeffy are going to build free schools. Not charity schools — schools where kids are selected purely on merit. And when they graduate? They walk away with one hectare of land, a house they built themselves, and the skills to manufacture whatever they need. Food. Tech. Clothes. Everything.

My family built a school once. For farm kids who had to walk 30km each way just to learn. Corruption killed it. I've been trying to figure out how to build something they can't destroy ever since.

I'm not asking for money or a favour. I'm asking if you'd take 10 minutes to read The Jeffy Manifesto and tell me if it's worth a conversation. That's it.

You once said you challenge yourself to do one terrifying thing every year. Sending this email might be mine.

Cheers,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Theo Baloyi': {
    subject: "Walk Your Journey — from Alex to building schools together",
    body: `Hey Theo,

Your dad taught you something that stuck with me — have an intellectual relationship with money, not an emotional one. Lose R10? Don't cry about it. Think about how to make R20.

He passed in 2014 before he could see what you built. That gets me. The people who plant trees they'll never sit under.

I know the story. Moving to Alex. Seeing guys on street corners who'd given up. Asking yourself if you'd be the one in the fancy office looking down or the one actually doing something. Sixteen factories saying no to your mesh design. Wanting 100 pairs but they demanded 1,200. Twenty-one samples later, finally a yes.

Now? 32+ stores. 400+ jobs. 80% of your warehouse staff from Alex. Your sister on the team. Job Creator of the Year. A million school shoes through Bathu for Batho.

"Walk Your Journey" isn't just a slogan. It's a whole philosophy. And I think what I'm building has the same DNA.

Jeffy Commerce is a platform where Zone Partners — local entrepreneurs — own their territories and keep 50% of profits. Not the 25% Uber and Bolt leave for their drivers. Real ownership. Real money back in the community.

But that's just the engine. The profits build free schools where graduates walk away with land, a house they built, and skills to make anything they need. Selected on merit alone. No connections. No money. Just potential.

You said "don't despise small beginnings." This is mine. I'm not asking you to endorse anything blind. Just read The Jeffy Manifesto and tell me if it's worth walking together for a bit.

Walk your journey,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Nicolette Mashile': {
    subject: "No one is born bad at money — they're just never taught",
    body: `Hey Nicolette,

You said something once that hit me hard — no one is born bad at money. We're just never taught. Families living paycheck to paycheck aren't failing. They're repeating patterns nobody showed them how to break.

I know your story. Bushbuckridge. Boarding school where you couldn't speak English or Swazi. Depression diagnosis at 17. Dropping out of Rhodes. Your sister taking a loan so you could try again. That R125,000 lesson from an Offer to Purchase you didn't fully understand.

And now? Five investment properties. Millionaire. Coco the Money Bunny teaching kids. FSCA Consumer Advisory Panel. Every mistake turned into a lesson for millions.

Your vision is "a financially inclusive and economically viable South Africa where everyone can thrive." That's literally what I'm trying to build.

Jeffy Commerce gives Zone Partners 50% of profits — real money, not scraps. But that's just the start. The profits fund free schools where kids are selected on merit alone and graduate with land, a home, and skills to manufacture everything they need.

Imagine if those schools taught financial literacy from day one. If Coco's lessons were woven right into the curriculum. Kids who aren't just self-sufficient but financially capable too.

Not asking for anything today except your time. Read The Jeffy Manifesto. If it lines up with where you're headed, I'd love to chat.

You bought your first property to protect yourself from instant gratification. This is me doing the same thing — betting on something bigger than myself.

Thanks for reading,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Wian van den Berg': {
    subject: "Bus ticket to Durban, no plan, now 16.8M followers — let's make magic",
    body: `Hey Wian,

Okay, let me get this straight — you spent your savings on a bus ticket to Durban with no plan except to film yourself doing magic for strangers. Within weeks, viral. Now you're the biggest TikToker in South Africa. 16.8 million followers. Self-taught since 16.

That's absolutely wild. Small town in the Free State to Vegas, London, Dubai. The biggest magician in the Southern Hemisphere.

But here's what I really like — you're not afraid to show how the tricks work. You reveal secrets, show behind-the-scenes, and somehow it makes the magic MORE powerful. Transparency as a brand strategy. Brilliant.

When you launched your NFTs, you committed proceeds to education and healthcare in Africa. You said using your influence to put "magic" in the lives of those less fortunate would give you a smile wider than the Joker's. I felt that.

So here's the thing. I'm building Jeffy Commerce — a platform with a "wants" system. When 10 people agree they want a product, they get it free. Simple, shareable, and yeah... it's got viral potential written all over it.

But Jeffy is just the engine. The profits build free schools. Graduates leave with land, a house, production facilities, skills to make anything. Pure merit selection.

I'm not asking you to slap your name on something you haven't checked out. Just — would you read The Jeffy Manifesto and tell me if it's worth making some magic together?

You turned a bus ticket into an empire. I'm trying to do something similar — except the destination is a new system for South Africa.

Let's make the impossible possible,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'BigmanKG': {
    subject: "Thomas the street vendor gave his stock away FREE — that's the model",
    body: `Hey Keegan,

Bro, that video with Thomas the street vendor broke me.

You asked the price of snacks — R4. Then you handed him R100. Then R2,000. Then R10,000 for everything. And what did Thomas do? Started giving his stock away FREE to strangers.

That's not just content. That's proof. When you give to people, they don't hoard it. They pass it on. Kindness multiplies.

They call you the Mr Beast of South Africa, but honestly I think that undersells it. You're not just throwing money around — you're demonstrating Ubuntu in real time. "I am because we are." Generosity creates more generosity.

You're 24 with nearly 8 million followers. Started at 18 with a phone and a belief that kindness could go viral. Now you're running #Car4Brian and trying to help an amputee walk again.

Here's why I'm reaching out. I'm building something based on the exact principle you've proven. Jeffy Commerce has a "wants" system — 10 people agree they want something, they get it free. Zone Partners keep 50% of profits. Real money going back to real people.

But Jeffy is just the engine. The profits build free schools. Kids selected on pure merit. Graduates leave with land, a house, skills to make everything they need. They become self-sufficient, then lift up the next generation.

The multiplier effect. What you show in one video with Thomas — I want to build into a permanent system.

Read The Jeffy Manifesto. If it feels right, let's talk.

Keep spreading kindness,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Pearl Modiadie': {
    subject: "You gave R250,000 back to Tembisa — all of it",
    body: `Hey Pearl,

You grew up in a shack in Xubeni, Tembisa, until you were nine. Lost your mom at 19. You've said the only way out was throwing yourself into school — you saw where you were and knew education was the path forward.

And then — youngest-ever host of the Sunday Times Generation Next awards. 17 years in media. Speaking out about harassment when it would've been easier to stay quiet. Building your dad a house.

But the thing that really got me? When you won R250,000 on Deal or No Deal, you gave every cent to Tshepang Care Centre. In Tembisa. Your hometown.

Not some of it. All of it. Back to where you came from.

You said it was personal and faith-driven. More than a game. I get that pull — the feeling that you have to give back to the place that made you.

My family built a school once. For farm kids who walked 30km just to learn. Corruption killed it. I've spent years trying to figure out how to build something they can't destroy.

Jeffy Commerce puts money back in people's hands — Zone Partners keep 50% of profits. When 10 people agree they want a product, they get it free. But that's just the engine. The profits build free schools where kids are selected on pure merit and graduate with land, a house, and skills to be completely self-sufficient.

You once said: "Own your story. Wear your scars with pride." This is me owning mine.

Read The Jeffy Manifesto. If it speaks to the part of you that gave R250,000 back to Tembisa, I'd really appreciate a chat.

Much respect,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Linda Mtoba': {
    subject: "Before she was conceived, you wanted a different life for her",
    body: `Hey Linda,

You shared something once that I haven't been able to shake — waiting all day for your father to call on your birthday. He never did. Your mom was 23, dealing with abandonment while raising you. He didn't just hurt her. He hurt you too.

And then you grew up in Umlazi. Lost him at 13. Became a qualified isiZulu teacher. Ended up one of the most recognizable faces on South African TV. Work with Dignity Dreams getting reusable pads to the 4 million SA girls who miss school every month. Founded the Linda Mtoba Foundation during COVID to hand out bursaries.

500 applications came in. You gave 10 bursaries to top KZN schools. And you said it was only the beginning.

But here's what really hit me — what you said about raising your daughter: "Before she was even conceived, I knew I wanted a different life for her. I want my daughter to do as little unlearning as possible."

Breaking generational patterns. That's exactly what I'm trying to build a system for.

Jeffy Commerce treats people fairly — Zone Partners keep 50% of profits. But that's just the engine. The profits build free schools where kids are picked on merit alone and graduate with land, a house, and skills to build a different life.

You said: "I am a Black woman from Umlazi. What are the odds? I do this for other young girls who look like me."

I want to build a system where those odds don't matter anymore. Where coming from a township is an opportunity, not an obstacle.

Read The Jeffy Manifesto. If it resonates with the woman who started a bursary program in the middle of a pandemic, I'd be grateful for a conversation.

For the girls from the townships,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Mihlali Ndamase': {
    subject: "Independent sustainability — not charity, not dependency",
    body: `Hey Mihlali,

Your dad was a doctor who lived abroad. In 2018, when you were 22, he died by suicide. You have a semicolon tattoo behind your ear — the story isn't over, mental health matters, even the darkest moments can become something meaningful.

Raised by your grandmother, mom, and aunt. Started watching American beauty YouTubers at 15. Started creating at 20. Within three videos brands were reaching out. Forbes 30 Under 30 by 24. Over 2 million on Instagram. Treasury Designs with your mom. Malakyt connecting beauticians with clients.

But what caught my attention was Siyasizana Foundation — "To provide long-term assistance that allows for independent sustainability." Not handouts. Sustainability. Independence.

You've been open about navigating toxic situations and choosing healing. You said being in a hurry to hit milestones leads to disappointment — better to put your head down and perfect your craft than chase small wins.

That's exactly the principle I'm building around. Jeffy Commerce treats people fairly — Zone Partners keep 50% of profits. But the real goal is bigger. The profits build free schools where kids are selected on pure merit and graduate with land, a house, and skills to manufacture everything they need.

Independent sustainability. Not charity. Not dependency. True self-sufficiency, passed from one generation to the next.

You said: "Be authentic — you'll only be a lousy version of someone else if you try to be something you're not." This letter is as authentic as I know how to be. This is my vision. This is my calling.

Read The Jeffy Manifesto. If Siyasizana's mission of independent sustainability clicks with what I'm trying to build, I'd love the chance to talk.

With authenticity,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },


  // ========== NEW 20 (from jeffy_letters_new20.docx) ==========

  'Taddy Blecher': {
    subject: "From millionaire actuary to free education — I need to learn from you",
    body: `Hey Taddy,

I'm going to be honest with you — when I found out what you've built, I couldn't believe someone hadn't sent me to you years ago.

You were a millionaire actuary with tickets to America in 1995. But driving through the townships changed everything. You unpacked your bags and spent four years in Alexandra. And when you realized graduates were ending up back on the streets, you founded a free university with "no buildings, no books, no money, no teachers, no computers — nothing."

Now? 600,000+ South Africans trained. 19,000+ graduates collectively earning R100M+ annually. 5,000+ businesses created. The "Learn and Earn" model where students literally build and maintain the institution while studying.

You're already doing what I've been dreaming about.

Here's my version: Jeffy Commerce is a platform that funds free schools. Students are selected on pure merit. When they graduate, they leave with one hectare of land, a house they built themselves, and skills to manufacture everything they need. The schools become self-sustaining communities.

My family built a school once. Corruption killed it. Your model is corruption-proof because it doesn't depend on outside funding — the community sustains itself.

I'd love to learn from you. Pick your brain. Maybe find ways our visions can support each other.

The Jeffy Manifesto is attached. Would love your thoughts on it — from someone who's actually built what I'm trying to build.

With serious respect,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Sizwe Nxasana': {
    subject: "From FirstRand CEO to PhD in education at 67 — that tells me everything",
    body: `Hey Sizwe,

You ran FirstRand for 10 years. Telkom for 8. One of the first 10 Black chartered accountants in South Africa. And then you "retired" — only to start a PhD in Project-Based Learning. At 67. Finished it in May 2025.

That tells me everything I need to know about where your heart is.

You founded KZN's first Black audit firm in 1989. Built an empire. Then walked away to transform education. Sifiso Learning Group. Future Nation Schools. An "African-centred education ecosystem" where kids learn by doing real projects.

That's exactly what I'm building. Jeffy Commerce is a platform that funds free schools. Students selected on pure merit. When they graduate: one hectare of land, a house they built themselves, skills to manufacture food, tech, clothes, everything.

Project-based learning taken to its logical conclusion — not just learning by doing projects, but learning by building an entire life.

My family built a school once for farm kids. Corruption killed it. Your model — learning by doing, African-centered, self-sustaining — is the antidote.

I'd love your perspective on The Jeffy Manifesto. Coming from someone who left a corporate throne to get a PhD in education, I can't think of anyone better to critique what I'm building.

Grateful for your time,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  // Alias for Dr Sizwe Nxasana
  'Dr Sizwe Nxasana': {
    subject: "From FirstRand CEO to PhD in education at 67 — that tells me everything",
    body: `Hey Sizwe,

You ran FirstRand for 10 years. Telkom for 8. One of the first 10 Black chartered accountants in South Africa. And then you "retired" — only to start a PhD in Project-Based Learning. At 67. Finished it in May 2025.

That tells me everything I need to know about where your heart is.

You founded KZN's first Black audit firm in 1989. Built an empire. Then walked away to transform education. Sifiso Learning Group. Future Nation Schools. An "African-centred education ecosystem" where kids learn by doing real projects.

That's exactly what I'm building. Jeffy Commerce is a platform that funds free schools. Students selected on pure merit. When they graduate: one hectare of land, a house they built themselves, skills to manufacture food, tech, clothes, everything.

Project-based learning taken to its logical conclusion — not just learning by doing projects, but learning by building an entire life.

My family built a school once for farm kids. Corruption killed it. Your model — learning by doing, African-centered, self-sustaining — is the antidote.

I'd love your perspective on The Jeffy Manifesto. Coming from someone who left a corporate throne to get a PhD in education, I can't think of anyone better to critique what I'm building.

Grateful for your time,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Stacey Brewer': {
    subject: "World's Best School — 78% of SA Grade 4s can't read, you said 'I'll fix it'",
    body: `Hey Stacey,

"World's Best School" — SPARK Soweto 2023. 24 schools. 15,000+ students. Forbes Africa cover. And the stat that got me: 78% of South African 4th graders can't read for meaning. You saw that and said "I'm going to fix this myself."

Your MBA thesis became SPARK Schools. Government school prices, private school quality. Blended learning. First in Africa. Benchmarking against UK literacy and Singapore math.

"Rather than wait for others to effect positive change, we decided to make a mark on our own." That sentence could've been pulled straight from my own manifesto.

Here's what I'm building. Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with one hectare of land, a house they built, skills to manufacture everything they need. The schools become self-sustaining communities.

You've proven you can scale quality affordable education. I'm trying to take it one step further — not just education, but complete self-sufficiency.

I'd love your thoughts on The Jeffy Manifesto. What am I missing? What would you do differently? You've actually built something at scale — I'm just getting started.

Making a mark,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Rapelang Rabana': {
    subject: "There will never be enough jobs — we must become entrepreneurs",
    body: `Hey Rapelang,

Forbes Africa cover before 30. WEF Young Global Leader. Oprah's O Power List. Co-founded Yeigo at 22 — South Africa's first VoIP mobile service. Sold it to a Swiss company. Could've retired.

Instead, you pivoted to education. Rekindle Learning. Imagine Worldwide, serving 7 African countries. Tablet-based literacy for kids who'd otherwise never get access.

You said something that stuck: "There will never be enough jobs for all the young people today — more and more of us must become entrepreneurs."

That's exactly the philosophy behind what I'm building. Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with land, a house they built, and skills to manufacture everything they need. Not trained for jobs — trained to CREATE jobs. Trained to build their own lives.

You're already using tech to democratize learning. I'm trying to take that further — not just literacy, but complete life skills. Food, medicine, technology, housing.

I'd love your take on The Jeffy Manifesto. Especially the tech integration possibilities. How do we reach more kids faster?

Building the future,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Kent Cooper': {
    subject: "Regenerative free ecological societies — you wrote my manifesto",
    body: `Hey Kent,

30+ years of permaculture. 27+ design courses. Gardens for Africa. Berg-en-Dal Farm. Now Oudeberg — 600 hectares in the Klein Karoo. Teaching people to grow food, generate electricity, harvest water.

You wrote something that hit me hard: "We can design regenerative free ecological societies that provide everything humans need to live harmoniously and abundantly on earth."

That's exactly what I'm trying to build. No exaggeration.

Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with one hectare of land, a house they built, and skills to manufacture everything they need — food, energy, water systems, the lot.

The difference between what you've proven works and what most "alternative education" looks like... is everything. You're in the Klein Karoo making it happen in real conditions, not on PowerPoint slides.

I need your expertise in my schools. Permaculture needs to be a core part of the curriculum. Would you consider being an advisor? Or at least reading The Jeffy Manifesto and telling me what I'm getting wrong?

Designing reality,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Rose Williams': {
    subject: "Food sovereignty — people having control over their food",
    body: `Hey Rose,

You won a landmark court case against the South African government on GMO information access. You work with smallholder farmers — mainly women — in northern KwaZulu-Natal. Food sovereignty. Seed saving. Farmer-managed seed systems.

Your organization's ethos: "Ensure that people have control over their food, agricultural processes and resources." That's not a slogan. That's a manifesto.

It's also exactly what I'm building.

Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with land, a house they built, and skills to manufacture everything they need — including growing and preserving their own food. Seed sovereignty. Complete self-sufficiency.

The knowledge you're preserving and teaching is exactly what needs to be in our curriculum. Indigenous agricultural practices. Food sovereignty. Control over resources.

Would you consider reading The Jeffy Manifesto? I'd love your perspective on how to weave agroecology and food sovereignty into the core of what we're building.

Fighting for food freedom,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Joe Matimba': {
    subject: "25+ school food gardens in Limpopo — you already have the curriculum",
    body: `Hey Joe,

35+ years in greening initiatives. 18 years at Food & Trees for Africa. Now Make Africa Green. And here's the part that really got me: 25+ sustainable school food gardens in Limpopo's most disadvantaged schools.

You're teaching permaculture design, soil prep, seed propagation, composting, water conservation, crop rotation. In actual schools. Making it work.

This is exactly what I need.

I'm building Jeffy Commerce to fund free schools. Merit-only selection. Graduates leave with one hectare of land, a house they built, and skills to manufacture everything — including growing their own food. The schools become self-sustaining communities.

You already have the curriculum. You already have the track record. You've made 25+ school food gardens work in real conditions, not theory.

I'd love your input on The Jeffy Manifesto. Even more — I'd love to talk about how your expertise could shape the food sovereignty component of what we're building.

You said: "We can achieve a lot if corporates, Foundations, NGOs, CBOs and individuals work together. Let's make our mother Earth a better place for our future generation." Let's do exactly that.

For our future generation,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Terra-Khaya': {
    subject: "You built an off-grid eco-lodge from nothing — I need that for my schools",
    body: `Hey Shane and Carrie,

You built an entire eco-lodge from natural and salvaged materials. 100% off-grid. Cob construction. Mud bricks. Earthbags. Cordwood. Wattle and daub. Zero waste. In Hogsback.

And you run 10-day workshops teaching others how to do it. Foundations, structure, roofing, cob ovens, rocket stoves. Real skills. Real buildings.

This is literally what I need for my schools.

Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with one hectare of land, a house they built themselves, and skills to manufacture everything they need. The "house they built themselves" part? That's where you come in.

I don't want students building with expensive imported materials. I want them building with what's around them. Natural. Sustainable. Beautiful. Like what you've created at Terra-Khaya.

Would you read The Jeffy Manifesto and tell me if this is something you'd want to be part of? Even as advisors or curriculum consultants. Your building skills program is exactly what we need to teach the next generation.

You said: "We aim, through our methods of living and building, to be an example that conscious living and respect for Mother Earth is something mutually simple and rewarding." I want that to be the ethos of every Jeffy school.

Building with the earth,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },


  'Off-Grid Strength': {
    subject: "Sold everything, lived from your car — your journey IS the curriculum",
    body: `Hey Carenna and Charné,

You sold everything in Cape Town. Lived from your car for 3 months searching for land. Now you're in rural Eastern Cape building a homestead from scratch — and documenting the whole thing, two videos a week.

That's incredibly relatable. You're not trust fund kids pretending to rough it. You're showing the real journey — starting with nothing, figuring it out as you go.

And you're already training kids in your community. Food gardens. Sustainable systems. The "Enough Garden" philosophy.

Here's why I'm reaching out. Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with land, a house they built, skills to manufacture everything they need. Complete self-sufficiency.

Your journey IS the curriculum. How to start with nothing. How to build your own life. How to help your neighbors. How to document and share it so others can follow.

Would you read The Jeffy Manifesto? I'd love to talk about how your real-world experience — not theory, actual lived experience — could shape what we teach.

You said: "We are motivated to expand this concept throughout rural South African communities so that food insecurity can be decreased in sustainable and empowering ways." That's exactly what I'm trying to scale.

Building strength,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Mamphela Ramphele': {
    subject: "Psycho-social liberation as prerequisite — you knew this 50 years ago",
    body: `Dear Dr. Ramphele,

You co-founded the Black Consciousness Movement with Steve Biko. You've been detained under the Terrorism Act. Banned for 7 years. Then went on to become Vice-Chancellor of UCT and Managing Director of the World Bank.

But what struck me most was this: Black Consciousness identified psycho-social liberation as a prerequisite for true emancipation. The external struggle means nothing if we haven't freed our own minds.

You've said: "Though different people occupy the seats of government today, many of them are corrupt like their predecessors. The government may have changed, but the people in it have not undergone the human revolution required."

That's why I'm not waiting for government. Jeffy Commerce funds free schools outside any system that can be corrupted. Merit-only selection. Graduates leave with land, a house they built, and skills to manufacture everything they need. Complete self-sufficiency. Complete freedom.

You founded LEAP Schools. You understand what it takes to build alternative education. The Jeffy Manifesto takes that further — not just education, but entire self-sufficient communities.

I would be deeply honored if you would read The Jeffy Manifesto and share your thoughts. From someone who has fought for liberation for 50+ years, your perspective would mean everything.

With profound respect,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Lindiwe Matlali': {
    subject: "800,000 kids trained — children need to know they matter",
    body: `Hey Lindiwe,

Orphaned young. Founded Africa Teen Geeks in 2014 after meeting an 8-year-old US coder who'd built her own app. Realized IT was only taught from grade 10, only in rich schools. Said "I'm going to fix this."

Now? 800,000+ kids trained. Presidential 4th Industrial Commission. MS at Columbia. Graduate certificate at Stanford. Africa's largest computer science NGO.

"Children need to know that they matter." That sentence broke me.

Here's what I'm building. Jeffy Commerce funds free schools. Merit-only selection — so no child is left behind because of money. Graduates leave with land, a house they built, and skills to manufacture everything they need — including technology.

Coding is part of that. But I'm going further — manufacturing tech, not just using it. Building computers, not just programming them. Real physical and digital skills combined.

Would you read The Jeffy Manifesto? Your work in townships and rural areas is exactly who these schools are for. I'd love your thoughts on how coding and tech skills fit into a self-sufficiency curriculum.

Raising little Marian Croaks,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Thabo Mbeki Foundation': {
    subject: "African Renaissance — African solutions to African challenges",
    body: `Dear Foundation Team,

The Thabo Mbeki Foundation's mission is to "catalyse Africa's Renaissance through progressive African solutions." Ubuntu philosophy. Excellence. Innovation. African solutions to African challenges.

That's exactly what I'm trying to build.

Jeffy Commerce is a South African platform that funds free schools. Merit-only selection. Graduates leave with land, a house they built, and skills to manufacture everything they need — food, tech, medicine, housing. Complete self-sufficiency. Not dependent on outside funding or government systems.

An African solution to the African challenge of education, employment, and housing. Starting in South Africa, designed to expand across the continent.

The Jeffy Manifesto is attached. I would be honored if someone on your team could review it and let me know if there's any alignment with the Foundation's work.

African Renaissance isn't just a vision. It's something we have to build.

For Africa's Renaissance,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Luvuyo Rani': {
    subject: "Car trunk in 2004 to 43+ branches — we don't need handouts",
    body: `Hey Luvuyo,

Started selling computers from your car trunk in 2004. Now? 43+ branches across three provinces. Schwab Foundation recognition. Stanford Seed program. WEF 2018.

But what got me was this — in 2022 you stepped back from running Silulo to start the Silulo Foundation's 6-month entrepreneurship programme. Teaching others to do what you did.

You said: "We don't need any more handouts, we just need to work together. It's time for Africa to rise and set the agenda for the rest of the world."

That's exactly the ethos of what I'm building. Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with land, a house they built, and skills to manufacture everything they need. Not handouts. Ownership. Self-sufficiency.

Your "one-stop shop" model — training, equipment, support — mirrors what I want for each graduate. Complete ecosystem, not just one piece.

Would you read The Jeffy Manifesto? Coming from someone who built an empire from a car trunk in the townships, your perspective would be invaluable.

Africa rising,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Bulelani Balabala': {
    subject: "Brought incubation HOME — double transport fare kills dreams",
    body: `Hey Bulelani,

Dropped out after Grade 9 because there was no money. Started selling sweets and fat cakes. Opened an internet café. Built IAF Brands from your mother's garage. Now? 100,000+ entrepreneurs impacted. 400,000+ jobs contributed to. TEA network across townships. President Ramaphosa recognition.

And you said something that hit me: "Where will a struggling entrepreneur get money from for a double transport fare to the suburbs to be mentored? We've brought incubation home."

That's exactly what I'm trying to do. Bring it home. Not ask people to come to us. Go to them.

Jeffy Commerce funds free schools built IN communities. Merit-only selection. Graduates leave with land, a house they built, and skills to manufacture everything they need. Township kids becoming self-sufficient manufacturers, not waiting for jobs that don't exist.

Your Kasi Business Workshops could fit right into this. Practical training, hands-on skills, R2.5 million+ directly distributed. You've already proven the model works.

Would you read The Jeffy Manifesto? I'd love to talk about how TEA's approach could integrate with what we're building.

Bringing it home,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Bushra Razack': {
    subject: "Abandoned cement factory to complete community — you built my vision",
    body: `Hey Bushra,

You represented South Africa at the World Youth Congress in Hawaii when you were 12. Then you turned an abandoned cement factory in Philippi into... everything. 80+ tenants. Sports facilities. Film studios. Urban farms. Amphitheatre.

A complete community ecosystem. Exactly what I'm trying to build.

You said: "It's my job to work with people who live in the community that I work in, to learn from them. They are the experts."

That's the philosophy I want for Jeffy schools. Communities building for themselves, not outsiders imposing solutions.

Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with land, a house they built, and skills to manufacture everything they need. Each school becomes a self-sustaining village — like Philippi Village, but designed from scratch.

Would you read The Jeffy Manifesto? You've already built what I'm envisioning — I'd love to learn from how you did it.

Forty Under 40 Africa Award for Best Leader in Social Enterprise 2024 — you know how to build something real.

Learning from the community,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Thato Kgatlhanye': {
    subject: "Waste into education — 400,000 plastic bags became school bags",
    body: `Hey Thato,

You were 18 when you started Rethaka with your childhood friend. 21 when you launched backpacks made from upcycled plastic with built-in solar technology. 400,000+ plastic bags recycled. 30+ jobs for women. 30,000 bags distributed.

You literally turned waste into education. Gave kids in townships a way to study after dark.

You said something that stuck with me: "You can start with nothing and create so much more than you can even imagine. And all it takes is the willingness to show up."

That's the message I want every student in my schools to internalize.

Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with land, a house they built, and skills to manufacture everything they need. And yes — manufacturing from local and waste materials is part of the curriculum.

Your story proves manufacturing creates township jobs. It proves waste can become value. It proves you don't need fancy materials to build something world-class.

Would you read The Jeffy Manifesto? I'd love your perspective on manufacturing, upcycling, and what it really takes to build something from nothing.

Showing up,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },


  'Motsepe Foundation': {
    subject: "Land WITH skills — exactly what you've been building",
    body: `Dear Dr. Motsepe,

Your father ran a spaza shop in Soweto. You became the first Black partner at Bowman Gilfillan. First African to sign the Giving Pledge. Built an empire. And then pledged R3.5 billion toward providing rural communities land WITH skills and resources for sustainable farming.

That last part is exactly what I'm trying to do. Not just land. Land WITH skills AND resources.

Jeffy Commerce is a platform that funds free schools. Merit-only selection. Graduates leave with one hectare of land, a house they built themselves, and skills to manufacture everything they need — food, tech, medicine, housing. Complete self-sufficiency.

Your land reform approach is the model. Providing land without skills creates dependency. You understood that. I want to take it further — not just farming skills, but manufacturing skills. Complete independence.

The Jeffy Manifesto is attached. If there is any alignment between what I'm building and the Motsepe Foundation's work, I would be deeply honored to have that conversation.

You've already committed over $2 billion to building South Africa. I'm not asking for funding — I'm asking if you'd read the vision and tell me if it's worth pursuing.

With deep respect,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Francois van Niekerk': {
    subject: "30% vow became 70% — true success is serving one another",
    body: `Dear Mr. van Niekerk,

Your company was nine months old and facing insolvency in 1980. You prayed and vowed to donate 30% if it survived. Within hours, circumstances changed. You honored that vow — eventually giving 70% of your equity (~$170 million) to Mergon Foundation.

"My definition of success turned 180 degrees... true success is measured by how well we honor our principles and serve one another."

That sentence could have come from my own manifesto.

What caught my attention was Mergon's Skills Schools — barista training, coding, construction, baking, beauty. Practical skills. Not theory. Sozo Foundation teaching construction and trade skills.

I'm building something in that exact spirit. Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with land, a house they built, and skills to manufacture everything they need. The construction training aligns perfectly.

The Jeffy Manifesto is attached. If there's alignment between what I'm building and Mergon's "feed the stream of life" philosophy, I would be honored to have that conversation.

Feeding the stream,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Trevor Noah Foundation': {
    subject: "Trevor's favorite toy was a brick — Faranani builds schools",
    body: `Dear Foundation Team,

Trevor's favorite childhood toy was a brick. He couldn't afford real toys. His book "Born a Crime" captures what growing up in Soweto really looked like.

But what got my attention was the Faranani Infrastructure Project. Youth who are "not in employment, education or training" BUILD school infrastructure while receiving skills training, work experience, and career development.

They're not just learning. They're building. And what they build is a school for others.

That's exactly the philosophy behind what I'm creating. Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with land, a house they built themselves, and skills to manufacture everything they need.

"Faranani" — working together. That's what I want for every Jeffy community. Students building the infrastructure, learning by doing, then helping the next generation.

Trevor said: "Kids of today are being told to be the leaders of tomorrow, but they're not given the tools. We tell people to follow their dreams, but you can only dream of what you can imagine."

Jeffy schools expand what kids can imagine. The Jeffy Manifesto is attached. If there's any alignment with the Foundation's work, I'd love to explore it.

Working together,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  // ========== NEW LETTERS (from my research) ==========

  'Siyanda Calvin Ntenga': {
    subject: "14 years of school shoes and boreholes — you're already doing this",
    body: `Hey Siyanda,

You started donating school shoes through drives. Then you thought — why not make my own brand? Now Ntenga School Shoes manufactures from scratch. The Ntenga Foundation has been supporting communities for 14 years. Started with uniforms, evolved to boreholes and sanitation for schools in need.

And when that 22-year-old poultry farmer Sne Ngubane had 174 chickens killed by saboteurs, you launched the campaign that raised R10,260 and got her 1,000 new chicks. Ubuntu in action.

You run Comrades to overcome challenges. You said: "The first time I ran Comrades, it transformed me. It reminded me that I'm capable of overcoming anything."

Here's why I'm reaching out. I'm building Jeffy Commerce — a platform that funds free schools. Merit-only selection. Graduates leave with land, a house they built, skills to manufacture everything they need.

You're already building school infrastructure. You're already manufacturing products. You're already proving the model works.

Would you read The Jeffy Manifesto? I think we might be building toward the same thing from different angles.

You said: "When I sit at powerful tables, I speak for the voiceless." So do I. Let's speak louder together.

Keep running,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Thulani Madondo': {
    subject: "One-room shack, no electricity — now 1,400 kids have hope",
    body: `Hey Thulani,

You were born in a one-room shack in Kliptown. No electricity. No running water. Seven siblings. Your older siblings all had to drop out of high school. You washed cars and worked as a stock boy just to stay in school. Became the first in your family to graduate.

Then you came back. 2007, you and some friends who grew up in Kliptown decided to change it. "We know the problems of this community, but we also know the solutions."

Now? 1,400+ children. 21+ university graduates. CNN Hero. 17 years of pulling kids out of poverty. Your motto: "Pull up your own socks."

That's exactly what I'm building. Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with land, a house they built, skills to make anything they need. Not charity. Self-sufficiency. "The only thing you owe us is your success."

You said: "Living in Kliptown... I wouldn't wish it on my worst enemy. We are simply trying to survive." I want to build something so kids don't just survive — they thrive.

Would you read The Jeffy Manifesto? You've spent 17 years proving this model works. I want to scale it.

Pulling up our socks,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'James Urdang': {
    subject: "Walter Sisulu mentored you, Mandela trusted you — 32 years later",
    body: `Hey James,

You were 27 years old, nervous, walking into Shell House to meet Walter Sisulu. You had an idea to twin schools — help poor schools benefit from rich schools. Sisulu put you at ease. That hour became 12 years of mentorship until his passing.

You had dyslexia and ADHD. Struggled through school. Sports kept you going. Then you founded Education Africa in 1992 — 32 years ago.

Mandela entrusted you with the "No Easy Walk to Freedom" video before his UN speech. You presented him the Golden Doves of Peace Award. You spoke at Chris Hani's funeral when South Africa was on edge.

You wrote: "The biggest challenge has always been sustainability... my dream is to create an endowment fund so Education Africa can be self-sustainable for generations."

That's exactly what I'm building. Jeffy Commerce is the engine. E-commerce profits fund free schools perpetually. Merit-only selection. Graduates leave with land, a house they built, skills to manufacture everything.

Self-sustainable. Forever. No more dependency on donations.

Would you read The Jeffy Manifesto? After 32 years of building Education Africa, you know what works and what doesn't. I need that wisdom.

With deep respect for your life's work,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'IkamvaYouth': {
    subject: "80-100% pass rates since 2005 — township average is 10%",
    body: `Dear Joy and the IkamvaYouth Team,

Joy went to a privileged school in Pietermaritzburg. Makhosi went to a township school in Khayelitsha. You compared experiences at HSRC and realized the gap was about information and support — things that can be given free.

2003, you started tutoring. 2005, your first matrics graduated — 100% pass rate, 65% university eligible. Township average was less than 10%. You were aiming for 30%.

Now? 17 branches. 5 provinces. 80-100% matric pass rates every year since 2005. Students returning as tutors. Peer-to-peer learning that actually works.

"Ikamva lisezandleni zethu" — the future is in our hands.

Here's what I'm building. Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with land, a house they built, skills to manufacture everything they need. Each one teaches the next. Peer-to-peer at life scale.

Your model proves it works. I want to take it further — not just academic support, but complete self-sufficiency.

Would your team read The Jeffy Manifesto? I'd love to explore how IkamvaYouth's methodology could shape what we teach.

The future is in our hands,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },


  'Bonang Matheba': {
    subject: "You dropped out for your career — 300 girls won't have to",
    body: `Hey Bonang,

You dropped out of UJ to pursue your TV career. Your parents weren't thrilled. But you proved them wrong — Live Amp, Top Billing, Metro FM, Revlon, Forbes, House of BNG. First black South African on Glamour cover. First SA host of MTV EMA pre-show.

But here's what got me: the Bonang Matheba Bursary Fund. 300 girls through tertiary education by 2025. Because of #FeesMustFall. Because you knew what it felt like to have education threatened by fees.

You fought for years to keep House of BNG. Ownership matters to you. Control of your own narrative.

That's exactly what I'm building. Jeffy Commerce gives Zone Partners 50% profit ownership. But that's just the engine. ALL profits fund free schools. Merit-based. Graduates get land, skills, independence.

300 girls through bursaries is incredible. What if we could reach 3,000? 30,000? What if no girl ever had to drop out because of fees again?

Would you read The Jeffy Manifesto? One Instagram story from you could change everything.

With respect for what you've built,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Connie Ferguson': {
    subject: "Ferguson Foundation + Jeffy Schools = legacy that outlives us",
    body: `Hey Connie,

The Ferguson Foundation was your vision with Shona — create tomorrow's dreams today. Empower in business, education, film. Film school for upcoming filmmakers. Scholarships for disadvantaged students. Mentorship twice a year.

You launched it in August 2022, dedicating it to Shona's memory after losing him to COVID in 2021. That takes incredible strength.

"We want to provide them with opportunities to learn, develop and strengthen their core life skills." That's exactly what I'm building.

Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with land, a house they built, skills to manufacture everything they need. Not just film — food, tech, medicine, construction. Complete self-sufficiency.

What Ferguson Films has done for South African entertainment — telling our stories — I want to do for education. Build something that lasts.

Would you read The Jeffy Manifesto? I'd love to explore how the Ferguson Foundation's work in education could align with what we're building.

Creating tomorrow's dreams today,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Aisha Pandor': {
    subject: "30,000 jobs for women — let's create 30,000 more futures",
    body: `Hey Aisha,

SweepSouth created 30,000+ jobs for women who needed them. You proved tech can be a force for inclusion, not just disruption.

I'm Tredoux from Jeffy Commerce. We're taking a similar approach to education:

• E-commerce platform with Zone Partners (50/50 profit split)
• ALL profits fund FREE merit-based schools
• Graduates get land, skills, production facilities
• Focus on creating self-sufficient communities

You understand building platforms that create opportunity at scale. That's exactly what we need guidance on.

Would you be open to a conversation? Specifically around:
• How you scaled SweepSouth's social impact
• Lessons learned in SA market
• Potential advisory relationship

15 minutes?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Boity Thulo': {
    subject: "#OwnYourThrone — help SA's next generation claim theirs",
    body: `Hey Boity,

You dropped out due to fees. Then you built an empire — music, business, 6 million followers, Forbes 30 Under 30. #OwnYourThrone isn't just a brand — it's your story.

But how many talented South Africans never got to own anything because there was no throne to claim?

I'm Tredoux from Jeffy Commerce. We're building free schools funded by e-commerce profits:

• Zone Partners deliver locally (50/50 profit split)
• ALL profits build merit-based schools
• Graduates get 1 hectare land + skills + independence

You know what it's like to have financial barriers almost end your journey. Your story could inspire thousands to either become Zone Partners or support our mission.

One IG story. One tweet. One conversation.

What would it take?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Sizwe Dhlomo': {
    subject: "2.5M people listen to you — one tweet could build schools",
    body: `Hey Sizwe,

You've got 2.5 million people paying attention to what you say. That's power. And from what I've seen, you use it thoughtfully.

I'm Tredoux from Jeffy Commerce. We're building free schools funded by e-commerce profits. Not charity. Not government. Just South Africans buying products, and those profits becoming classrooms.

Our model is simple:
• Zone Partners deliver locally (50/50 split)
• Profits build merit-based free schools
• Graduates get land + skills + independence

Here's my ask:

One tweet. That's it. If it resonates with you, one tweet about Jeffy Commerce could bring us hundreds of Zone Partner applications from people who want business ownership AND social impact.

No financial ask. Just attention from someone who has it.

Worth knowing more?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Dr Precious Moloi-Motsepe': {
    subject: "UCT Chancellor + R1.5B education commitment — aligned visions",
    body: `Dear Dr. Moloi-Motsepe,

As UCT Chancellor and CEO of the Motsepe Foundation, you sit at the intersection of tertiary excellence and primary/secondary access. You understand the full education pipeline.

I'm Tredoux Willemse, founder of Jeffy Commerce. We're building the funding mechanism for free schools:

• E-commerce profits fund merit-based FREE schools
• Graduates receive 1 hectare land + skills + facilities
• Self-sufficient communities producing food, tech, medicine

The Motsepe Foundation's R1.5 billion education commitment is transformative. Jeffy Commerce offers a self-sustaining complement: schools that fund themselves perpetually through commerce.

We would be honored to present our model to the Foundation team and explore potential alignment.

Respectfully,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Katlego Maphai': {
    subject: "Yoco built payment access — can we build education access together?",
    body: `Hey Katlego,

Yoco democratized payments for small businesses. You saw a gap — merchants excluded from the formal economy — and built a solution that now processes billions.

I'm building something similar for education. Jeffy Commerce funds free schools through e-commerce profits:

• Zone Partners (local entrepreneurs) keep 50% of profits
• ALL remaining profits build merit-based free schools
• Graduates get land, skills, complete self-sufficiency

You understand building infrastructure that empowers the underserved. That's exactly what we're doing — except the infrastructure is schools, and the underserved are kids who'd otherwise never get a shot.

Would you be open to a 15-minute conversation? I'd love your perspective on scaling social impact alongside business growth.

Building access,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Gugu Khathi': {
    subject: "Women of Impact Network — let's impact education together",
    body: `Hey Gugu,

Your Women of Impact Network has been connecting and empowering women across South Africa. You understand that real change comes through networks, not individuals.

I'm Tredoux from Jeffy Commerce. We're building something that could use a network like yours:

• E-commerce platform with Zone Partners (50/50 profit split)
• ALL profits fund FREE merit-based schools for girls AND boys
• Graduates get land, a house they built, skills for life

Zone Partners are local entrepreneurs — many of them women — who deliver products in their communities and keep real profit.

Would you read The Jeffy Manifesto? I'd love to explore how the Women of Impact Network could help us reach women who want to build businesses with purpose.

Creating impact,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Sarah Langa': {
    subject: "Fashion influence with purpose — help dress the future",
    body: `Hey Sarah,

Your fashion influence reaches millions. You've built a brand that stands for style, aspiration, and showing what South African women can achieve globally.

I'm Tredoux from Jeffy Commerce. We're building free schools funded by e-commerce profits. Merit-based selection. Graduates get land, skills, independence.

Here's why fashion matters:

One of the skills our graduates will learn is textile manufacturing. Imagine South African schools producing world-class fashion designers who can manufacture their own lines — from fabric to finished product.

Your platform could inspire that next generation. Show them what's possible.

Would you read The Jeffy Manifesto? Even one story about Jeffy Commerce could reach thousands of young people who need to know this opportunity exists.

Styling the future,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Mvelo Shandu': {
    subject: "From Michaelhouse chapel choir to Cash Converters GM — let's build schools",
    body: `Hey Mvelo,

I hope this message finds you well. My name is Tredoux, and I'm reaching out because your journey from the chapel choir and jazz band at Michaelhouse to becoming "Black Norris" with The Kiffness - and now leading Cash Converters Southern Africa - tells a story I deeply relate to.

I'm building Jeffy Commerce, a South African e-commerce platform with a purpose that goes beyond profit. Every rand we make goes toward building free, merit-based schools across South Africa. No fees. No connections needed. Just talent and drive.

Here's why I thought of you specifically:

You've lived the power of quality education. Those "endless hours" in Michaelhouse's chapel choir with Dave Scott didn't just create music - they created a 24-year friendship and one of SA's most beloved bands. That's what great schools do. They build people who build things together.

You've also shown what it means to use a platform for good. The Kiffness raising over R1.2 million for Ukraine, the SPCA donations - that's not just entertainment, that's activism through art. Jeffy is commerce as activism.

And now you're running franchises at Cash Converters. You understand how business systems work, how to scale, how to empower local operators. That's exactly the model we're building with Jeffy Zone Partners - local entrepreneurs running their own territories, keeping 50% of profits, building wealth in their communities.

I'm not asking you to invest money. I'm asking if you'd consider becoming a founding Zone Partner - someone who helps us prove this model works, whose story inspires others to join, and whose community benefits first when the schools start opening.

The first school will be on my family's farm in the Eastern Cape - land my ancestors settled generations ago. We're talking about kids who currently walk 30km to school getting world-class education, then graduating with land, housing, and the skills to manufacture what their communities need.

I'd love 20 minutes to share the full vision. If it resonates, amazing. If not, I respect that completely - and I'll still be streaming your music.

With respect and hope,

Tredoux Willemse
Founder, Jeffy Commerce
jeffy.co.za

P.S. - Your name means "nature" in Zulu. There's something poetic about someone named Nature helping us plant trees under whose shade we'll never sit.`
  },

};


// Default pitch for anyone without custom letter
const DEFAULT_PITCH = {
  subject: "Partnership Opportunity — Jeffy Commerce | Building Free Schools",
  body: `Hi [NAME],

I'm Tredoux Willemse, founder of Jeffy Commerce.

My family built a school once. For farm kids who walked 30km just to learn. Corruption killed it. I've spent years trying to figure out how to build something they can't destroy.

Here's what we're building:

Jeffy Commerce is a platform where Zone Partners — local entrepreneurs — own their territories and keep 50% of profits. Real ownership. Real money back in the community.

But that's just the engine. The profits build free schools where graduates walk away with land, a house they built, and skills to make anything they need. Selected on merit alone. No connections. No money. Just potential.

We're looking for partners who believe South Africans are the most capable people on the planet when given opportunity.

Would you be open to a 15-minute conversation?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za

"We plant trees under whose shade we'll never sit."`
};

// Day priority lists
const DAY1_NAMES = ['Taddy Blecher', 'Vusi Thembekwayo', 'Motsepe Foundation', 'Theo Baloyi', 'Lindiwe Matlali'];
const DAY3_NAMES = ['Sizwe Nxasana', 'Thulani Madondo', 'James Urdang', 'IkamvaYouth', 'Siyanda Calvin Ntenga', 'Stacey Brewer'];

const STATUS_OPTIONS = [
  { value: 'not_contacted', label: 'Not Contacted', color: 'bg-gray-100 text-gray-700' },
  { value: 'email_sent', label: 'Email Sent', color: 'bg-blue-100 text-blue-700' },
  { value: 'replied', label: 'Replied! 🎉', color: 'bg-green-100 text-green-700' },
  { value: 'meeting_scheduled', label: 'Meeting Set', color: 'bg-purple-100 text-purple-700' },
  { value: 'converted', label: 'Partner! 🚀', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-700' },
  { value: 'no_response', label: 'No Response', color: 'bg-orange-100 text-orange-700' },
];

export default function OutreachPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => { fetchInfluencers(); }, []);

  const fetchInfluencers = async () => {
    const { data } = await supabase
      .from('influencers')
      .select(`*, outreach_contacts (*)`)
      .order('priority', { ascending: true });
    if (data) setInfluencers(data);
    setLoading(false);
  };

  const getStatus = (inf: Influencer): string => {
    const contacts = inf.outreach_contacts || [];
    if (contacts.length === 0) return 'not_contacted';
    return contacts.sort((a, b) => 
      new Date(b.sent_at || 0).getTime() - new Date(a.sent_at || 0).getTime()
    )[0]?.status || 'not_contacted';
  };

  const updateStatus = async (id: string, status: string) => {
    const inf = influencers.find(i => i.id === id);
    const existing = inf?.outreach_contacts?.[0];
    
    if (existing) {
      await supabase.from('outreach_contacts').update({ status }).eq('id', existing.id);
    } else {
      await supabase.from('outreach_contacts').insert({
        influencer_id: id, status, sent_at: new Date().toISOString()
      });
    }
    fetchInfluencers();
  };

  const getPitch = (inf: Influencer) => {
    return PITCHES[inf.name] || {
      subject: DEFAULT_PITCH.subject,
      body: DEFAULT_PITCH.body.replace('[NAME]', inf.name.split(' ')[0])
    };
  };

  const getGmailLink = (inf: Influencer) => {
    if (!inf.email) return null;
    const pitch = getPitch(inf);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${inf.email}&su=${encodeURIComponent(pitch.subject)}&body=${encodeURIComponent(pitch.body)}`;
  };

  const copyPitch = async (inf: Influencer) => {
    const pitch = getPitch(inf);
    await navigator.clipboard.writeText(`Subject: ${pitch.subject}\n\n${pitch.body}`);
    setCopiedId(inf.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Opens Gmail WITHOUT changing status - you control status manually
  const openGmail = (inf: Influencer) => {
    const link = getGmailLink(inf);
    if (link) {
      window.open(link, '_blank');
    }
  };

  // Opens multiple Gmail tabs WITHOUT changing status
  const openBatchGmail = (names: string[]) => {
    const batch = influencers.filter(i => names.includes(i.name) && i.email);
    batch.forEach((inf, i) => {
      setTimeout(() => {
        const link = getGmailLink(inf);
        if (link) {
          window.open(link, '_blank');
        }
      }, i * 1500);
    });
  };

  // Save correspondence note
  const saveNote = async (id: string) => {
    const note = newNote[id]?.trim();
    if (!note) return;
    
    setSavingNote(id);
    const inf = influencers.find(i => i.id === id);
    const timestamp = new Date().toLocaleString('en-ZA', { 
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
    const newEntry = `[${timestamp}] ${note}`;
    const existingNotes = inf?.notes || '';
    const updatedNotes = existingNotes ? `${newEntry}\n---\n${existingNotes}` : newEntry;
    
    await supabase.from('influencers').update({ notes: updatedNotes }).eq('id', id);
    setNewNote({ ...newNote, [id]: '' });
    fetchInfluencers();
    setSavingNote(null);
  };

  // Filter influencers by search term
  const filteredInfluencers = influencers.filter(inf => 
    inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inf.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inf.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Categorize (use filtered list)
  const day1 = influencers.filter(i => DAY1_NAMES.includes(i.name));
  const day3 = influencers.filter(i => DAY3_NAMES.includes(i.name));
  const day5 = influencers.filter(i => !DAY1_NAMES.includes(i.name) && !DAY3_NAMES.includes(i.name));

  const day1Ready = day1.filter(i => i.email && getStatus(i) === 'not_contacted').length;
  const day3Ready = day3.filter(i => i.email && getStatus(i) === 'not_contacted').length;
  const day5Ready = day5.filter(i => i.email && getStatus(i) === 'not_contacted').length;

  const sent = influencers.filter(i => getStatus(i) === 'email_sent').length;
  const replied = influencers.filter(i => ['replied', 'meeting_scheduled', 'converted'].includes(getStatus(i))).length;
  const hasCustom = (name: string) => !!PITCHES[name];

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Rocket className="w-8 h-8 text-orange-500" />
          Influencer Outreach — {influencers.length} Contacts
        </h1>
        <p className="text-gray-600 mt-1">Personalized letters with soul — {Object.keys(PITCHES).length} custom pitches loaded</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border-2">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-3xl font-bold">{influencers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
          <p className="text-blue-600 text-sm">Sent</p>
          <p className="text-3xl font-bold text-blue-600">{sent}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
          <p className="text-emerald-600 text-sm">Replied</p>
          <p className="text-3xl font-bold text-emerald-600">{replied}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-green-200">
          <p className="text-green-600 text-sm">Custom Letters</p>
          <p className="text-3xl font-bold text-green-600">{Object.keys(PITCHES).length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, category, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl text-lg focus:border-orange-500 focus:outline-none"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-500">
            Found {filteredInfluencers.length} of {influencers.length} contacts
          </p>
        )}
      </div>

      {/* Strategy */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 mb-8 text-white">
        <h2 className="text-xl font-bold mb-4">📋 Staggered Outreach Strategy</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold">DAY 1 - Top Priority</span>
            </div>
            <ul className="text-sm space-y-1 mb-4">
              {DAY1_NAMES.map(name => {
                const inf = influencers.find(i => i.name === name);
                const status = inf ? getStatus(inf) : 'not_contacted';
                return <li key={name} className="flex items-center gap-2">
                  {status === 'not_contacted' ? '⚪' : status === 'email_sent' ? '🔵' : '🟢'}
                  <span className={status !== 'not_contacted' ? 'line-through opacity-60' : ''}>{name}</span>
                  {hasCustom(name) && <span className="text-xs text-green-400">✨</span>}
                </li>;
              })}
            </ul>
            <button onClick={() => openBatchGmail(DAY1_NAMES)} 
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg">
              OPEN {day1.filter(i => i.email).length} IN GMAIL
            </button>
          </div>

          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-orange-400" />
              <span className="font-bold">DAY 3 - Wave 2</span>
            </div>
            <ul className="text-sm space-y-1 mb-4">
              {DAY3_NAMES.map(name => {
                const inf = influencers.find(i => i.name === name);
                const status = inf ? getStatus(inf) : 'not_contacted';
                return <li key={name} className="flex items-center gap-2">
                  {status === 'not_contacted' ? '⚪' : status === 'email_sent' ? '🔵' : '🟢'}
                  <span className={status !== 'not_contacted' ? 'line-through opacity-60' : ''}>{name}</span>
                  {hasCustom(name) && <span className="text-xs text-green-400">✨</span>}
                </li>;
              })}
            </ul>
            <button onClick={() => openBatchGmail(DAY3_NAMES)}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg">
              OPEN {day3.filter(i => i.email).length} IN GMAIL
            </button>
          </div>

          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-bold">DAY 5 - Everyone Else</span>
            </div>
            <ul className="text-sm space-y-1 mb-4 max-h-32 overflow-y-auto">
              {day5.slice(0, 8).map(inf => {
                const status = getStatus(inf);
                return <li key={inf.id} className="flex items-center gap-2">
                  {status === 'not_contacted' ? '⚪' : status === 'email_sent' ? '🔵' : '🟢'}
                  <span className={status !== 'not_contacted' ? 'line-through opacity-60' : ''}>{inf.name}</span>
                  {hasCustom(inf.name) && <span className="text-xs text-green-400">✨</span>}
                </li>;
              })}
              {day5.length > 8 && <li className="text-slate-400">+{day5.length - 8} more...</li>}
            </ul>
            <button onClick={() => openBatchGmail(day5.map(i => i.name))}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg">
              OPEN {day5.filter(i => i.email).length} IN GMAIL
            </button>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm text-slate-300">
          <strong>✨ = Custom personalized letter</strong> from your docs. Others get a strong default pitch.
        </div>
      </div>

      {/* Contact List */}
      <h2 className="text-xl font-bold mb-4">All Contacts {searchTerm && `(filtered)`}</h2>
      <div className="space-y-3">
        {filteredInfluencers.map((inf) => {
          const status = getStatus(inf);
          const statusOpt = STATUS_OPTIONS.find(s => s.value === status)!;
          const pitch = getPitch(inf);
          const gmailLink = getGmailLink(inf);
          const isExpanded = expandedId === inf.id;
          const hasPitch = hasCustom(inf.name);
          const isDay1 = DAY1_NAMES.includes(inf.name);
          const isDay3 = DAY3_NAMES.includes(inf.name);

          return (
            <div key={inf.id} className="bg-white rounded-xl border shadow-sm">
              <div className="p-4 flex items-center gap-4">
                <div className={`w-2 h-14 rounded-full ${isDay1 ? 'bg-yellow-500' : isDay3 ? 'bg-orange-500' : 'bg-blue-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg">{inf.name}</span>
                    {isDay1 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Day 1</span>}
                    {isDay3 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Day 3</span>}
                    {!isDay1 && !isDay3 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Day 5</span>}
                    {hasPitch && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✨ Personal</span>}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                    {inf.category && <span className="bg-gray-100 px-2 py-0.5 rounded">{inf.category}</span>}
                    {inf.email && <span className="text-green-600 truncate max-w-[200px]">📧 {inf.email}</span>}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusOpt.color}`}>{statusOpt.label}</span>
                {inf.email ? (
                  <button onClick={() => openGmail(inf)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Open Gmail
                  </button>
                ) : <span className="text-gray-400 text-sm">No email</span>}
                <button onClick={() => copyPitch(inf)} className={`p-2 rounded-lg ${copiedId === inf.id ? 'bg-green-100' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {copiedId === inf.id ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
                <select value={status} onChange={(e) => updateStatus(inf.id, e.target.value)} className="px-2 py-1 border rounded text-sm">
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <button onClick={() => setExpandedId(isExpanded ? null : inf.id)} className="p-2 text-gray-500">
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>
              {isExpanded && (
                <div className="border-t p-4 bg-gray-50 grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-bold text-sm mb-2">📧 YOUR LETTER {hasPitch ? '(CUSTOM)' : '(DEFAULT)'}</h4>
                    <div className="bg-white border rounded-lg p-4 text-sm max-h-96 overflow-y-auto">
                      <p className="font-medium mb-2 text-orange-600">Subject: {pitch.subject}</p>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{pitch.body}</pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-2">📞 CONTACT INFO</h4>
                    <div className="bg-white border rounded-lg p-4 space-y-2">
                      {inf.email && <p><strong>Email:</strong> {inf.email}</p>}
                      {inf.phone && <p><strong>Phone:</strong> {inf.phone}</p>}
                      {inf.profile_url && <p><strong>Profile:</strong> <a href={inf.profile_url} target="_blank" className="text-blue-600 underline">{inf.profile_url}</a></p>}
                      <div className="pt-3 space-y-2">
                        {gmailLink && <a href={gmailLink} target="_blank" className="block w-full text-center px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">📧 Open in Gmail</a>}
                        {inf.email && <button onClick={() => updateStatus(inf.id, 'email_sent')} className="block w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold">✓ Mark as SENT</button>}
                        <button onClick={() => copyPitch(inf)} className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">{copiedId === inf.id ? '✓ Copied!' : '📋 Copy for LinkedIn/DM'}</button>
                        {inf.phone && <a href={`https://wa.me/${inf.phone.replace(/[^0-9]/g, '')}`} target="_blank" className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">💬 WhatsApp</a>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-2">📝 CORRESPONDENCE & NOTES</h4>
                    <div className="bg-white border rounded-lg p-4 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add note (e.g., 'Called, left voicemail')"
                          value={newNote[inf.id] || ''}
                          onChange={(e) => setNewNote({ ...newNote, [inf.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && saveNote(inf.id)}
                          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                        />
                        <button 
                          onClick={() => saveNote(inf.id)}
                          disabled={savingNote === inf.id || !newNote[inf.id]?.trim()}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 text-sm font-medium"
                        >
                          {savingNote === inf.id ? '...' : 'Add'}
                        </button>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {inf.notes ? (
                          <div className="text-sm space-y-2">
                            {inf.notes.split('\n---\n').map((entry, i) => (
                              <div key={i} className="p-2 bg-gray-50 rounded border-l-2 border-orange-300">
                                <pre className="whitespace-pre-wrap font-sans text-gray-700">{entry}</pre>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm italic">No notes yet. Add your first note above.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
