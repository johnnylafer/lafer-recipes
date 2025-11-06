# Recipe Analytics Guide

## 📊 Overview

Track which recipes perform best with Google Analytics 4 and custom dashboards. This guide shows you how to:

1. Set up Google Analytics 4 tracking
2. View recipe performance metrics
3. Create custom reports
4. Make data-driven decisions

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Get Google Analytics 4 ID

1. Go to https://analytics.google.com
2. Create property: "Johann Lafer - Rezepte"
3. Get your Measurement ID (looks like `G-XXXXXXXXXX`)

### Step 2: Update Shopify Template

1. Open `shopify-seo-with-analytics.liquid`
2. Replace `YOUR_GA4_ID` with your actual ID:
   ```javascript
   gtag('config', 'G-XXXXXXXXXX', {
   ```
3. Upload to Shopify as `page.recipes.liquid`

### Step 3: Verify Tracking

1. Visit: https://lafer.de/pages/rezepte?recipe=schwabische-maultaschen
2. Open Google Analytics → Reports → Realtime
3. You should see yourself visiting the recipe page

---

## 📈 Metrics You Can Track

### 1. Recipe Performance Metrics

| Metric | What It Tells You | Where to Find It |
|--------|-------------------|------------------|
| **Page Views** | How many times each recipe was viewed | Reports → Engagement → Pages and screens |
| **Average Time** | How long users spend on each recipe | Reports → Engagement → Pages and screens |
| **Bounce Rate** | % of users who leave without interaction | Reports → Engagement → Pages and screens |
| **Scroll Depth** | How far users scroll (auto-tracked) | Reports → Engagement → Events |

### 2. User Interaction Events

| Event | What It Tracks | Use Case |
|-------|----------------|----------|
| `view_recipe` | Individual recipe views | Most popular recipes |
| `select_content` | Recipe card clicks from overview | Click-through rate |
| `search` | Recipe searches | What users are looking for |
| `filter_recipes` | Filter usage (category, difficulty) | Popular filters |
| `print_recipe` | Print button clicks | Intent to cook |
| `share` | Social sharing clicks | Viral potential |
| `adjust_servings` | Servings slider usage | Engagement depth |

### 3. Recipe Attributes Tracked

For each recipe view, we track:
- Recipe name
- Recipe ID & slug
- Category (from keywords)
- Prep time
- Cook time
- Servings
- Rating (if available)

---

## 📊 Creating Custom Reports

### Report 1: Top Performing Recipes

**Goal:** Find which recipes get the most views

1. Go to: **Reports → Engagement → Events**
2. Click `view_recipe` event
3. Add dimension: `recipe_name`
4. Sort by: Event count (descending)

**Result:** List of recipes ranked by popularity

```
Recipe Name                    | Views | Avg Time
-------------------------------|-------|----------
Schwäbische Maultaschen       | 1,542 | 3:24
Rindfleisch mit Meerrettich   | 1,203 | 2:47
Spargel mit Sauce Hollandaise |   987 | 3:01
```

### Report 2: Recipe Category Performance

**Goal:** Which categories are most popular?

1. **Explore** → Create new exploration
2. Technique: Free form
3. Dimensions: `recipe_category`
4. Metrics: `Event count` (view_recipe)
5. Chart type: Bar chart

**Result:** Category rankings

```
Category          | Recipe Views
------------------|-------------
Hauptgerichte     | 5,432
Desserts          | 3,210
Vorspeisen        | 2,845
Suppen            | 1,987
```

### Report 3: Engagement Funnel

**Goal:** Track user journey from overview to cooking

1. **Explore** → Funnel exploration
2. Steps:
   - Step 1: `view_recipe_list` (overview page)
   - Step 2: `view_recipe` (recipe detail)
   - Step 3: `adjust_servings` (engaged)
   - Step 4: `print_recipe` (intent to cook)

**Result:** Conversion rates at each step

```
Overview → Detail: 35% click-through
Detail → Engaged: 22% adjust servings
Engaged → Print: 18% print recipe
```

### Report 4: Recipe Search Analysis

**Goal:** What are users searching for?

