# Coolify Deployment Guide

## Quick Deploy to Coolify

### Prerequisites
- Coolify server running
- GitHub repository: https://github.com/johnnylafer/lafer-recipes

### Steps

1. **Login to Coolify Dashboard**

2. **Create New Resource**
   - Click "+ New Resource"
   - Select "Docker Compose"

3. **Connect to GitHub**
   - Repository: `johnnylafer/lafer-recipes`
   - Branch: `main`
   - Build Pack: `dockerfile`

4. **Configure**
   - Port: `80` (internal) → Map to your desired external port
   - Domain: Set your custom domain (e.g., `recipes.lafer.de`)
   - Environment variables: None needed

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~1-2 minutes)

### Alternative: Manual Docker Deploy

```bash
# Clone the repository
git clone https://github.com/johnnylafer/lafer-recipes.git
cd lafer-recipes

# Build and run
docker-compose up -d

# Or use docker directly
docker build -t lafer-recipes .
docker run -d -p 8080:80 --name lafer-recipes lafer-recipes
```

### Test Locally

```bash
docker-compose up
# Visit: http://localhost:8080
```

### Verify Deployment

After deployment, test a recipe URL:
```
https://your-domain.com/recipe.html?recipe=schwabische-maultaschen
```

The description should show the full AI-generated text, not the old generic one.

### Update Recipes

To update recipes after regenerating descriptions:

```bash
cd recipe-system
# After running your Python scripts to regenerate descriptions
git add deploy/recipes.json
git commit -m "Update recipe descriptions"
git push
```

Coolify will automatically rebuild and redeploy.

### Troubleshooting

**Build fails:**
- Check Coolify logs
- Verify Dockerfile is present
- Ensure deploy/ folder has all files

**Recipes not loading:**
- Check browser console for errors
- Verify recipes.json is accessible: `https://your-domain.com/recipes.json`
- Check nginx logs in Coolify

**Old descriptions still showing:**
- Clear browser cache (Cmd+Shift+R)
- Check recipes.json was updated in git
- Force rebuild in Coolify

### File Structure
```
.
├── Dockerfile              # Nginx container configuration
├── docker-compose.yml      # Docker Compose setup
├── nginx.conf             # Nginx server configuration
└── deploy/                # Static files served by nginx
    ├── index.html
    ├── recipe.html
    ├── recipes.json       # ⭐ Updated descriptions here
    ├── app.js
    ├── recipe.js
    ├── styles.css
    └── redirect_mapping.json
```
