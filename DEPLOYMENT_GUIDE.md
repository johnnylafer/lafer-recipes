# Cloudflare Pages Deployment Guide

## 📦 What to Deploy

Deploy **ONLY** the contents of the `/deploy` folder:

```
deploy/
├── index.html          # Main recipe listing page
├── recipe.html         # Recipe detail page
├── app.js             # Main application JavaScript
├── recipe.js          # Recipe detail JavaScript
├── styles.css         # All styles
├── recipes.json       # Recipe database (8.3MB)
└── redirect_mapping.json  # SEO-friendly URL mappings
```

**Total deployment size:** ~8.4MB

---

## 🚫 DO NOT Deploy

The following files are for **development only** and should **NOT** be uploaded:

### Python Scripts (*.py)
- `fix_data_quality.py`
- `process_all_images.py`
- `generate_ai_metadata.py`
- `scan_for_missing_recipes.py`
- etc.

### Shell Scripts (*.sh)
- `setup_cloudflare_variants.sh`

### Log Files (*.log)
- `data_quality_fix.log`
- `image_processing.log`
- `ai_generation.log`
- etc.

### Backup/Temporary Files
- `recipes.json.backup`
- `newly_found_recipes.json`
- `still_missing_recipes.json`
- `ai_matched_recipes.json`
- `missing_redirects_for_ai.json`
- `missing_recipes_report.txt`
- `.DS_Store`

### Documentation (Optional)
- `*.md` files (README, CHANGELOG, etc.)
- Keep these in your repo but no need to deploy

---

## 🚀 Cloudflare Pages Deployment Steps

### Option 1: Direct Upload (Fastest)

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your account

2. **Create New Pages Project**
   - Navigate to **Workers & Pages**
   - Click **Create Application** → **Pages**
   - Choose **Upload assets**

3. **Upload Deploy Folder**
   - Drag & drop the entire `/deploy` folder
   - Or select the 7 files manually
   - Project name: `lafer-recipes` (or your choice)

4. **Deploy**
   - Click **Deploy**
   - Wait for deployment to complete (~30 seconds)
   - Your site will be live at: `https://lafer-recipes.pages.dev`

### Option 2: Git Integration (Recommended for Updates)

1. **Initialize Git Repository** (if not already done)
   ```bash
   cd deploy
   git init
   git add .
   git commit -m "Initial deployment"
   ```

2. **Push to GitHub/GitLab**
   ```bash
   git remote add origin https://github.com/yourusername/lafer-recipes.git
   git push -u origin main
   ```

3. **Connect to Cloudflare Pages**
   - In Cloudflare Dashboard, go to **Workers & Pages**
   - Click **Create Application** → **Pages** → **Connect to Git**
   - Authorize GitHub/GitLab
   - Select your repository

4. **Configure Build Settings**
   - **Build command:** Leave empty (no build needed)
   - **Build output directory:** `/` (root)
   - **Root directory:** `/` (or `/deploy` if you push entire repo)

5. **Deploy**
   - Click **Save and Deploy**
   - Automatic deployments on every git push

---

## 🖼️ Image Hosting

All recipe images are hosted on **Cloudflare Images CDN** with automatic responsive variants:

| Variant | Resolution | URL Pattern |
|---------|-----------|-------------|
| thumbnail | 400×300 | `/thumbnail` |
| mobile | 768×576 | `/mobile` |
| tablet | 1024×768 | `/tablet` |
| public | 2048×1536 | `/public` |

**Base URL:** `https://imagedelivery.net/k123YNRgq-hfLvhLvzSxbg/{image_id}/{variant}`

**Total images:** 440 recipes
- 3 generated with DALL-E 3
- 437 upscaled with Real-ESRGAN AI (2x resolution)
- All uploaded to Cloudflare CDN

---

## 🔧 Configuration

### Custom Domain (Optional)

1. **Add Custom Domain in Cloudflare**
   - Pages project → **Custom domains**
   - Add your domain (e.g., `recipes.lafer.de`)
   - DNS will be configured automatically

2. **SSL/TLS**
   - Automatic SSL certificate
   - HTTPS enforced by default

### Environment Variables

No environment variables needed! Everything is client-side.

### Headers & Security

Add these headers in Cloudflare Pages settings (optional):

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 📊 Performance Optimizations

✅ **Already Implemented:**
- Cloudflare CDN for images (global edge delivery)
- Responsive image variants (auto-served based on device)
- Lazy loading for all images
- Minified CSS
- Optimized JSON (gzip compressed by Cloudflare)

✅ **Expected Performance:**
- **First Contentful Paint:** < 1s
- **Largest Contentful Paint:** < 2.5s
- **Total Blocking Time:** < 300ms
- **Lighthouse Score:** 90+

---

## 🔄 Future Updates

To update the deployed site:

### Method 1: Git (Automatic)
```bash
cd deploy
git add .
git commit -m "Update recipes"
git push
```
Cloudflare will automatically redeploy in ~30 seconds.

### Method 2: Manual Upload
1. Go to your Pages project in Cloudflare Dashboard
2. Click **Create deployment**
3. Upload updated files
4. Deploy

---

## 📱 SEO & URLs

### Recipe URLs

**Format:** `https://your-domain.pages.dev/recipe.html?recipe={slug}`

**Examples:**
- `?recipe=rindfleisch-mit-meerrettichsauce`
- `?recipe=spargel-mit-sauce-hollandaise`

**Redirect mapping:** All 440 recipes have SEO-friendly slugs mapped in `redirect_mapping.json`

### Sitemap (Optional - Not Included)

If you want to generate a sitemap:

```javascript
// Run this in browser console on the deployed site
fetch('recipes.json')
  .then(r => r.json())
  .then(recipes => {
    const sitemap = recipes.map(r =>
      `https://your-domain.pages.dev/recipe.html?recipe=${r.slug}`
    ).join('\n');
    console.log(sitemap);
  });
```

---

## 🐛 Troubleshooting

### Issue: Images not loading
- **Check:** Cloudflare Images CDN is separate from Pages
- **Verify:** Visit `https://imagedelivery.net/k123YNRgq-hfLvhLvzSxbg/recipe_4986/public`
- **Fix:** Ensure images were uploaded via `process_all_images.py`

### Issue: Recipes not displaying
- **Check:** `recipes.json` is present and valid
- **Verify:** File size should be ~8.3MB
- **Fix:** Re-copy from main folder to deploy folder

### Issue: 404 on recipe pages
- **Check:** `redirect_mapping.json` is present
- **Verify:** Recipe slug exists in mapping
- **Fix:** Regenerate mapping if needed

### Issue: Slow load times
- **Check:** Cloudflare caching enabled
- **Verify:** Images use CDN URLs (not direct S3)
- **Fix:** Ensure `app.js` and `recipe.js` use `getRecipeImage()` helper

---

## 📞 Support

For issues or questions:
- Check log files in main folder (not deployed)
- Review Cloudflare Pages deployment logs
- Test locally first: `python3 -m http.server 8000` in deploy folder

---

## ✅ Deployment Checklist

- [ ] Copy 7 files to `/deploy` folder
- [ ] Verify `recipes.json` size (~8.3MB)
- [ ] Test locally in `/deploy` folder
- [ ] Upload to Cloudflare Pages
- [ ] Verify images load correctly
- [ ] Test recipe filtering/search
- [ ] Test individual recipe pages
- [ ] Check responsive design (mobile/tablet)
- [ ] Add custom domain (if applicable)
- [ ] Set up Git integration (for easy updates)

**All 440 recipes with AI-enhanced content, upscaled images, and Cloudflare CDN ready to deploy!** 🎉
