# WANTS SYSTEM - BROWSER TEST INSTRUCTIONS

## ⚠️ CRITICAL: Route Conflict Must Be Fixed First

The server cannot start properly due to a route conflict between:
- `src/app/wants/[shareCode]/page.tsx` (existing)
- `src/app/wants/[code]/page.tsx` (new)

## Quick Fix Options

### Option 1: Delete Old Route (Recommended)
```bash
rm -rf src/app/wants/[shareCode]
```

### Option 2: Rename New Route to Match Existing
```bash
mv src/app/wants/[code] src/app/wants/[shareCode]
# Then update the param name in page.tsx from 'code' to 'shareCode'
```

## After Fixing Route Conflict

### Step 1: Start Dev Server
```bash
cd /Users/tredouxwillemse/Desktop/jeffy-mvp
rm -rf .next
npm run dev
```

Wait for: `✓ Ready in X.Xs` message

### Step 2: Test Route 1 - Browse Wants
**URL:** `http://localhost:3000/wants`

**Expected:**
- ✅ Page loads with dark background (#0f172a)
- ✅ Header: "🔥 Jeffy Wants"
- ✅ Description text visible
- ✅ "➕ Create a Want" button visible
- ✅ Shows "Loading wants..." or empty state

**Screenshot:** Take screenshot of page

---

### Step 3: Test Route 2 - Create Want
**URL:** `http://localhost:3000/wants/create`

**Expected:**
- ✅ Form page loads
- ✅ All form fields visible:
  - "What do you want?" input
  - "Your Name" input
  - "Your Phone" input
  - Threshold selector (default: 10)
- ✅ Submit button: "✓ Create Want & Share"

**Test Actions:**
1. Fill in form:
   - Title: "Wireless Gaming Headset Pro"
   - Name: "Test User"
   - Phone: "0721234567"
   - Threshold: 10 (default)
2. Click "✓ Create Want & Share"
3. Should redirect to `/wants/[shareCode]` page

**Screenshot:** Take screenshot before and after submission

---

### Step 4: Test Route 3 - Want Detail + Momentum
**URL:** `http://localhost:3000/wants/[SHARE_CODE]` (from Step 3)

**Expected:**
- ✅ Page loads with want details
- ✅ Title displayed prominently
- ✅ Momentum counter shows: "0/10" or current count
- ✅ Progress bar visible
- ✅ "👆 I WANT THIS!" button visible
- ✅ Share section with copy link button

**Test Actions:**
1. Click "👆 I WANT THIS!" button
2. Fill in form:
   - Name: "Supporter 1"
   - Phone: "0721111111"
3. Click "✓ Add Me!"
4. Verify:
   - Success message appears
   - Momentum counter increments (1/10)
   - Progress bar updates
   - Supporter appears in supporters list

**Screenshot:** Take screenshots of:
- Initial state
- After clicking "I WANT THIS"
- After adding support
- Supporters list

---

## Known Issues to Verify

1. **Route Conflict Error:**
   - Check browser console for: `Cannot find module './1682.js'`
   - This confirms route conflict exists

2. **Count Increment Bug:**
   - After adding support, check if `current_agrees` actually increments
   - May need database trigger or code fix

3. **Share Code Generation:**
   - Verify share code is unique
   - Check format (should be 8 characters, uppercase)

---

## Test Results Template

```
✅ Route 1 (/wants): [PASS/FAIL]
   Notes: [any observations]

✅ Route 2 (/wants/create): [PASS/FAIL]
   Notes: [form submission worked? redirect?]

✅ Route 3 (/wants/[code]): [PASS/FAIL]
   Notes: [momentum counter updates? supporters list?]

Issues Found:
- [List any issues]
```

---

## Manual Testing Checklist

- [ ] Server starts without errors
- [ ] Route 1 loads correctly
- [ ] Route 2 form displays correctly
- [ ] Form submission works
- [ ] Redirect to detail page works
- [ ] Route 3 detail page loads
- [ ] "I WANT THIS" button works
- [ ] Agreement form submits
- [ ] Momentum counter updates
- [ ] Progress bar updates
- [ ] Supporters list updates
- [ ] Share link copies correctly
- [ ] No console errors
- [ ] No build errors

---

**Last Updated:** 2025-12-26




