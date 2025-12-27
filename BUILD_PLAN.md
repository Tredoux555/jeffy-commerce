# JEFFY WATERTIGHT BUILD PLAN
# December 27, 2025

## BUILD ORDER (Dependency-Based)

---

## PHASE A: QR CODE & SCANNING SYSTEM (Foundation)
**Why First:** Everything else depends on this - it's the handoff mechanism

### A1: QR Code Generation
- [ ] Generate unique QR code when order is created
- [ ] Store QR data in order record
- [ ] QR contains: order_id, order_number, verification_code

### A2: Printable Label Page
- [ ] /admin/orders/[id]/label - printable label
- [ ] Shows: QR code, order number, customer name, address
- [ ] Partner-branded design
- [ ] Print button

### A3: Partner Scan Page (Pack & Ship)
- [ ] /partner/scan - camera scanner
- [ ] Scans QR → marks order as "out_for_delivery"
- [ ] Triggers WhatsApp notification to buyer
- [ ] Shows delivery route after scanning batch

### A4: Buyer Confirmation Scan
- [ ] /delivery/confirm/[code] - buyer confirmation page
- [ ] Scan QR or enter code manually
- [ ] Marks order as "delivered"
- [ ] Triggers earnings credit to partner

### A5: Photo Proof Alternative
- [ ] If buyer unavailable → photo option
- [ ] Capture photo with geolocation
- [ ] Risk acknowledgment for buyer

---

## PHASE B: WHATSAPP NOTIFICATIONS
**Why Second:** Enables communication at each QR scan point

### B1: WhatsApp Message Templates
- [ ] "Order confirmed" template
- [ ] "Out for delivery" template  
- [ ] "Delivery complete" template
- [ ] "Want reached 10 agrees" template

### B2: WhatsApp Send Function
- [ ] API route to send WhatsApp messages
- [ ] Format phone numbers (SA format)
- [ ] Use WhatsApp Business API or wa.me links

### B3: Trigger Integration
- [ ] Send on order creation
- [ ] Send on partner scan (out for delivery)
- [ ] Send on delivery confirmation
- [ ] Send on want threshold reached

---

## PHASE C: WANTS → PRODUCT AUTOMATION
**Why Third:** Closes the viral loop

### C1: Threshold Detection
- [ ] Check agree count after each vote
- [ ] When count >= 10, trigger automation

### C2: Auto-Create Product
- [ ] Create product from want data
- [ ] Copy image, title, description
- [ ] Set initial price (or flag for pricing)
- [ ] Link want to product

### C3: Creator Notification
- [ ] WhatsApp: "Your want is approved!"
- [ ] Include link to product
- [ ] Explain "11 free" benefit (1 for you + 10 to sell)

### C4: Track Creator Benefit
- [ ] Mark creator as eligible for free product
- [ ] Track their 10 resale credits
- [ ] Dashboard for creator to see status

---

## PHASE D: PARTNER STOCK TRACKING
**Why Fourth:** Operational efficiency once system is running

### D1: Stock Per Partner
- [ ] Table: partner_stock (partner_id, product_id, quantity)
- [ ] Initialize with 10 of each new product

### D2: Stock Deduction
- [ ] When order assigned → deduct from partner stock
- [ ] Show available stock when assigning

### D3: Replenishment Alerts
- [ ] Alert when partner stock < 3
- [ ] Add to agent portal "restock needed" list
- [ ] Weekly replenishment report

### D4: Stock Receiving
- [ ] Partner marks shipment received
- [ ] Updates stock count
- [ ] Reconciliation view

---

## PHASE E: ROUTE OPTIMIZATION (Bonus)
**If time permits**

### E1: Daily Route Page
- [ ] /partner/route - today's deliveries
- [ ] Map with all stops
- [ ] Optimized order

### E2: Navigation Integration
- [ ] "Start Route" button
- [ ] Opens Google Maps with waypoints

---

## CHECKPOINTS

After each section (A1, A2, etc.):
1. Git commit with descriptive message
2. Test locally if possible
3. Push to deploy
4. Note any issues

---

## ESTIMATED TIME

- Phase A: 3-4 hours (most complex)
- Phase B: 2 hours
- Phase C: 1.5 hours
- Phase D: 1.5 hours
- Phase E: 1 hour (optional)

Total: ~8-10 hours

---

## STARTING NOW: PHASE A1 - QR Code Generation
