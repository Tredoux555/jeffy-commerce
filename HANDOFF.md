# JEFFY COMMERCE - HANDOFF DOCUMENT
**Last Updated:** January 2, 2026  
**Author:** Claude (with Tredoux)

---

## THE MISSION (Read This First)

Jeffy is NOT just an e-commerce platform. It's a **vehicle to fund revolutionary education in South Africa.**

Tredoux's family previously built a school for farm children in SA. **Corruption destroyed it.** The ultimate mission is to rebuild - creating self-sufficient educational communities where graduates receive:
- Land ownership
- Housing
- Production facilities
- Real opportunity

Every rand of profit from Jeffy goes toward this vision. Zone Partners aren't gig workers - they're the first wave of a movement.

**This context is critical. Without it, Jeffy looks like "another Chinese import store." With it, Jeffy is a cause.**

---

## THE MODEL (What Makes This Different)

### Demand-First / "Wants" System
```
Traditional e-commerce:  Buy inventory → Hope it sells → Eat losses on unsold stock
Jeffy model:             Customer WANTS something → We source it → They buy → Zero inventory risk
```

- Customers submit "wants" (product requests)
- Wants aggregate demand before any money is spent
- Only source products with validated demand
- **Cash flow positive from day one**

### Zone Partner System
- Local entrepreneurs own delivery zones
- **50/50 profit split** (vs Uber's exploitative 75/25 to platform)
- Not gig workers - actual business partners
- They recruit customers, handle last-mile delivery, build community trust
- Inactive partners cost nothing - no fixed overhead

### The 12-Month Pre-Launch Strategy
We are currently in **pre-launch phase**:
1. Collect wants (market research that converts to revenue)
2. Recruit Zone Partners (build distribution before needing it)
3. Curate product catalog from real demand
4. **Then pull the trigger** with both demand AND distribution ready

This isn't "waiting" - it's strategic preparation.

---

## CURRENT STATUS (January 2, 2026)

### What's Built & Deployed
| Component | Status | URL/Location |
|-----------|--------|--------------|
| Main platform | ✅ Production | https://jeffy.co.za |
| Zone Partner applications | ✅ Live | 4-step form process |
| Admin dashboard | ✅ Live | /admin |
| Wants system | ✅ Working | Customers can submit wants |
| Product catalog | ✅ Working | Curated from 1688 |
| Image analyzer | ✅ Working | Claude Vision for Chinese text detection |
| Send to Jeffy extension | ✅ Working | Chrome extension for 1688 imports |
| E2E tests | ✅ 62 passing | Full test coverage |

**Deployed on:** Railway  
**Database:** Supabase  
**Repo:** https://github.com/Tredoux555/jeffy-commerce

### What Just Happened
- **40 personalized influencer letters sent** to SA change-makers
- Each letter was deep-researched, referenced their achievements/ambitions
- Positioned Jeffy as vehicle for school mission, not product pitch
- **Currently waiting for responses** - high probability of engagement

### Key Metrics Targets
| Metric | Minimum | Target | Ideal |
|--------|---------|--------|-------|
| Wants collected | 100 | 500 | 1000+ |
| Zone Partners at launch | 5 | 20 | 60 |
| Pre-launch timeline | 6 months | 12 months | As needed |

---

## THE FINANCIALS

### Zone Partner Economics
```
Average order:        R400
Gross margin:         40% = R160
Split 50/50:          R80 to Partner, R80 to Jeffy
```

### Revenue Projections
| Zone Partners | Orders/Month | Gross Profit | Jeffy's Share |
|---------------|--------------|--------------|---------------|
| 5 | 200 | R32,000 | R16,000 |
| 20 | 800 | R128,000 | R64,000 |
| 60 | 2,400 | R384,000 | R192,000 |

### Path to Financial Independence
- Target: R30-50k/month net profit
- Achievable with: ~20 active Zone Partners
- Timeline: 24-36 months realistic

---

## TECHNICAL ARCHITECTURE

### Stack
- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (product-images bucket)
- **Deployment:** Railway
- **AI:** Claude API (image analysis, translations)

### Key Directories
```
/src/app/admin/          - Admin dashboard pages
/src/app/api/            - API routes
/src/components/         - Reusable components
/chrome-extension/       - "Send to Jeffy" browser extension
/e2e/                    - Playwright E2E tests
```

### Critical API Routes
| Route | Purpose |
|-------|---------|
| `/api/import/1688` | Import products from 1688 (via extension) |
| `/api/translate-image` | Claude Vision Chinese text detection |
| `/api/wants` | Customer wants submission |
| `/api/zone-partner` | Partner applications |

### Database Tables
- `products` - Product catalog
- `wants` - Customer product requests
- `zone_partners` - Partner applications and data
- `orders` - Order management

### Environment Variables (Railway)
```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
ALIBABA_DASHSCOPE_API_KEY (set but region-limited)
```

---

## SOURCING WORKFLOW

### Current Process
1. Browse 1688.com for products
2. Click "Send to Jeffy" (Chrome extension)
3. Product imports with translated title, pricing calculated
4. Edit in admin - drag better images directly from 1688
5. Run through Image Analyzer to check for Chinese text
6. Select clean images for SA market
7. Publish when ready

### Pricing Formula
```javascript
Cost CNY × 3.2 (exchange) + Shipping (R75/kg) × 2.5 markup = Selling Price
```

### Image Quality Fix (Just Implemented)
- Extension now grabs full-size images (not thumbnails)
- API has backup conversion for thumbnail URLs
- Images stored in Supabase `product-images` bucket

---

## COMPETITIVE ADVANTAGES

| Traditional E-commerce | Jeffy Model |
|------------------------|-------------|
| Inventory risk | Zero inventory - demand first |
| Gig worker exploitation | 50/50 genuine partnership |
| Faceless corporation | Mission-driven, human story |
| Fight for metros | Township-focused, underserved markets |
| Hope products sell | Only source validated demand |
| Marketing spend to acquire | Community/Zone Partners recruit |

---

## VIRAL POTENTIAL ASSESSMENT

### Why This Could Catch Fire
1. **The Story** - Family school destroyed by corruption, rebuilding through commerce
2. **The Model** - 50/50 split is genuinely revolutionary
3. **The Mission** - Schools, land, dignity - not just profit
4. **SA Hunger** - People want something homegrown to believe in
5. **Influencer Outreach** - 40 personalized letters to change-makers, not spam

### Current Probability Estimates
| Outcome | Probability |
|---------|-------------|
| At least 1 influencer shares | 70%+ |
| Meaningful viral moment in 6 months | 25-35% |
| Story gets told widely (2-3 year horizon) | Very high |

### Viral Mechanism
Not TikTok virality. **Community virality:**
- Zone Partners telling cousins about their R8k commission
- WhatsApp forwards of the school mission story
- Influencers sharing because it makes THEM look good

---

## TREDOUX - CONTEXT

- **Location:** Beijing, China (SA expat)
- **Day job:** Montessori kindergarten teacher (Whale Class, ages 2-6)
- **Family:** 2.5-year-old daughter
- **Heritage:** Founding family of South Africa (Swiss Huguenot, Dutch colonial)
- **Philosophy:** Works behind scenes, "making SA proud," providing opportunities

### Other Active Projects
- **Whale Platform** (teacherpotato.xyz) - Montessori curriculum tracking
- **Guardian Connect** - Emergency alert system (prototype)
- **English Reading Mastery** - 26-week curriculum

### Working Style with Claude
- Claude writes ALL code, provides complete files with exact paths
- Cursor used only as implementation agent
- Prefers comprehensive solutions over iterative back-and-forth
- Mission-focused, not feature-focused

---

## IMMEDIATE NEXT STEPS

### This Week
- [ ] Wait for influencer responses (don't follow up yet)
- [ ] Continue collecting wants
- [ ] Continue Zone Partner recruitment
- [ ] Curate product catalog

### If Influencers Respond
- Voice note or video call, not text
- Let them ask questions
- Don't oversell - mission sells itself

### If Silence After 3 Weeks
- One gentle follow-up
- Then next batch of outreach

### Ongoing
- Product curation (quality over quantity)
- Zone Partner vetting (quality matters more than speed)
- Platform refinement based on early feedback

---

## KEY FILES TO KNOW

| File | Purpose |
|------|---------|
| `/src/app/admin/layout.tsx` | Admin navigation structure |
| `/src/app/api/import/1688/route.ts` | Product import from China |
| `/src/app/api/translate-image/route.ts` | Chinese text detection |
| `/chrome-extension/content.js` | "Send to Jeffy" scraper |
| `/src/app/admin/zone-partners/` | Partner management |
| `/src/app/admin/wants/` | Wants management |

---

## THE BOTTOM LINE

Jeffy isn't competing with Takealot. It's building something they can't copy:
- Community trust
- Mission-driven purpose
- Fair partnership model
- Demand-first economics

**The platform is ready. The outreach is sent. The kindling is lit.**

Now we wait to see if it catches fire - while continuing to build steadily regardless.

---

*"This is just a vehicle. The destination is schools, land, and dignity for the next generation of South Africans."*
