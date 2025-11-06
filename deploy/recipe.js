// Lafer Recipe System - Recipe Detail Page
let allRecipes = [];
let redirectMapping = {};
let currentRecipe = null;
let currentServings = 1;
let originalServings = 1;

// Load recipe on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadRecipes();
    await loadRedirectMapping();
    displayRecipe();
});

// Load recipes from JSON file
async function loadRecipes() {
    try {
        // Add cache busting parameter with version timestamp
        const version = '20251106'; // Update this when recipes.json changes
        const response = await fetch(`recipes.json?v=${version}`);
        allRecipes = await response.json();
    } catch (error) {
        console.error('Error loading recipes:', error);
        document.getElementById('recipeDetail').innerHTML = '<div class="loading">Fehler beim Laden des Rezepts</div>';
    }
}

// Load redirect mapping (slug → ID)
async function loadRedirectMapping() {
    try {
        const response = await fetch('redirect_mapping.json');
        redirectMapping = await response.json();
    } catch (error) {
        console.error('Error loading redirect mapping:', error);
        // Continue without redirect mapping
    }
}

// Get recipe ID or slug from URL
function getRecipeIdFromURL() {
    const params = new URLSearchParams(window.location.search);

    // Check for slug-based URL (?recipe=slug-name)
    const recipeSlug = params.get('recipe');
    if (recipeSlug) {
        // Look up ID from slug using redirect mapping
        const recipeId = redirectMapping[recipeSlug];
        if (recipeId) {
            return recipeId.toString();
        }
        // If not in mapping, try to find by slug directly
        return recipeSlug;
    }

    // Fall back to ID-based URL (?id=123)
    return params.get('id');
}

// Find recipe by ID or slug
function findRecipe(id) {
    return allRecipes.find(recipe =>
        recipe.id == id ||
        recipe.slug === id ||
        encodeURIComponent(recipe.name) === id
    );
}

// Display recipe
function displayRecipe() {
    const recipeId = getRecipeIdFromURL();

    if (!recipeId) {
        document.getElementById('recipeDetail').innerHTML = '<div class="loading">Kein Rezept gefunden</div>';
        return;
    }

    currentRecipe = findRecipe(recipeId);

    if (!currentRecipe) {
        document.getElementById('recipeDetail').innerHTML = '<div class="loading">Rezept nicht gefunden</div>';
        return;
    }

    // Add AI description and other metadata if not already present
    if (!currentRecipe.aiDescription) {
        currentRecipe.aiDescription = generateAIDescription(currentRecipe);
    }
    // Use AI category if available, otherwise fallback to keyword matching
    if (!currentRecipe.logicalCategory) {
        currentRecipe.logicalCategory = currentRecipe.aiCategory || categorizeRecipe(currentRecipe);
    }

    // Parse servings
    originalServings = parseInt(currentRecipe.yield) || 4;
    currentServings = originalServings;

    document.getElementById('recipeDetail').innerHTML = createRecipeDetailHTML(currentRecipe);
    document.title = `${currentRecipe.name} - Johann Lafer`;
}

