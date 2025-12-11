# Corporate Proxy / Blue Coat Filter Solutions

Your Vercel deployment is being blocked by Capital One's corporate proxy (Blue Coat Web Filter) because the domain is marked as "Uncategorized". Here are several solutions:

## ✅ Solution 1: Request Domain Categorization (Recommended)

**Best long-term solution:** Request that your IT/Cyber team categorize the Vercel domain.

1. **Contact Capital One IT/Cyber Support** (OneSupport)
2. Request categorization of `escape-five-xi.vercel.app` or `*.vercel.app`
3. Explain it's a legitimate business application (Engineering Escape Room)
4. Request category: **"Business"** or **"Productivity"**

**Note:** The error page mentions you can "click here" to dispute the categorization - use that link!

---

## ✅ Solution 2: Use a Custom Domain

**Better for corporate environments:** Use your own domain instead of the Vercel default.

### Steps:

1. **Purchase/Use a Domain** (e.g., `escape-room.yourcompany.com` or your own domain)
2. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions
3. **Update Firebase Auth Domain** (if using Firebase Auth):
   - Add your custom domain to Firebase Console → Authentication → Settings → Authorized domains

**Benefits:**
- Custom domains are often pre-approved in corporate networks
- More professional appearance
- Better for internal tools

---

## ✅ Solution 3: Use Corporate VPN/Network Exception

**Quick workaround:** Request a network exception from IT.

1. Contact Capital One IT/Cyber team
2. Request exception for `escape-five-xi.vercel.app`
3. Provide business justification (internal engineering tool)
4. They can whitelist the domain in Blue Coat

---

## ✅ Solution 4: Deploy to Internal Infrastructure

**Most secure for corporate:** Deploy to Capital One's internal infrastructure.

### Options:
- **Internal Vercel/Netlify** (if available)
- **Internal Kubernetes cluster**
- **Internal web server**
- **SharePoint/Teams app** (if applicable)

---

## ✅ Solution 5: Browser Configuration (Temporary)

**Quick test:** Try accessing from a non-corporate network or personal device.

- Use your personal phone/laptop (not on corporate WiFi)
- Test if the site works outside the corporate network
- This confirms it's a proxy issue, not a code issue

---

## 🔧 Code Changes Made

I've added security headers to `next.config.js` that may help with some corporate proxies:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cache-Control` headers

These headers help proxies understand this is a legitimate web application.

---

## 📋 Next Steps

1. **Deploy the updated code** (with new headers):
   ```bash
   git add -A
   git commit -m "Add security headers for corporate proxy compatibility"
   git push origin main
   ```

2. **Try Solution 1** (Request categorization) - This is the best long-term fix

3. **If urgent:** Use Solution 2 (Custom domain) or Solution 3 (Network exception)

4. **Test:** After any changes, test from the corporate network

---

## 🚨 Important Notes

- **The error is NOT a code issue** - your application is working correctly
- **Blue Coat** is a web security/filtering product used by many enterprises
- **"Uncategorized"** means the domain hasn't been reviewed/approved yet
- **Cookie issues** are often related to proxy filtering, not your code

---

## 📞 Contact Information

From the error page, you can:
- Visit **OneSupport** for global issue checks
- Click the **dispute link** to challenge the categorization
- Contact **Capital One Cyber** team for exceptions

