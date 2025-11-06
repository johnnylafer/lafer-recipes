# Shopify Iframe Setup for Redirect Support

## 🎯 Problem

When the recipe system is embedded as an iframe in Shopify, URL parameters from the parent page need to be passed to the iframe for redirects to work.

## ✅ Solution

### Step 1: Update Shopify Page Template

In your Shopify page where the iframe is embedded (likely `/pages/rezepte`), update the code:

#### Option A: Shopify Liquid (Recommended)

```liquid
<div id="lafer-recipes-container">
  <iframe
    id="lafer-recipes-iframe"
    src="https://your-cdn.com/recipe-system/{% if request.params.recipe != blank %}recipe.html?recipe={{ request.params.recipe | url_encode }}{% else %}index.html{% endif %}"
    scrolling="no"
    style="width: 100%; border: none; overflow: hidden; min-height: 800px;">
  </iframe>
</div>

<script>
  // Height adjustment (already implemented)
  window.addEventListener('message', function(event) {
    if (event.data.type === 'lafer-recipes-height') {
      document.getElementById('lafer-recipes-iframe').style.height = event.data.height + 'px';
    }
    if (event.data.type === 'lafer-recipes-scroll-top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
</script>
```

#### Option B: JavaScript Parameter Passing

If you can't use Liquid, add this JavaScript:

```html
<div id="lafer-recipes-container">
  <iframe
    id="lafer-recipes-iframe"
    src=""
    scrolling="no"
    style="width: 100%; border: none; overflow: hidden; min-height: 800px;">
  </iframe>
</div>

<script>
  // Pass URL parameters from parent to iframe
  (function() {
    const urlParams = new URLSearchParams(window.location.search);
    const iframe = document.getElementById('lafer-recipes-iframe');
    const baseUrl = 'https://your-cdn.com/recipe-system/';

    let iframeUrl;

    if (urlParams.has('recipe')) {
      // Recipe detail page
      iframeUrl = baseUrl + 'recipe.html?recipe=' + encodeURIComponent(urlParams.get('recipe'));
    } else {
      // Index page - pass through all filters
      const paramString = urlParams.toString();
      iframeUrl = baseUrl + 'index.html' + (paramString ? '?' + paramString : '');
    }

    iframe.src = iframeUrl;
  })();

  // Height adjustment
  window.addEventListener('message', function(event) {
    if (event.data.type === 'lafer-recipes-height') {
      document.getElementById('lafer-recipes-iframe').style.height = event.data.height + 'px';
    }
    if (event.data.type === 'lafer-recipes-scroll-top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
</script>
```

---

## 🔍 Complete Example Flow

### 1. User Clicks Old Recipe Link
```
https://lafer.de/rezepte/hauptspeisen/336/honig-senf-lachs-vom-grill-auf-wasabigurken
```

### 2. Shopify Redirect (From Your CSV)
```
Redirects to: https://lafer.de/pages/rezepte?recipe=honig-senf-lachs-vom-grill-auf-wasabigurken
```

### 3. Shopify Page Loads with Iframe
```liquid
<!-- Liquid template detects ?recipe= parameter -->
<iframe src="https://cdn.com/recipe-system/recipe.html?recipe=honig-senf-lachs-vom-grill-auf-wasabigurken">
```

### 4. Recipe System Loads
```javascript
// recipe.js reads the parameter
const recipeSlug = params.get('recipe');
// → "honig-senf-lachs-vom-grill-auf-wasabigurken"

// Looks up in redirect_mapping.json
const recipeId = redirectMapping[recipeSlug];
// → 5XXX (if it exists)

// Displays recipe ✅
```

---

## 🧪 Testing Checklist

### Test 1: Direct Recipe Link (Matched)
1. Visit: `https://lafer.de/pages/rezepte?recipe=geraucherte-entenbrust-mit-bratapfel`
2. Expected: Recipe detail page loads correctly ✅

