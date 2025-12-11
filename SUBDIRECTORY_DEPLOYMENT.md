# Deploying to a Subdirectory on Your Custom Domain

This guide explains how to deploy your Next.js app to a subdirectory path like `michaelmontlabano.com/escape-room` using Vercel.

## Option 1: Using Vercel's Rewrites (Recommended)

This method uses Vercel's rewrite rules to serve your app from a subdirectory without modifying the codebase.

### Steps:

1. **Add your custom domain to Vercel:**
   - Go to your Vercel project → Settings → Domains
   - Add `michaelmontlabano.com` (or `www.michaelmontlabano.com`)
   - Follow DNS configuration instructions

2. **Configure Vercel Rewrites:**
   - The `vercel.json` file is already configured
   - It will rewrite `/escape-room/*` to `/*` internally
   - Your app code doesn't need to know about the subdirectory

3. **Set Environment Variable (Optional):**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add `NEXT_PUBLIC_BASE_PATH` = `/escape-room` (if you want Next.js to be aware of the path)
   - **OR** leave it empty/unset to use the rewrite method

### Access URLs:
- `michaelmontlabano.com/escape-room` → Your app
- `michaelmontlabano.com/escape-room/` → Your app (with trailing slash)

---

## Option 2: Using Next.js basePath (Alternative)

This method makes Next.js aware of the subdirectory path.

### Steps:

1. **Set Environment Variable in Vercel:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_BASE_PATH` = `/escape-room`
   - Redeploy your app

2. **Configure DNS:**
   - Point your domain to Vercel (same as Option 1)

### Access URLs:
- `michaelmontlabano.com/escape-room` → Your app
- All internal links and assets will automatically use `/escape-room` prefix

---

## Which Method Should You Use?

### Use Option 1 (Rewrites) if:
- ✅ You want the simplest setup
- ✅ You don't need Next.js to be aware of the subdirectory
- ✅ You want flexibility to change the path later

### Use Option 2 (basePath) if:
- ✅ You need Next.js to generate correct URLs for assets/links
- ✅ You're using `next/image` or other Next.js features that need path awareness
- ✅ You want absolute control over the path

---

## Testing Locally

To test the subdirectory setup locally:

```bash
# Set the basePath environment variable
export NEXT_PUBLIC_BASE_PATH=/escape-room

# Run the dev server
npm run dev

# Access at http://localhost:3000/escape-room
```

Or create a `.env.local` file:
```env
NEXT_PUBLIC_BASE_PATH=/escape-room
```

---

## Changing the Subdirectory Name

To change from `/escape-room` to another path (e.g., `/game`):

1. **If using Option 1 (Rewrites):**
   - Edit `vercel.json` and change `/escape-room` to `/game`
   - Redeploy

2. **If using Option 2 (basePath):**
   - Update `NEXT_PUBLIC_BASE_PATH` environment variable in Vercel
   - Change from `/escape-room` to `/game`
   - Redeploy

---

## Important Notes

- **Firebase Configuration:** Your Firebase config doesn't need to change - it works regardless of the URL path
- **Static Assets:** Images and other static files will work automatically with either method
- **API Routes:** If you add API routes later, they'll work at `/escape-room/api/...` (or whatever path you choose)
- **Root Domain:** You can still serve other content at `michaelmontlabano.com/` while your app is at `/escape-room`

---

## Troubleshooting

### Issue: 404 errors on assets/styles
- **Solution:** Make sure `NEXT_PUBLIC_BASE_PATH` is set correctly, or use the rewrite method

### Issue: Links don't work
- **Solution:** If using basePath, Next.js Link components will automatically handle it. If using rewrites, links should work as-is.

### Issue: Firebase Functions not working
- **Solution:** Firebase Functions are independent of the URL path - they should work regardless

---

## Example: Multiple Apps on One Domain

You can host multiple apps on your domain:
- `michaelmontlabano.com/escape-room` → This app
- `michaelmontlabano.com/blog` → Another Next.js app
- `michaelmontlabano.com/portfolio` → Another app

Each app can be a separate Vercel project with its own rewrite rules!