// Import functions from app.js logic
function categorizeRecipe(recipe) {
    const keywords = recipe.keywords || [];
    const keywordsLower = keywords.map(k => k.toLowerCase());
    const name = recipe.name.toLowerCase();

    if (keywordsLower.some(k => ['dessert', 'nachspeise', 'kuchen', 'torte', 'eis', 'sorbet', 'mousse', 'strudel', 'schokolade', 'praline', 'konfekt', 'creme', 'eiscreme'].includes(k))) {
        return 'Desserts & Nachspeisen';
    }
    if (keywordsLower.some(k => ['suppe', 'bouillon', 'consommé', 'brühe'].includes(k)) || name.includes('suppe')) {
        return 'Suppen';
    }
    if (keywordsLower.some(k => ['salat'].includes(k)) || name.includes('salat')) {
        return 'Salate';
    }
    if (keywordsLower.some(k => ['vorspeise', 'carpaccio', 'terrine', 'amuse'].includes(k))) {
        return 'Vorspeisen';
    }
    if (keywordsLower.some(k => ['fisch', 'lachs', 'zander', 'forelle', 'thunfisch', 'dorade', 'garnelen', 'muscheln', 'hummer', 'scampi', 'meeresfrüchte', 'tintenfisch', 'kabeljau', 'scholle', 'zanderfilet'].includes(k))) {
        return 'Fisch & Meeresfrüchte';
    }
    if (keywordsLower.some(k => ['wild', 'reh', 'hirsch', 'wildschwein', 'fasan', 'wachtel', 'ente', 'gans', 'pute', 'hähnchen', 'huhn', 'taube', 'perlhuhn'].includes(k))) {
        return 'Wild & Geflügel';
    }
    if (keywordsLower.some(k => ['fleisch', 'rind', 'kalb', 'lamm', 'schwein', 'filet', 'steak', 'braten', 'gulasch', 'ragout'].includes(k))) {
        return 'Fleisch';
    }

    // Vegetarisch - only if no meat or fish detected
    const ingredients = (recipe.ingredients || []).join(' ').toLowerCase();
    const hasMeat = keywordsLower.some(k => ['fleisch', 'rind', 'kalb', 'lamm', 'schwein', 'hähnchen', 'pute', 'ente', 'gans', 'wild', 'reh', 'hirsch'].includes(k)) ||
                    name.match(/\b(fleisch|rind|kalb|lamm|schwein|hähnchen|pute|ente|gans|wild|reh|hirsch|chorizo|salami|schinken|speck|bacon)\b/) ||
                    ingredients.match(/\b(fleisch|rind|rindfleisch|kalb|kalbfleisch|lamm|lammfleisch|schwein|schweinefleisch|hähnchen|hühnchen|pute|putenfleisch|ente|entenbrust|gans|gänsebrust|wild|reh|rehfilet|hirsch|wildschwein|speck|bacon|schinken|prosciutto|serrano|chorizo|salami|wurst|bratwurst|blutwurst|leberwurst|mortadella|pancetta|lardo)\b/);
    const hasFish = keywordsLower.some(k => ['fisch', 'lachs', 'zander', 'forelle', 'thunfisch', 'dorade', 'hecht', 'meeresfrüchte', 'garnelen', 'muscheln'].includes(k)) ||
                    name.match(/\b(fisch|lachs|zander|forelle|thunfisch|dorade|hecht)\b/) ||
                    ingredients.match(/\b(fisch|lachs|zander|forelle|thunfisch|dorade|hecht|garnelen|muscheln|scampi|hummer)\b/);

    if (keywordsLower.some(k => ['gemüse', 'vegetarisch', 'kartoffel', 'kürbis', 'spargel', 'pilze', 'steinpilze', 'pfifferlinge', 'tofu', 'quinoa'].includes(k)) && !hasMeat && !hasFish) {
        return 'Vegetarisch';
    }
    if (keywordsLower.some(k => ['sauce', 'dip', 'pesto', 'vinaigrette', 'dressing', 'püree', 'beilage'].includes(k))) {
        return 'Saucen & Beilagen';
    }
    return 'Hauptgerichte';
}