1. **Reports → Engagement → Events**
2. Event: `search`
3. Add dimension: `search_term`
4. Sort by: Event count

**Result:** Most searched terms

```
Search Term        | Count
-------------------|------
Spargel            | 342
Rindfleisch        | 287
Pasta              | 213
Weihnachten        | 189
```

### Report 5: Time-Based Performance

**Goal:** When do users view recipes?

1. **Reports → Engagement → Pages and screens**
2. Add comparison: Previous period
3. Add dimension: Hour of day
4. Chart type: Line chart

**Result:** Peak recipe viewing times

```
Peak hours:
- 11:00-13:00 (lunch planning)
- 17:00-19:00 (dinner planning)
- 20:00-22:00 (evening browsing)
```

---

## 🎯 Custom Dashboards

### Dashboard: Recipe Performance Overview

Create a dashboard with these cards:

1. **Total Recipe Views (This Month)**
   - Metric: Event count (`view_recipe`)
   - Comparison: Previous month

2. **Top 10 Recipes**
   - Event: `view_recipe`
   - Dimension: `recipe_name`
   - Limit: 10

3. **Category Distribution**
   - Pie chart
   - Dimension: `recipe_category`

4. **Engagement Rate**
   - Users who adjusted servings ÷ Total recipe views

5. **Print Rate**
   - Print events ÷ Recipe views
   - Shows cooking intent

6. **Average Time on Recipe**
   - By recipe name
   - Indicates recipe complexity/interest

7. **Search Trends**
   - Line chart over time
   - Top search terms

8. **Traffic Sources**
   - Where recipe visitors come from
   - Organic, social, direct, etc.

### Dashboard: Real-Time Recipe Activity

For live monitoring:

1. **Active Users Right Now**
2. **Top Recipes Being Viewed**
3. **Recent Searches**
4. **Recent Shares**

---

## 💡 Actionable Insights

### Use Case 1: Optimize Popular Recipes

**Find:**
- Recipes with high views but short time on page
- Indicates users aren't finding what they need

**Action:**
- Improve recipe descriptions
- Add more photos
- Clarify instructions

**Track:**
- Average time on page improvement

### Use Case 2: Promote Under-Performing Gems

**Find:**
- Recipes with low views but high engagement
- Great recipes that need visibility

**Action:**
- Feature in homepage carousel
- Create social media posts
- Add to seasonal collections

**Track:**
- View count increase

### Use Case 3: Seasonal Content Strategy

**Find:**
- Recipes that spike during specific months
- Example: Spargel in April-May

**Action:**
- Prepare seasonal content calendars
- Pre-promote before peak season
- Create seasonal recipe collections

**Track:**
- Year-over-year growth

### Use Case 4: Content Gaps

**Find:**
- High search volume for terms with no recipes
- Example: "Glutenfrei" searches but few gluten-free recipes

**Action:**
- Create new recipes to fill gaps
- Tag existing recipes better
- Add dietary filter options

**Track:**
- Search result satisfaction

### Use Case 5: Social Sharing Optimization

**Find:**
- Recipes with high print rate but low share rate
- Great content that's not viral

**Action:**
- Improve share button visibility
- Add share incentives
- Optimize OG images

**Track:**
- Share rate improvement

---

## 📱 Mobile App Analytics (Future)

If you create a mobile app, track:

- Recipe saves/favorites
- Shopping list additions
- Offline recipe views
- Recipe ratings submitted
- Photo uploads (if feature exists)

---

## 🔧 Advanced Tracking Setup

### Track Iframe Events

To track events from the iframe (recipe.html), add this to `recipe.js`:

```javascript
// In deploy/recipe.js

// Track when user prints recipe
function trackPrintRecipe(recipe) {
  window.parent.postMessage({
    type: 'recipe_print',
    recipeName: recipe.name,
    recipeId: recipe.id
  }, '*');
}

// Track when user shares recipe
function trackShareRecipe(recipe, method) {
  window.parent.postMessage({
    type: 'recipe_share',
    recipeName: recipe.name,
    recipeId: recipe.id,
    method: method // 'facebook', 'twitter', 'copy', etc.
  }, '*');
}

// Track servings adjustment
function trackServingsAdjust(recipe, oldServings, newServings) {
  window.parent.postMessage({
    type: 'adjust_servings',
    recipeName: recipe.name,
    recipeId: recipe.id,
    oldServings: oldServings,
    newServings: newServings
  }, '*');
}
```

