# GoDaddy Custom Domain Setup Guide
**Project:** Jeffy Commerce MVP  
**Date:** 2025-01-27

---

## Overview

This guide will walk you through connecting your GoDaddy domain to your Vercel-deployed Next.js app.

**Prerequisites:**
- ✅ Vercel account (free tier works)
- ✅ GoDaddy domain
- ✅ App deployed on Vercel

---

## Step 1: Deploy to Vercel (If Not Already Done)

### Option A: Via Vercel Dashboard

1. **Go to:** https://vercel.com
2. **Sign in** with GitHub
3. **Click:** "Add New Project"
4. **Import** your `jeffy-commerce` repository
5. **Configure:**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. **Add Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY` (if using)
7. **Click:** "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd ~/Desktop/jeffy-mvp
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? jeffy-commerce
# - Directory? ./
# - Override settings? No
```

---

## Step 2: Add Domain in Vercel

1. **Go to:** https://vercel.com/dashboard
2. **Select** your `jeffy-commerce` project
3. **Click:** "Settings" tab
4. **Click:** "Domains" in the left sidebar
5. **Enter your domain:**
   - For root domain: `yourdomain.com`
   - For www subdomain: `www.yourdomain.com`
   - (You can add both)
6. **Click:** "Add"

**Vercel will show you DNS records to configure:**
- Type: `A` or `CNAME`
- Name: `@` or `www`
- Value: IP address or CNAME target

**Example:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**📝 Note these values - you'll need them in GoDaddy!**

---

## Step 3: Configure DNS in GoDaddy

### Access GoDaddy DNS Settings

1. **Go to:** https://www.godaddy.com
2. **Sign in** to your account
3. **Click:** "My Products"
4. **Find** your domain and click "DNS" (or "Manage DNS")

### Add DNS Records

#### For Root Domain (yourdomain.com)

**Option 1: Using A Record (Recommended)**

1. **Find** the "A" record section
2. **Click:** "Add" or "Edit"
3. **Configure:**
   - **Type:** A
   - **Name:** @ (or leave blank, or `yourdomain.com`)
   - **Value:** The IP address from Vercel (e.g., `76.76.21.21`)
   - **TTL:** 600 (or default)
4. **Save**

**Option 2: Using CNAME (Alternative)**

1. **Find** the "CNAME" record section
2. **Click:** "Add"
3. **Configure:**
   - **Type:** CNAME
   - **Name:** @ (or leave blank)
   - **Value:** The CNAME target from Vercel (e.g., `cname.vercel-dns.com`)
   - **TTL:** 600
4. **Save**

**⚠️ Note:** Some registrars don't allow CNAME on root domain. Use A record if CNAME doesn't work.

#### For WWW Subdomain (www.yourdomain.com)

1. **Find** the "CNAME" record section
2. **Click:** "Add"
3. **Configure:**
   - **Type:** CNAME
   - **Name:** www
   - **Value:** The CNAME target from Vercel (e.g., `cname.vercel-dns.com`)
   - **TTL:** 600
4. **Save**

### Remove Conflicting Records

**Before adding new records, check for:**
- Existing A records pointing to old hosting
- Existing CNAME records that conflict
- Remove or update them as needed

**Example GoDaddy DNS Records:**

```
Type    Name    Value                    TTL
A       @       76.76.21.21              600
CNAME   www     cname.vercel-dns.com     600
```

---

## Step 4: Wait for DNS Propagation

**DNS changes can take:**
- **Minimum:** 5-10 minutes
- **Typical:** 1-2 hours
- **Maximum:** 24-48 hours

**Check propagation:**
- Use: https://dnschecker.org
- Enter your domain
- Check if A/CNAME records match Vercel's values

---

## Step 5: Verify Domain in Vercel

1. **Go back to:** Vercel Dashboard → Your Project → Settings → Domains
2. **Check status:**
   - ✅ Green checkmark = Domain verified and active
   - ⏳ Pending = DNS still propagating
   - ❌ Error = Check DNS configuration

3. **SSL Certificate:**
   - Vercel automatically provisions SSL certificates
   - Usually takes 5-10 minutes after DNS verification
   - Your site will be accessible via HTTPS automatically

---

## Step 6: Test Your Domain

### Test Root Domain

```bash
# In browser, visit:
https://yourdomain.com

# Should show your app
```

### Test WWW Subdomain

```bash
# In browser, visit:
https://www.yourdomain.com

# Should redirect to root or show app
```

### Verify HTTPS

- ✅ URL should show padlock icon
- ✅ Should redirect HTTP → HTTPS automatically
- ✅ SSL certificate should be valid

---

## Troubleshooting

### Domain Not Resolving

**Check:**
1. DNS records are correct in GoDaddy
2. TTL has passed (wait longer)
3. DNS propagation status at dnschecker.org
4. No conflicting records in GoDaddy

**Fix:**
- Double-check A/CNAME values match Vercel exactly
- Remove conflicting records
- Wait for DNS propagation

### SSL Certificate Not Issuing

**Check:**
1. Domain is verified in Vercel
2. DNS records are correct
3. No firewall blocking Vercel's verification

**Fix:**
- Wait 10-15 minutes after DNS verification
- Re-verify domain in Vercel
- Check Vercel logs for SSL errors

### WWW Not Working

**Check:**
1. CNAME record for `www` is set correctly
2. Vercel has both `yourdomain.com` and `www.yourdomain.com` added

**Fix:**
- Add `www.yourdomain.com` in Vercel if not added
- Verify CNAME record in GoDaddy
- Wait for DNS propagation

### Domain Shows "Not Configured" in Vercel

**Check:**
1. DNS records match Vercel's requirements exactly
2. No typos in domain name
3. DNS has propagated

**Fix:**
- Remove and re-add domain in Vercel
- Double-check DNS records
- Contact Vercel support if persists

---

## Quick Reference: GoDaddy DNS Setup

### Step-by-Step in GoDaddy

1. **Login** to GoDaddy
2. **My Products** → Select domain → **DNS**
3. **Records** tab
4. **Add** new record:
   - **Type:** A (for root) or CNAME (for www)
   - **Name:** @ (root) or www
   - **Value:** From Vercel dashboard
   - **TTL:** 600 seconds
5. **Save**
6. **Wait** 1-2 hours for propagation

---

## Environment Variables in Vercel

**Make sure these are set in Vercel:**

1. **Go to:** Project Settings → Environment Variables
2. **Add:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Any other API keys

3. **Redeploy** after adding variables

---

## Next Steps After Domain Setup

1. ✅ **Test all routes** on custom domain
2. ✅ **Update any hardcoded URLs** in code
3. ✅ **Configure redirects** if needed (www → root)
4. ✅ **Set up monitoring** (Vercel Analytics)
5. ✅ **Update social media** links with new domain

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs/concepts/projects/domains
- **GoDaddy Help:** https://www.godaddy.com/help
- **DNS Checker:** https://dnschecker.org
- **Vercel Support:** support@vercel.com

---

## Summary Checklist

- [ ] App deployed to Vercel
- [ ] Domain added in Vercel dashboard
- [ ] DNS records configured in GoDaddy
- [ ] A record for root domain (@)
- [ ] CNAME record for www subdomain
- [ ] Waited for DNS propagation (1-2 hours)
- [ ] Domain verified in Vercel
- [ ] SSL certificate issued
- [ ] Tested https://yourdomain.com
- [ ] Tested https://www.yourdomain.com
- [ ] Environment variables set in Vercel

---

**Good luck! 🚀**