function generateAIDescription(recipe) {
    const ingredients = recipe.ingredients || [];
    const keywords = recipe.keywords || [];
    const category = categorizeRecipe(recipe);

    const mainIngredients = ingredients.slice(0, 3).map(ing => {
        return ing.replace(/[\d\.,]+\s*(g|kg|ml|l|EL|TL|Prise|Msp\.?|Stück|Stk\.?|Bund|Zweig)/gi, '').trim();
    }).filter(ing => ing.length > 2);

    const isGrilled = keywords.some(k => k.toLowerCase().includes('grill'));
    const isRoasted = keywords.some(k => ['gebraten', 'braten'].includes(k.toLowerCase()));
    const isBaked = keywords.some(k => ['gebacken', 'backen', 'ofen'].includes(k.toLowerCase()));

    let desc = '';

    if (category === 'Desserts & Nachspeisen') {
        desc = mainIngredients.length > 0
            ? `Verführerische Nachspeise mit ${mainIngredients.slice(0, 2).join(' und ')}. Der perfekte Abschluss für jedes Menü.`
            : 'Eine süße Verführung für besondere Momente. Der perfekte Abschluss für jedes Menü.';
    } else if (category === 'Vorspeisen') {
        desc = mainIngredients.length > 0
            ? `Raffinierte Vorspeise mit ${mainIngredients[0]}. Perfekt für festliche Anlässe.`
            : 'Ein eleganter Auftakt für Ihr Menü. Perfekt für festliche Anlässe.';
    } else if (category === 'Suppen') {
        desc = mainIngredients.length > 0
            ? `Wärmende Suppe mit ${mainIngredients.slice(0, 2).join(' und ')}. Ideal für kalte Tage.`
            : 'Wärmend und aromatisch. Ideal für kalte Tage.';
    } else if (category === 'Fisch & Meeresfrüchte') {
        desc = isGrilled
            ? `Vom Grill mit unvergleichlichem Aroma. ${mainIngredients.length > 0 ? `Mit ${mainIngredients[0]}.` : ''}`
            : `Leicht und gesund. ${mainIngredients.length > 0 ? `Mit ${mainIngredients[0]}.` : ''}`;
    } else if (category === 'Fleisch') {
        const style = isGrilled ? 'Saftig vom Grill.' : isRoasted ? 'Perfekt angebraten.' : isBaked ? 'Zart im Ofen gegart.' : '';
        desc = `${style} ${mainIngredients.length > 0 ? `Mit ${mainIngredients[0]}.` : ''} Ein herzhaftes Hauptgericht.`.trim();
    } else if (category === 'Wild & Geflügel') {
        desc = mainIngredients.length > 0
            ? `Edles Hauptgericht mit ${mainIngredients[0]}. Perfekt für besondere Anlässe.`
            : 'Edles Hauptgericht für besondere Anlässe.';
    } else if (category === 'Vegetarisch') {
        desc = mainIngredients.length > 0
            ? `Frisches Gemüsegericht mit ${mainIngredients.slice(0, 2).join(' und ')}. Voller Geschmack.`
            : 'Frisch und gesund. Voller Geschmack.';
    } else {
        const style = isGrilled ? 'Aromatisch vom Grill.' : isRoasted ? 'Mit knuspriger Kruste.' : isBaked ? 'Schonend gegart.' : '';
        desc = `${style} ${mainIngredients.length > 0 ? `Mit ${mainIngredients[0]}.` : ''} Ein Genuss für die ganze Familie.`.trim();
    }

    return desc.trim();
}

// Generate better description if missing
function generateDescription(recipe) {
    const desc = recipe.description ? recipe.description.replace(/<[^>]*>/g, '').trim() : '';

    // If description is just the title or empty, generate a better one
    if (!desc || desc === recipe.name || desc.length < 20) {
        const ingredients = recipe.ingredients || [];
        const mainIngredients = ingredients.slice(0, 3).map(ing => {
            // Extract just the ingredient name (remove quantities)
            return ing.replace(/[\d\.,]+\s*(g|kg|ml|l|EL|TL|Prise|Msp\.?|Stück|Stk\.?|Bund|Zweig)/gi, '').trim();
        }).filter(ing => ing.length > 2);

        if (mainIngredients.length > 0) {
            return `Ein köstliches Rezept von Johann Lafer mit ${mainIngredients.join(', ')}. Perfekt für besondere Anlässe oder als raffiniertes Gericht für jeden Tag.`;
        }
    }

    return desc || 'Ein exquisites Rezept aus der Küche von Johann Lafer.';
}

// Determine difficulty level
function getDifficulty(recipe) {
    // Use difficulty from recipe data if available (AI-generated)
    if (recipe.difficulty) {
        const difficultyMap = {
            'Einfach': { level: 'Einfach', class: 'easy' },
            'Mittel': { level: 'Mittel', class: 'medium' },
            'Anspruchsvoll': { level: 'Anspruchsvoll', class: 'hard' }
        };
        return difficultyMap[recipe.difficulty] || { level: 'Mittel', class: 'medium' };
    }

    // Fallback: calculate from steps and ingredients
    const steps = (recipe.instructions || []).length;
    const ingredients = (recipe.ingredients || []).length;

    if (steps <= 3 && ingredients <= 5) return { level: 'Einfach', class: 'easy' };
    if (steps <= 5 && ingredients <= 10) return { level: 'Mittel', class: 'medium' };
    return { level: 'Anspruchsvoll', class: 'hard' };
}