Then update the print button in `recipe.js`:

```javascript
// Replace:
<button onclick="window.print()" class="btn-action">

// With:
<button onclick="trackPrintRecipe(currentRecipe); window.print();" class="btn-action">
```

### Track Search and Filters

In `app.js`, add tracking to search/filter functions:

```javascript
// Track search
function performSearch(searchTerm) {
  // Existing search logic...

  // Track search event
  window.parent.postMessage({
    type: 'recipe_search',
    searchTerm: searchTerm
  }, '*');
}

// Track filter changes
function applyFilter(filterType, filterValue) {
  // Existing filter logic...

  // Track filter event
  window.parent.postMessage({
    type: 'recipe_filter',
    filterType: filterType,
    filterValue: filterValue
  }, '*');
}
```

---

## 📊 Google Data Studio Integration

For advanced visualizations:

1. Go to https://datastudio.google.com
2. Create new report
3. Add data source: Your GA4 property
4. Create custom visualizations:

### Visualization 1: Recipe Heatmap
- X-axis: Day of week
- Y-axis: Hour of day
- Color: Recipe views
- Shows when people cook

### Visualization 2: Recipe Journey Sankey Diagram
- Shows path: Overview → Category → Recipe → Action
- Identifies popular paths

### Visualization 3: Recipe Comparison
- Table with multiple metrics per recipe
- Sortable columns
- Conditional formatting

---

## 🎯 KPIs to Monitor

### Weekly KPIs
- Total recipe views
- Unique recipes viewed
- Average time per recipe
- Print rate
- Share rate

### Monthly KPIs
- New vs. returning visitors
- Top 10 recipes shift
- Category trends
- Search trends
- Engagement rate

### Quarterly KPIs
- Recipe portfolio growth
- User retention
- Seasonal performance
- Social traffic growth

---

## 🚨 Alerts to Set Up

Create alerts for:

1. **Traffic Spike**: Recipe views increase >50% in 1 hour
   - Could be viral content or press mention

2. **Traffic Drop**: Recipe views decrease >30% in 1 day
   - Could indicate technical issue

3. **Zero Data**: No events for 1 hour
   - Tracking might be broken

4. **New Search Terms**: First-time searches
   - Content opportunities

---

## 📈 Success Metrics

### Short Term (1-3 months)
- ✅ GA4 tracking implemented
- ✅ Basic dashboards created
- ✅ Top 10 recipes identified
- ✅ Baseline metrics established

### Medium Term (3-6 months)
- ✅ Recipe optimization based on data
- ✅ Content gaps filled
- ✅ Seasonal strategy implemented
- ✅ 20% increase in engagement

### Long Term (6-12 months)
- ✅ Predictive analytics for trends
- ✅ Personalization based on behavior
- ✅ Recipe recommendation engine
- ✅ 50% increase in recipe views

---

## 🔗 Resources

### Google Analytics 4
- Documentation: https://support.google.com/analytics
- GA4 Academy: https://analytics.google.com/analytics/academy/

### Data Studio
- Templates: https://datastudio.google.com/gallery

### Event Tracking Best Practices
- Google Guide: https://developers.google.com/analytics/devguides/collection/ga4/events

---

## 📞 Support

For analytics questions:
1. Check GA4 documentation
2. Review this guide
3. Test in GA4 DebugView mode
4. Consult with analytics expert if needed

---

## ✅ Quick Start Checklist

- [ ] Create GA4 property
- [ ] Get Measurement ID
- [ ] Update Shopify template with ID
- [ ] Test tracking in Realtime reports
- [ ] Create first custom report (Top Recipes)
- [ ] Set up weekly email report
- [ ] Share dashboard with team
- [ ] Start making data-driven decisions!

Your recipes will now have enterprise-level analytics! 📊🚀
