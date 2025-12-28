# Operational Playbook for Launching a Zone Partner Delivery Network in South Africa

**Document Date:** 28 December 2025
**For:** Jeffy Commerce Zone Partner System
**Purpose:** Complete operational guide for building auto-assignment, onboarding, and notifications

---

## EXECUTIVE SUMMARY

Jeffy Commerce can build a competitive delivery partner network by implementing:
- **Auto-assignment dispatch** using H3 hexagonal zones or postal code matching
- **Automated onboarding** via document verification with PayFast split payouts
- **Multi-channel notifications** prioritizing push with SMS/WhatsApp fallback

South Africa's unique challenges—load shedding, township delivery, and informal addresses—require offline-capable apps, what3words integration, and flexible partner models.

---

## 1. ORDER ROUTING & AUTO-ASSIGNMENT

### Zone-Based Assignment Architecture

For Jeffy Commerce at launch, use postal code matching (simpler than H3):

### Assignment Flow

```
1. Order received → Extract postal code from delivery address
2. Match postal code to zone → zones.postal_codes array contains match
3. Find active Zone Partner in that zone
4. Assign order → Update order.zone_partner_id
5. Send WhatsApp notification to partner
6. If no partner → mark order as "no_coverage" and notify customer
```

### Handling No Partners Available

1. Check if zone exists but partner inactive → queue for later
2. If no zone covers postal code → notify customer "delivery not available in your area yet"
3. Offer customer option to request zone coverage (future want)


---

## 2. PARTNER ONBOARDING FLOW

### After Admin Approves Application

| Step | What Happens | System Action |
|------|--------------|---------------|
| 1 | Partner approved | Email + WhatsApp: "Congratulations!" |
| 2 | Partner logs into portal | See onboarding checklist |
| 3 | Link PayFast account | Provide merchant ID |
| 4 | Pay deposit (R5,000-R10,000) | EFT or card via PayFast |
| 5 | Complete training | Video modules + quiz |
| 6 | Confirm delivery address | Where to ship stock |
| 7 | Receive stock | Confirm receipt in app |
| 8 | Go Active | Can now receive orders |

### Document Requirements

- SA ID or work permit
- Valid SA driver's license
- Vehicle registration (RC1)
- Roadworthy certificate
- Commercial vehicle insurance
- Profile photo

### Training Modules (60 min total)

1. How Jeffy Works (10 min)
2. Partner Dashboard (10 min)
3. Receiving & Storing Stock (10 min)
4. Handling Orders (15 min)
5. Delivery Best Practices (10 min)
6. Getting Paid (5 min)

---

## 3. NOTIFICATION SYSTEM

### Partner Notifications

| Event | Channel | Message |
|-------|---------|---------|
| New order | WhatsApp | "🛒 New order! R450. 2.3km away. [Accept]" |
| Order accepted | Push | Confirmation + customer details |
| Running late | SMS | Reminder to update status |
| Daily summary | WhatsApp | Earnings + deliveries completed |

### Customer Notifications

| Event | Channel | Message |
|-------|---------|---------|
| Order paid | Email + Push | Order confirmed, tracking link |
| Partner assigned | Push | "{Partner name} will deliver your order" |
| Out for delivery | Push + SMS | "Your order is on the way!" |
| Delivered | Push + Email | "Delivered! Rate your experience" |

---

## 4. DATABASE SCHEMA ADDITIONS

```sql
-- Add to zones table
ALTER TABLE zones ADD COLUMN IF NOT EXISTS postal_codes TEXT[];

-- Partner onboarding tracking
CREATE TABLE IF NOT EXISTS partner_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES zone_partners(id),
  payfast_linked BOOLEAN DEFAULT FALSE,
  payfast_merchant_id TEXT,
  deposit_paid BOOLEAN DEFAULT FALSE,
  deposit_paid_at TIMESTAMPTZ,
  training_completed BOOLEAN DEFAULT FALSE,
  training_completed_at TIMESTAMPTZ,
  stock_shipped BOOLEAN DEFAULT FALSE,
  stock_shipped_at TIMESTAMPTZ,
  stock_received BOOLEAN DEFAULT FALSE,
  stock_received_at TIMESTAMPTZ,
  activated BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order assignment fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS zone_partner_id UUID REFERENCES zone_partners(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT;
```


---

## 5. AUTO-ASSIGNMENT CODE