// Get dietary tags
function getDietaryTags(recipe) {
    const keywords = (recipe.keywords || []).map(k => k.toLowerCase());
    const name = recipe.name.toLowerCase();
    const ingredients = (recipe.ingredients || []).join(' ').toLowerCase();
    const tags = [];

    // Check if it's a fish/meat recipe first
    const hasFish = keywords.some(k => ['fisch', 'lachs', 'zander', 'forelle', 'thunfisch', 'dorade', 'hecht', 'meeresfrüchte', 'garnelen', 'muscheln'].includes(k)) ||
                    name.match(/\b(fisch|lachs|zander|forelle|thunfisch|dorade|hecht)\b/) ||
                    ingredients.match(/\b(fisch|lachs|zander|forelle|thunfisch|dorade|hecht|garnelen|muscheln|scampi|hummer)\b/);

    const hasMeat = keywords.some(k => ['fleisch', 'rind', 'kalb', 'lamm', 'schwein', 'hähnchen', 'pute', 'ente', 'gans', 'wild', 'reh', 'hirsch'].includes(k)) ||
                    name.match(/\b(fleisch|rind|kalb|lamm|schwein|hähnchen|pute|ente|gans|wild|reh|hirsch|chorizo|salami|schinken|speck|bacon)\b/) ||
                    ingredients.match(/\b(fleisch|rind|rindfleisch|kalb|kalbfleisch|lamm|lammfleisch|schwein|schweinefleisch|hähnchen|hühnchen|pute|putenfleisch|ente|entenbrust|gans|gänsebrust|wild|reh|rehfilet|hirsch|wildschwein|speck|bacon|schinken|prosciutto|serrano|chorizo|salami|wurst|bratwurst|blutwurst|leberwurst|mortadella|pancetta|lardo)\b/);

    // Only add vegetarian tag if no fish or meat
    if (keywords.some(k => ['vegetarisch', 'gemüse'].includes(k)) && !hasFish && !hasMeat) {
        tags.push({ name: 'Vegetarisch', class: 'veg' });
    }

    if (hasFish) tags.push({ name: 'Fisch', class: 'fish' });
    if (keywords.some(k => ['dessert', 'nachspeise', 'süß'].includes(k))) tags.push({ name: 'Dessert', class: 'dessert' });
    if (keywords.some(k => ['suppe'].includes(k))) tags.push({ name: 'Suppe', class: 'soup' });

    return tags;
}

// Adjust servings
function adjustServings(change) {
    currentServings = Math.max(1, currentServings + change);
    document.getElementById('recipeDetail').innerHTML = createRecipeDetailHTML(currentRecipe);
}

// Scale ingredient quantities
function scaleIngredient(ingredient) {
    if (currentServings === originalServings) return ingredient;

    const ratio = currentServings / originalServings;

    // Match numbers (including decimals) followed by units
    return ingredient.replace(/(\d+(?:[,\.]\d+)?)\s*(g|kg|ml|l|EL|TL|Prise|Msp\.?|Stück|Stk\.?|Bund|Zweig)?/gi, (match, number, unit) => {
        const num = parseFloat(number.replace(',', '.'));
        const scaled = (num * ratio).toFixed(1).replace('.0', '');
        return `${scaled}${unit ? ' ' + unit : ''}`;
    });
}

// Helper: Get Cloudflare CDN image URL with responsive variant
function getRecipeImage(recipe, variant = 'public') {
    // Priority 1: Use Cloudflare CDN URL with variant (new images)
    if (recipe.image) {
        // Extract image ID from Cloudflare URL
        const match = recipe.image.match(/\/([^\/]+)\/public$/);
        if (match) {
            const imageId = match[1];
            return `https://imagedelivery.net/k123YNRgq-hfLvhLvzSxbg/${imageId}/${variant}`;
        }
        return recipe.image; // Fallback to direct URL
    }

    // Priority 2: Fallback to old imageUrls format
    return recipe.imageUrls?.['16x9']?.L || recipe.imageUrls?.['4x3']?.L || recipe.imageUrls?.original || '';
}

