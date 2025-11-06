# Johann Lafer Recipe System

A simple, clean recipe display system for all 351 Lafer recipes.

## 📁 Files Included

- `index.html` - Recipe overview page with grid, search, and filtering
- `recipe.html` - Individual recipe detail page
- `styles.css` - Lafer.de inspired styling
- `app.js` - JavaScript for overview page functionality
- `recipe.js` - JavaScript for recipe detail page
- `recipes.json` - All 351 recipes data

## 🚀 How to Use

### Option 1: Test Locally (Quickest)

1. Open Terminal and navigate to the `recipe-system` folder:
   ```bash
   cd "/Users/johnnylr/Downloads/LAFER RECIPES/recipe-system"
   ```

2. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser to:
   ```
   http://localhost:8000
   ```

4. You should see all 351 recipes!

### Option 2: Upload to Shopify

#### Method A: Shopify Files
1. In Shopify Admin, go to **Content** → **Files**
2. Upload all files from the `recipe-system` folder
3. Note the URLs of the uploaded files
4. Create a new page in Shopify with an iframe:
   ```html
   <iframe src="URL_TO_YOUR_INDEX_HTML" width="100%" height="800px" frameborder="0"></iframe>
   ```

#### Method B: Shopify Theme
1. In Shopify Admin, go to **Online Store** → **Themes**
2. Click **Actions** → **Edit code**
3. Upload files to **Assets** folder
4. Create a new template or page that includes these files

### Option 3: Use Shopify App Hosting (Recommended)

1. Zip the `recipe-system` folder
2. Use a Shopify app hosting service (like Netlify, Vercel, or GitHub Pages)
3. Deploy the folder
4. Embed the hosted URL in your Shopify pages

## 🎨 Features

### Overview Page (index.html)
- ✅ Beautiful grid layout with recipe cards
- ✅ Recipe images from AWS S3
- ✅ Search functionality (searches titles, descriptions, ingredients)
- ✅ Category filtering (top 10 categories as buttons)
- ✅ Recipe count display
- ✅ Responsive design (mobile-friendly)
- ✅ Lafer.de inspired styling

### Recipe Detail Page (recipe.html)
- ✅ Full recipe display with image
- ✅ Ingredients list
- ✅ Step-by-step directions (numbered)
- ✅ Prep time & cook time
- ✅ Servings information
- ✅ Tags/keywords
- ✅ Print button (print-optimized layout)
- ✅ Share button (native share or copy link)
- ✅ Back to overview link

## 📝 Customization

### Change Colors
Edit `styles.css` and modify the CSS variables:
```css
:root {
    --primary-color: #2c3e50;      /* Main heading color */
    --secondary-color: #e74c3c;    /* Accent color (buttons, tags) */
    --text-color: #333;            /* Body text */
    --border-color: #e0e0e0;       /* Borders */
}
```

### Add More Categories
The system automatically extracts categories from recipe keywords.
Top 10 are shown by default. To show more, edit `app.js` line 43:
```javascript
const topCategories = sortedCategories.slice(0, 10); // Change 10 to any number
```

### Change Layout
Edit the grid columns in `styles.css` line 103:
```css
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
/* Change 280px to adjust card size */
```

## 🌐 Embedding in Shopify

### Create a Recipes Page

1. Go to **Online Store** → **Pages** → **Add page**
2. Title: "Rezepte"
3. In the HTML editor, add:
   ```html
   <iframe src="YOUR_HOSTED_URL/index.html"
           width="100%"
           height="1200px"
           frameborder="0"
           style="border: none;">
   </iframe>
   ```

### SEO Tips

For better SEO, you can:
1. Create individual Shopify blog posts that link to recipe pages
2. Use the RecipeKit CSV as a backup
3. Add schema.org Recipe markup (can be added to recipe.html)

## 🐛 Troubleshooting

### Recipes Not Loading
- Check browser console for errors (F12)
- Make sure `recipes.json` is in the same folder
- Verify you're using a web server (not file:// URLs)

### Images Not Showing
- Images are hosted on AWS S3
- Check internet connection
- Some recipes may not have images

### Filtering Not Working
- Make sure JavaScript is enabled
- Check browser console for errors

## 📱 Mobile Optimization

The system is fully responsive and works great on:
- Desktop browsers
- Tablets
- Mobile phones

## 🎯 Next Steps

1. **Test locally first** to see how it looks
2. **Customize colors/styling** if needed
3. **Upload to a hosting service** for public access
4. **Embed in Shopify** using iframe

## 💡 Pro Tips

- Use a fast hosting service (Netlify, Vercel) for best performance
- Consider adding analytics to track popular recipes
- You can add more features later (favorites, ratings, etc.)
- The recipe data (`recipes.json`) can be updated anytime

## 📞 Questions?

If you need help:
1. Check browser console for errors
2. Verify all files are in the same folder
3. Make sure you're using a web server (not opening files directly)

Enjoy your custom recipe system! 🍳