```typescript
// /api/orders/auto-assign/route.ts

async function assignOrderToPartner(orderId: string) {
  const supabase = createAdminClient();
  
  // Get order
  const { data: order } = await supabase
    .from('orders')
    .select('id, delivery_address, status')
    .eq('id', orderId)
    .single();
  
  if (!order || order.status !== 'paid') return;
  
  // Extract postal code (last 4 digits in SA address)
  const postalCode = extractPostalCode(order.delivery_address);
  
  // Find zone containing this postal code
  const { data: zone } = await supabase
    .from('zones')
    .select('id, name')
    .contains('postal_codes', [postalCode])
    .eq('is_active', true)
    .single();
  
  if (!zone) {
    await supabase.from('orders').update({ 
      status: 'no_coverage',
      notes: `No zone covers postal code ${postalCode}`
    }).eq('id', orderId);
    return { success: false, reason: 'no_zone_coverage' };
  }
  
  // Find active partner in zone
  const { data: partner } = await supabase
    .from('zone_partners')
    .select('id, mobile, full_legal_name')
    .eq('zone_id', zone.id)
    .eq('application_status', 'approved')
    .eq('is_active', true)
    .single();
  
  if (!partner) {
    await supabase.from('orders').update({ 
      status: 'pending_assignment',
      notes: `Zone ${zone.name} has no active partner`
    }).eq('id', orderId);
    return { success: false, reason: 'no_active_partner' };
  }
  
  // Assign order
  await supabase.from('orders').update({
    zone_partner_id: partner.id,
    assigned_at: new Date().toISOString(),
    status: 'assigned'
  }).eq('id', orderId);
  
  // Send WhatsApp to partner
  await sendWhatsAppNotification(partner.mobile, {
    type: 'new_order',
    orderNumber: order.order_number,
    address: order.delivery_address,
    earnings: calculatePartnerEarnings(order.total_cents)
  });
  
  return { success: true, partnerId: partner.id };
}

function extractPostalCode(address: string): string {
  // SA postal codes are 4 digits
  const match = address.match(/\b(\d{4})\b/);
  return match ? match[1] : '';
}
```

---

## 6. SOUTH AFRICAN ADAPTATIONS

### Load Shedding

- Partner app caches active orders offline
- Queue status updates, sync when online
- SMS fallback for critical notifications
- Minimize battery usage

### Township Delivery

- Support what3words addresses
- GPS pin drops with landmarks
- Call customer before arriving
- Partner training on township protocols

### Partner Compensation

| Platform | Per Delivery | Monthly |
|----------|--------------|---------|
| Mr D Food | R14-45 | R2,000-12,000 |
| Takealot | R60-75 | R6,400-15,000 |
| **Jeffy** | R50-70 (50% profit) | R5,000-15,000 |

---

## 7. FRAUD PREVENTION

From day one:
- Device fingerprinting on app install
- Location verification at pickup/delivery
- Photo proof required for all deliveries
- Monitor repeat refund claimers

---

## 8. MINIMUM VIABLE LAUNCH

**Must Have (Day 1):**
- [ ] PayFast live
- [ ] 3+ products in SA
- [ ] 1+ Zone Partner with stock
- [ ] Auto-assign orders
- [ ] Customer can track order

**Week 2+:**
- [ ] Email confirmations
- [ ] WhatsApp notifications
- [ ] Rating system
- [ ] Refund handling
- [ ] PayFast auto-split

---

## 9. IMPLEMENTATION HOURS

| Task | Hours |
|------|-------|
| Auto Order Assignment | 4h |
| Partner Onboarding Flow | 6h |
| Order Confirmation Emails | 2h |
| WhatsApp Notifications | 3h |
| Rating System | 4h |
| Refund System | 6h |
| PayFast Split Payments | 4h |
| **Total** | **~29h** |

---

## 10. ORDER STATUS FLOW

```
pending_payment → paid → assigned → out_for_delivery → delivered
                    ↓
                cancelled → refunded
```

---

## 11. WHO PAYS FOR REFUNDS

| Scenario | Who Pays | Partner Impact |
|----------|----------|----------------|
| Defective product | Jeffy | None |
| Wrong item delivered | Zone Partner | Profit deducted |
| Never arrived (no proof) | Zone Partner | Full cost deducted |
| Customer changed mind | Jeffy | Partner keeps profit |
| Damaged in delivery | Zone Partner | Profit deducted |

---

*Compiled from research on Uber, DoorDash, Mr D Food, Takealot, PayFast*
*Jeffy Commerce - December 2025*