### Test 2: Direct Recipe Link (Missing)
1. Visit: `https://lafer.de/pages/rezepte?recipe=pizza-margherita`
2. Expected: "Recipe not found" message ✅

### Test 3: Index Page
1. Visit: `https://lafer.de/pages/rezepte`
2. Expected: Recipe overview with all recipes ✅

### Test 4: Recipe Click from Index
1. Visit recipe overview
2. Click any recipe
3. Expected: URL changes to `?recipe=slug-name`, recipe loads ✅

### Test 5: Back Button
1. Open recipe detail
2. Click browser back button
3. Expected: Returns to overview ✅

---

## 🚨 Common Issues

### Issue 1: Recipe Not Loading
**Symptom:** Blank iframe or "Recipe not found"
**Cause:** Parameters not being passed to iframe
**Fix:** Check that Liquid/JavaScript is correctly passing parameters

### Issue 2: Wrong Recipe Loads
**Symptom:** Different recipe than expected
**Cause:** Slug mismatch between redirect and recipe
**Fix:** Check `redirect_mapping.json` for correct slug

### Issue 3: Scrollbar Issues
**Symptom:** Double scrollbar or incorrect height
**Cause:** Height communication not working
**Fix:** Verify postMessage listener is active in parent page

---

## 📋 Deployment Checklist

Before deploying:

- [ ] Update Shopify page template with iframe parameter passing
- [ ] Upload `redirect_mapping.json` to CDN/hosting
- [ ] Upload updated `recipe.js` with redirect support
- [ ] Upload updated `app.js` with slug-based URLs
- [ ] Test at least 5 redirect URLs from the CSV
- [ ] Verify "not found" handling for missing recipes
- [ ] Check mobile responsiveness
- [ ] Verify height adjustment works
- [ ] Test scroll-to-top functionality

---

## 🔗 URL Structure Reference

### Old Lafer Website URLs:
```
/rezepte/kategorie/123/recipe-name-with-umlauts
```

### Shopify Redirect Target:
```
https://lafer.de/pages/rezepte?recipe=recipe-name-without-umlauts
```

### Iframe Source (Auto-Generated):
```
https://your-cdn.com/recipe-system/recipe.html?recipe=recipe-name-without-umlauts
```

### Recipe System Handling:
```javascript
// Reads: ?recipe=recipe-name-without-umlauts
// Looks up in redirect_mapping.json
// Finds recipe by ID or slug
// Displays recipe
```

---

## 🎯 Expected Results

After proper setup:

- ✅ 194 redirect URLs will work perfectly (86.6%)
- ⚠️ 65 redirect URLs will show "Recipe not found" (13.4%)
- ✅ All internal recipe links will use clean slug URLs
- ✅ Backward compatibility with ID-based URLs maintained
- ✅ No double scrollbars
- ✅ Auto-scroll to top when clicking recipes
- ✅ Proper iframe height adjustment

---

## 💡 Pro Tips

1. **Cache Bust During Testing:** Add `?v=1` to iframe src during testing to avoid cache issues
2. **Monitor Console:** Open browser console to check for any loading errors
3. **Test Incognito:** Always test redirects in incognito mode to avoid cached redirects
4. **Check Mobile:** Verify on mobile devices as iframe behavior can differ
5. **Performance:** Consider lazy-loading the iframe if it's below the fold

---

## 📞 Support

If recipes aren't loading:

1. Check browser console for errors
2. Verify `redirect_mapping.json` is accessible
3. Confirm iframe src includes the `?recipe=` parameter
4. Check that recipe slug exists in `recipes.json`

---

## ✨ Success Criteria

You'll know it's working when:

1. Clicking an old recipe link from Google redirects properly ✅
2. URL shows `?recipe=slug-name` in the address bar ✅
3. Correct recipe displays in the iframe ✅
4. No double scrollbars ✅
5. Page scrolls to top when clicking recipes ✅
6. Back/forward navigation works ✅