// Create recipe detail HTML
function createRecipeDetailHTML(recipe) {
    const imageUrl = getRecipeImage(recipe, 'public'); // Use high-res 2048x1536 for detail page

    // Use AI estimatedTime if available, otherwise use original times
    let totalTime = recipe.estimatedTime || 0;
    let prepTime = null;
    let cookTime = null;

    // If we have original times, use those for display
    if (recipe.prepSeconds || recipe.cookSeconds) {
        prepTime = recipe.prepSeconds ? Math.round(recipe.prepSeconds / 60) : null;
        cookTime = recipe.cookSeconds ? Math.round(recipe.cookSeconds / 60) : null;
        totalTime = (prepTime || 0) + (cookTime || 0);
    }

    // Use description from JSON if available, otherwise generate one
    const description = recipe.description ? recipe.description.replace(/<[^>]*>/g, '').trim() : generateDescription(recipe);
    const difficulty = getDifficulty(recipe);
    const dietaryTags = getDietaryTags(recipe);

    const ingredients = recipe.ingredients || [];
    const directions = recipe.instructions || [];

    return `
        <div class="recipe-detail-header">
            <h1 class="recipe-detail-title">${recipe.name}</h1>

            <p class="recipe-detail-description">${description}</p>

            <div class="recipe-detail-meta">
                <div class="recipe-servings">
                    <button onclick="adjustServings(-1)" class="serving-btn" aria-label="Portionen reduzieren">−</button>
                    <span><strong>${currentServings}</strong> ${currentServings === 1 ? 'Portion' : 'Portionen'}</span>
                    <button onclick="adjustServings(1)" class="serving-btn" aria-label="Portionen erhöhen">+</button>
                </div>
                ${prepTime ? `<div><strong>${prepTime} Min.</strong> Vorbereitung</div>` : ''}
                ${cookTime ? `<div><strong>${cookTime} Min.</strong> Kochzeit</div>` : ''}
                ${totalTime > 0 ? `<div><strong>${totalTime} Min.</strong> Gesamt</div>` : ''}
                <div class="difficulty difficulty-${difficulty.class}"><strong>${difficulty.level}</strong></div>
            </div>

            ${dietaryTags.length > 0 ? `
                <div class="dietary-tags">
                    ${dietaryTags.map(tag => `<span class="dietary-tag dietary-${tag.class}">${tag.name}</span>`).join('')}
                </div>
            ` : ''}

            ${imageUrl ? `<img src="${imageUrl}" alt="${recipe.name}" class="recipe-detail-image" loading="lazy">` : ''}
        </div>

        <div class="recipe-detail-body">
            ${ingredients.length > 0 ? `
                <div class="recipe-detail-section">
                    <h2>Zutaten</h2>
                    <ul class="recipe-ingredients">
                        ${ingredients.map(ing => `<li><label><input type="checkbox" class="ingredient-check print-hide"> ${cleanHTML(scaleIngredient(ing))}</label></li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${directions.length > 0 ? `
                <div class="recipe-detail-section">
                    <h2>Zubereitung</h2>
                    <ol class="recipe-directions">
                        ${directions.map(dir => `<li>${cleanHTML(dir)}</li>`).join('')}
                    </ol>
                </div>
            ` : ''}
        </div>

        ${recipe.notes ? `
            <div class="recipe-detail-section recipe-notes">
                <h2>Tipp vom Chefkoch</h2>
                <p>${cleanHTML(recipe.notes)}</p>
            </div>
        ` : ''}

        <div class="recipe-footer print-hide">
            <p class="recipe-author">Ein Rezept von <strong>Johann Lafer</strong></p>
        </div>
    `;
}

// Clean HTML tags
function cleanHTML(text) {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '');
}

// Share recipe function
function shareRecipe() {
    if (!currentRecipe) return;

    // Build the proper Lafer.de URL with the recipe slug
    const recipeSlug = currentRecipe.slug || currentRecipe.id;
    const laferUrl = `https://lafer.de/pages/rezepte?recipe=${recipeSlug}`;

    const shareData = {
        title: currentRecipe.name,
        text: `Probiere dieses Rezept von Johann Lafer: ${currentRecipe.name}`,
        url: laferUrl
    };

    // Try native share API (mobile share sheet)
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Recipe shared successfully'))
            .catch(err => {
                // User cancelled or error occurred
                if (err.name !== 'AbortError') {
                    console.log('Error sharing:', err);
                    // Fallback to clipboard
                    copyToClipboard(laferUrl);
                }
            });
    } else {
        // Fallback for browsers without share API
        copyToClipboard(laferUrl);
    }
}

// Helper function to copy to clipboard
function copyToClipboard(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
            .then(() => {
                alert('Link wurde in die Zwischenablage kopiert! ✓');
            })
            .catch(() => {
                // Fallback for clipboard API failure
                showCopyPrompt(url);
            });
    } else {
        // Fallback for older browsers
        showCopyPrompt(url);
    }
}

// Show prompt with URL to copy manually
function showCopyPrompt(url) {
    const input = prompt('Kopiere diesen Link:', url);
    // User has to manually copy
}

// Make functions available globally
window.shareRecipe = shareRecipe;
window.adjustServings = adjustServings;
