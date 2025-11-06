// Recipe data
let allRecipes = [];
let filteredRecipes = [];
let activeFilters = {
    category: 'Alle',
    time: 'Alle',
    timeMin: 0,
    timeMax: Infinity,
    allergens: [],
    season: 'Alle',
    dietary: [],
    cookingMethod: 'Alle',
    difficulty: 'Alle',
    occasion: 'Alle',
    costLevel: 'Alle'
};

// Load recipes from JSON
async function loadRecipes() {
    try {
        // Add cache busting parameter with version timestamp
        const version = '20251106b'; // Update this when recipes.json changes
        const response = await fetch(`recipes.json?v=${version}`);
        allRecipes = await response.json();

        // Add logical categories and metadata to each recipe
        allRecipes = allRecipes.map(recipe => ({
            ...recipe,
            // Use AI-generated category if available, otherwise fallback to keyword matching
            logicalCategory: recipe.aiCategory || categorizeRecipe(recipe),
            // Use AI-generated season for tags, fallback to keyword matching
            seasonalTags: recipe.season ? [{ name: recipe.season }] : getSeasonalTags(recipe),
            aiDescription: recipe.description ? recipe.description.replace(/<[^>]*>/g, '').trim() : generateAIDescription(recipe),
            // Use AI allergens if available, fallback to regex detection
            allergens: recipe.aiAllergens || detectAllergens(recipe),
            totalTime: recipe.estimatedTime || calculateTotalTime(recipe)
        }));

        filteredRecipes = allRecipes;

        // Display featured recipes first
        displayFeaturedRecipes();

        setupCategoryButtons();
        setupTimeFilters();
        setupAllergenFilters();
        setupSeasonFilters();
        setupDietaryFilters();
        setupCookingMethodFilters();
        setupDifficultyFilters();
        setupOccasionFilters();
        setupCostFilters();
        displayRecipes(filteredRecipes);
        setupSearchFilter();
    } catch (error) {
        document.getElementById('recipeGrid').innerHTML = '<div class="loading">Fehler beim Laden der Rezepte</div>';
        console.error('Error loading recipes:', error);
    }
}

// Calculate total cooking time in minutes
function calculateTotalTime(recipe) {
    const prep = recipe.prepSeconds ? Math.round(recipe.prepSeconds / 60) : 0;
    const cook = recipe.cookSeconds ? Math.round(recipe.cookSeconds / 60) : 0;
    return prep + cook;
}

// Detect allergens in recipe
function detectAllergens(recipe) {
    const ingredientsText = (recipe.ingredients || []).join(' ').toLowerCase();
    const nameText = recipe.name.toLowerCase();
    const allergens = [];

    // Milchprodukte - be specific to avoid false positives
    if (ingredientsText.match(/\b(milch|sahne|butter|käse|joghurt|quark|mascarpone|parmesan|mozzarella|ricotta|crème|creme|frischkäse|schlagsahne|schmand)\b/)) {
        allergens.push('Milchprodukte');
    }

    // Gluten - check for wheat/flour based products
    if (ingredientsText.match(/\b(weizenmehl|mehl|brot|brötchen|pasta|nudeln|spaghetti|penne|weizen|roggen|dinkel|grieß|couscous)\b/) ||
        nameText.match(/\b(pasta|nudel|brot)\b/)) {
        allergens.push('Gluten');
    }

    // Eier - check for egg in singular/plural forms
    if (ingredientsText.match(/\b(ei|eier|eigelb|eiweiß|eidotter)\b/)) {
        allergens.push('Eier');
    }

    // Nüsse - be careful not to match "muskatnuss" (nutmeg)
    if (ingredientsText.match(/\b(haselnuss|haselnüsse|walnuss|walnüsse|mandeln?|erdnuss|erdnüsse|cashew|pistazien?|macadamia|pekannuss)\b/)) {
        allergens.push('Nüsse');
    }

    // Fisch - specific fish types
    if (ingredientsText.match(/\b(fisch|lachs|lachsfilet|thunfisch|forelle|zander|zanderfilet|kabeljau|scholle|seelachs|dorade|rotbarsch|hering|makrele)\b/) ||
        nameText.match(/\b(fisch|lachs|zander|forelle)\b/)) {
        allergens.push('Fisch');
    }

    // Meeresfrüchte/Krustentiere - separate from fish
    if (ingredientsText.match(/\b(garnelen|garnele|muscheln?|hummer|scampi|meeresfrüchte|tintenfisch|krebse?|langusten?|jakobsmuscheln?|austern?)\b/)) {
        allergens.push('Meeresfrüchte');
    }

    // Soja
    if (ingredientsText.match(/\b(soja|tofu|sojasauce|sojasoße|edamame)\b/)) {
        allergens.push('Soja');
    }

    // Sellerie
    if (ingredientsText.match(/\b(sellerie|staudensellerie|knollensellerie)\b/)) {
        allergens.push('Sellerie');
    }

    // Senf
    if (ingredientsText.match(/\b(senf|dijonsenf)\b/)) {
        allergens.push('Senf');
    }

    return allergens;
}

// Generate AI-quality description for SEO
function generateAIDescription(recipe) {
    const ingredients = recipe.ingredients || [];
    const keywords = recipe.keywords || [];
    const category = categorizeRecipe(recipe);

    // Calculate time
    const totalTime = calculateTotalTime(recipe);

    // Extract main ingredients (first 2-3)
    const mainIngredients = ingredients.slice(0, 3).map(ing => {
        return ing.replace(/[\d\.,]+\s*(g|kg|ml|l|EL|TL|Prise|Msp\.?|Stück|Stk\.?|Bund|Zweig)/gi, '').trim();
    }).filter(ing => ing.length > 2);

    // Determine cooking style
    const isGrilled = keywords.some(k => k.toLowerCase().includes('grill'));
    const isRoasted = keywords.some(k => ['gebraten', 'braten'].includes(k.toLowerCase()));
    const isBaked = keywords.some(k => ['gebacken', 'backen', 'ofen'].includes(k.toLowerCase()));

    // Build varied descriptions
    let desc = '';

    if (category === 'Desserts & Nachspeisen') {
        const variants = [
            mainIngredients.length > 0
                ? `Verführerische Nachspeise mit ${mainIngredients.slice(0, 2).join(' und ')}.`
                : 'Eine süße Verführung für besondere Momente.',
            'Der perfekte Abschluss für jedes Menü.',
            totalTime > 0 && totalTime <= 45 ? `Schnell zubereitet in ${totalTime} Minuten.` : ''
        ];
        desc = variants.filter(v => v).join(' ');
    } else if (category === 'Vorspeisen') {
        const variants = [
            mainIngredients.length > 0
                ? `Raffinierte Vorspeise mit ${mainIngredients[0]}.`
                : 'Ein eleganter Auftakt für Ihr Menü.',
            totalTime > 0 && totalTime <= 30 ? 'Schnell und unkompliziert.' : 'Perfekt für festliche Anlässe.'
        ];
        desc = variants.filter(v => v).join(' ');
    } else if (category === 'Suppen') {
        desc = mainIngredients.length > 0
            ? `Wärmende Suppe mit ${mainIngredients.slice(0, 2).join(' und ')}. Ideal für kalte Tage.`
            : 'Wärmend und aromatisch. Ideal für kalte Tage.';
    } else if (category === 'Fisch & Meeresfrüchte') {
        const variants = [
            isGrilled ? 'Vom Grill mit unvergleichlichem Aroma.' : 'Leicht und gesund.',
            mainIngredients.length > 0 ? `Mit ${mainIngredients[0]}.` : '',
            totalTime > 0 && totalTime <= 40 ? 'Schnell zubereitet.' : ''
        ];
        desc = variants.filter(v => v).join(' ');
    } else if (category === 'Fleisch') {
        const variants = [
            isGrilled ? 'Saftig vom Grill.' : isRoasted ? 'Perfekt angebraten.' : isBaked ? 'Zart im Ofen gegart.' : '',
            mainIngredients.length > 0 ? `Mit ${mainIngredients[0]}.` : '',
            'Ein herzhaftes Hauptgericht.'
        ];
        desc = variants.filter(v => v).join(' ');
    } else if (category === 'Wild & Geflügel') {
        desc = mainIngredients.length > 0
            ? `Edles Hauptgericht mit ${mainIngredients[0]}. Perfekt für besondere Anlässe.`
            : 'Edles Hauptgericht für besondere Anlässe.';
    } else if (category === 'Vegetarisch') {
        const variants = [
            mainIngredients.length > 0 ? `Frisches Gemüsegericht mit ${mainIngredients.slice(0, 2).join(' und ')}.` : 'Frisch und gesund.',
            totalTime > 0 && totalTime <= 30 ? 'Schnell zubereitet.' : 'Voller Geschmack.'
        ];
        desc = variants.filter(v => v).join(' ');
    } else {
        // Hauptgerichte and default
        const variants = [
            isGrilled ? 'Aromatisch vom Grill.' : isRoasted ? 'Mit knuspriger Kruste.' : isBaked ? 'Schonend gegart.' : '',
            mainIngredients.length > 0 ? `Mit ${mainIngredients[0]}.` : '',
            totalTime > 0 && totalTime <= 30 ? 'Schnell auf dem Tisch.' : 'Ein Genuss für die ganze Familie.'
        ];
        desc = variants.filter(v => v).join(' ');
    }

    return desc.trim();
}

// Get seasonal tags based on keywords and current date
function getSeasonalTags(recipe) {
    const keywords = (recipe.keywords || []).map(k => k.toLowerCase());
    const tags = [];
    const now = new Date();
    const month = now.getMonth(); // 0-11

    // Holiday detection
    if (month === 11) { // December
        if (keywords.some(k => ['weihnachten', 'advent', 'festlich', 'gans', 'ente'].includes(k))) {
            tags.push({ name: 'Weihnachten' });
        }
        if (keywords.some(k => ['silvester', 'neujahr'].includes(k))) {
            tags.push({ name: 'Silvester' });
        }
    }

    if (month === 1 || month === 2) { // Feb-March
        if (keywords.some(k => ['fasching', 'karneval', 'krapfen'].includes(k))) {
            tags.push({ name: 'Fasching' });
        }
    }

    if (month === 3) { // April
        if (keywords.some(k => ['ostern', 'lamm', 'ei', 'hase'].includes(k))) {
            tags.push({ name: 'Ostern' });
        }
    }

    if (month === 9) { // October
        if (keywords.some(k => ['kürbis', 'halloween'].includes(k))) {
            tags.push({ name: 'Halloween' });
        }
    }

    // Seasonal ingredients
    if (month >= 2 && month <= 5) { // Spring
        if (keywords.some(k => ['spargel', 'bärlauch', 'erdbeeren'].includes(k))) {
            tags.push({ name: 'Frühling' });
        }
    }

    if (month >= 5 && month <= 8) { // Summer
        if (keywords.some(k => ['grill', 'bbq', 'salat', 'tomate', 'zucchini'].includes(k))) {
            tags.push({ name: 'Sommer' });
        }
    }

    if (month >= 8 && month <= 10) { // Autumn
        if (keywords.some(k => ['kürbis', 'pilze', 'wild', 'kastanie'].includes(k))) {
            tags.push({ name: 'Herbst' });
        }
    }

    if (month === 11 || month === 0 || month === 1) { // Winter
        if (keywords.some(k => ['suppe', 'eintopf', 'braten', 'kohl'].includes(k))) {
            tags.push({ name: 'Winter' });
        }
    }

    return tags;
}

// Display featured recipes at the top
function displayFeaturedRecipes() {
    const featuredContainer = document.getElementById('featuredRecipes');
    if (!featuredContainer) return;

    const now = new Date();
    const month = now.getMonth(); // 0-11

    // Determine current season
    let currentSeason;
    if (month >= 2 && month <= 4) currentSeason = 'Frühling';
    else if (month >= 5 && month <= 7) currentSeason = 'Sommer';
    else if (month >= 8 && month <= 10) currentSeason = 'Herbst';
    else currentSeason = 'Winter';

    // Get recipes from current season using AI season data
    let featured = allRecipes.filter(r => {
        // Check AI season field first
        if (r.season === currentSeason) return true;
        // Fallback to seasonal tags
        const tags = r.seasonalTags || [];
        return tags.some(tag => tag.name === currentSeason);
    });

    // If not enough seasonal recipes, add some "Ganzjährig" ones
    if (featured.length < 4) {
        const yearRound = allRecipes.filter(r => r.season === 'Ganzjährig' && !featured.includes(r));
        featured = [...featured, ...yearRound];
    }

    // If still not enough, add random ones
    if (featured.length < 4) {
        const others = allRecipes.filter(r => !featured.includes(r));
        const random = others.sort(() => 0.5 - Math.random()).slice(0, 4 - featured.length);
        featured = [...featured, ...random];
    }

    // Shuffle and limit to 4 featured
    featured = featured.sort(() => 0.5 - Math.random()).slice(0, 4);

    const html = `
        <div class="featured-section">
            <h2 class="featured-title">Empfohlene Rezepte</h2>
            <div class="featured-grid">
                ${featured.map(recipe => createFeaturedCard(recipe)).join('')}
            </div>
        </div>
    `;

    featuredContainer.innerHTML = html;
}

// Helper: Get Cloudflare CDN image URL with responsive variant
function getRecipeImage(recipe, variant = 'tablet') {
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
    return recipe.imageUrls?.['4x3']?.L || recipe.imageUrls?.original || '';
}

// Create featured recipe card
function createFeaturedCard(recipe) {
    const imageUrl = getRecipeImage(recipe, 'tablet'); // 1024x768 for featured cards
    const seasonalTag = recipe.seasonalTags && recipe.seasonalTags[0];
    const description = recipe.aiDescription || '';
    const recipeUrl = recipe.slug ? `recipe.html?recipe=${recipe.slug}` : `recipe.html?id=${recipe.id}`;

    return `
        <a href="${recipeUrl}" class="featured-card" onclick="handleRecipeClick(event, '${recipe.slug || recipe.id}')">
            ${seasonalTag ? `<span class="featured-badge">${seasonalTag.name}</span>` : ''}
            ${imageUrl ? `<img src="${imageUrl}" alt="${recipe.name}" class="featured-image" loading="lazy">` : ''}
            <div class="featured-content">
                <h3 class="featured-card-title">${recipe.name}</h3>
                ${description ? `<p class="featured-description">${description.substring(0, 120)}...</p>` : ''}
                <span class="featured-category">${recipe.logicalCategory}</span>
            </div>
        </a>
    `;
}

// Categorize recipes based on keywords
function categorizeRecipe(recipe) {
    const keywords = recipe.keywords || [];
    const keywordsLower = keywords.map(k => k.toLowerCase());
    const name = recipe.name.toLowerCase();

    // Desserts & Nachspeisen
    if (keywordsLower.some(k => ['dessert', 'nachspeise', 'kuchen', 'torte', 'eis', 'sorbet', 'mousse', 'strudel', 'schokolade', 'praline', 'konfekt', 'creme', 'eiscreme'].includes(k))) {
        return 'Desserts & Nachspeisen';
    }

    // Suppen
    if (keywordsLower.some(k => ['suppe', 'bouillon', 'consommé', 'brühe'].includes(k)) || name.includes('suppe')) {
        return 'Suppen';
    }

    // Salate
    if (keywordsLower.some(k => ['salat'].includes(k)) || name.includes('salat')) {
        return 'Salate';
    }

    // Vorspeisen
    if (keywordsLower.some(k => ['vorspeise', 'carpaccio', 'terrine', 'amuse'].includes(k))) {
        return 'Vorspeisen';
    }

    // Fisch & Meeresfrüchte
    if (keywordsLower.some(k => ['fisch', 'lachs', 'zander', 'forelle', 'thunfisch', 'dorade', 'garnelen', 'muscheln', 'hummer', 'scampi', 'meeresfrüchte', 'tintenfisch', 'kabeljau', 'scholle', 'zanderfilet'].includes(k))) {
        return 'Fisch & Meeresfrüchte';
    }

    // Wild & Geflügel
    if (keywordsLower.some(k => ['wild', 'reh', 'hirsch', 'wildschwein', 'fasan', 'wachtel', 'ente', 'gans', 'pute', 'hähnchen', 'huhn', 'taube', 'perlhuhn'].includes(k))) {
        return 'Wild & Geflügel';
    }

    // Fleisch
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

    // Saucen & Beilagen
    if (keywordsLower.some(k => ['sauce', 'dip', 'pesto', 'vinaigrette', 'dressing', 'püree', 'beilage'].includes(k))) {
        return 'Saucen & Beilagen';
    }

    // Default to Hauptgerichte
    return 'Hauptgerichte';
}

// Setup category filter buttons
function setupCategoryButtons() {
    const categories = ['Alle'];
    const categoryCount = {};

    // Count recipes per logical category
    allRecipes.forEach(recipe => {
        const cat = recipe.logicalCategory;
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        if (!categories.includes(cat)) {
            categories.push(cat);
        }
    });

    // Sort categories by count (most popular first)
    const sortedCategories = categories.slice(1).sort((a, b) => {
        return (categoryCount[b] || 0) - (categoryCount[a] || 0);
    });

    sortedCategories.unshift('Alle');

    const categoryButtonsContainer = document.getElementById('categoryButtons');
    categoryButtonsContainer.innerHTML = '';

    sortedCategories.forEach(category => {
        const count = category === 'Alle' ? allRecipes.length : (categoryCount[category] || 0);
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = `${category} (${count})`;
        btn.dataset.category = category;

        btn.addEventListener('click', () => {
            // Remove active from all category buttons
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilters.category = category;
            applyFilters();
        });

        categoryButtonsContainer.appendChild(btn);
    });
}

// Setup time filter buttons
function setupTimeFilters() {
    const timeButtonsContainer = document.getElementById('timeButtons');
    if (!timeButtonsContainer) return;

    const timeRanges = [
        { label: 'Alle Zeiten', value: 'Alle', min: 0, max: Infinity },
        { label: 'Unter 30 Min.', value: '<30', min: 0, max: 30 },
        { label: '30-60 Min.', value: '30-60', min: 30, max: 60 },
        { label: 'Über 60 Min.', value: '>60', min: 60, max: Infinity }
    ];

    timeButtonsContainer.innerHTML = '';

    timeRanges.forEach(range => {
        const count = range.value === 'Alle'
            ? allRecipes.length
            : allRecipes.filter(r => r.totalTime >= range.min && r.totalTime < range.max).length;

        const btn = document.createElement('button');
        btn.className = 'filter-btn time-btn';
        if (range.value === 'Alle') btn.classList.add('active');
        btn.textContent = `${range.label} (${count})`;
        btn.dataset.timeFilter = range.value;
        btn.dataset.min = range.min;
        btn.dataset.max = range.max;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilters.time = range.value;
            activeFilters.timeMin = range.min;
            activeFilters.timeMax = range.max;
            applyFilters();
        });

        timeButtonsContainer.appendChild(btn);
    });
}

// Setup allergen filter buttons
function setupAllergenFilters() {
    const allergenButtonsContainer = document.getElementById('allergenButtons');
    if (!allergenButtonsContainer) return;

    // Get all unique allergens
    const allergenSet = new Set();
    allRecipes.forEach(recipe => {
        recipe.allergens.forEach(allergen => allergenSet.add(allergen));
    });

    const allergens = Array.from(allergenSet).sort();

    allergenButtonsContainer.innerHTML = '';

    allergens.forEach(allergen => {
        const count = allRecipes.filter(r => !r.allergens.includes(allergen)).length;

        const btn = document.createElement('button');
        btn.className = 'filter-btn allergen-btn';
        btn.textContent = `Ohne ${allergen} (${count})`;
        btn.dataset.allergen = allergen;

        btn.addEventListener('click', () => {
            btn.classList.toggle('active');

            if (btn.classList.contains('active')) {
                activeFilters.allergens.push(allergen);
            } else {
                activeFilters.allergens = activeFilters.allergens.filter(a => a !== allergen);
            }

            applyFilters();
        });

        allergenButtonsContainer.appendChild(btn);
    });
}

// Setup season filter buttons
function setupSeasonFilters() {
    const seasonButtonsContainer = document.getElementById('seasonButtons');
    if (!seasonButtonsContainer) return;

    const seasons = ['Alle', 'Frühling', 'Sommer', 'Herbst', 'Winter', 'Ganzjährig'];

    seasonButtonsContainer.innerHTML = '';

    seasons.forEach(season => {
        const count = season === 'Alle'
            ? allRecipes.length
            : allRecipes.filter(r => r.season === season).length;

        const btn = document.createElement('button');
        btn.className = `filter-btn season-btn ${season === 'Alle' ? 'active' : ''}`;
        btn.textContent = `${season} (${count})`;
        btn.dataset.season = season;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.season = season;
            applyFilters();
        });

        seasonButtonsContainer.appendChild(btn);
    });
}

// Setup dietary restrictions filter buttons
function setupDietaryFilters() {
    const dietaryButtonsContainer = document.getElementById('dietaryButtons');
    if (!dietaryButtonsContainer) return;

    // Get all unique dietary restrictions
    const dietarySet = new Set();
    allRecipes.forEach(recipe => {
        if (recipe.dietary && Array.isArray(recipe.dietary)) {
            recipe.dietary.forEach(d => dietarySet.add(d));
        }
    });

    const dietary = Array.from(dietarySet).sort();

    dietaryButtonsContainer.innerHTML = '';

    dietary.forEach(d => {
        const count = allRecipes.filter(r => r.dietary && r.dietary.includes(d)).length;

        const btn = document.createElement('button');
        btn.className = 'filter-btn dietary-btn';
        btn.textContent = `${d} (${count})`;
        btn.dataset.dietary = d;

        btn.addEventListener('click', () => {
            btn.classList.toggle('active');

            if (btn.classList.contains('active')) {
                activeFilters.dietary.push(d);
            } else {
                activeFilters.dietary = activeFilters.dietary.filter(item => item !== d);
            }

            applyFilters();
        });

        dietaryButtonsContainer.appendChild(btn);
    });
}

// Setup cooking method filter buttons
function setupCookingMethodFilters() {
    const cookingMethodButtonsContainer = document.getElementById('cookingMethodButtons');
    if (!cookingMethodButtonsContainer) return;

    // Get all unique cooking methods
    const methodSet = new Set();
    allRecipes.forEach(recipe => {
        if (recipe.cookingMethod) {
            methodSet.add(recipe.cookingMethod);
        }
    });

    const methods = ['Alle', ...Array.from(methodSet).sort()];

    cookingMethodButtonsContainer.innerHTML = '';

    methods.forEach(method => {
        const count = method === 'Alle'
            ? allRecipes.length
            : allRecipes.filter(r => r.cookingMethod === method).length;

        const btn = document.createElement('button');
        btn.className = `filter-btn cooking-method-btn ${method === 'Alle' ? 'active' : ''}`;
        btn.textContent = `${method} (${count})`;
        btn.dataset.method = method;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.cooking-method-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.cookingMethod = method;
            applyFilters();
        });

        cookingMethodButtonsContainer.appendChild(btn);
    });
}

// Setup difficulty filter buttons
function setupDifficultyFilters() {
    const difficultyButtonsContainer = document.getElementById('difficultyButtons');
    if (!difficultyButtonsContainer) return;

    const difficulties = ['Alle', 'Einfach', 'Mittel', 'Anspruchsvoll'];

    difficultyButtonsContainer.innerHTML = '';

    difficulties.forEach(difficulty => {
        const count = difficulty === 'Alle'
            ? allRecipes.length
            : allRecipes.filter(r => r.difficulty === difficulty).length;

        const btn = document.createElement('button');
        btn.className = `filter-btn difficulty-btn ${difficulty === 'Alle' ? 'active' : ''}`;
        btn.textContent = `${difficulty} (${count})`;
        btn.dataset.difficulty = difficulty;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.difficulty = difficulty;
            applyFilters();
        });

        difficultyButtonsContainer.appendChild(btn);
    });
}

// Setup occasion filter buttons
function setupOccasionFilters() {
    const occasionButtonsContainer = document.getElementById('occasionButtons');
    if (!occasionButtonsContainer) return;

    // Get all unique occasions
    const occasionSet = new Set();
    allRecipes.forEach(recipe => {
        if (recipe.occasion) {
            occasionSet.add(recipe.occasion);
        }
    });

    const occasions = ['Alle', ...Array.from(occasionSet).sort()];

    occasionButtonsContainer.innerHTML = '';

    occasions.forEach(occasion => {
        const count = occasion === 'Alle'
            ? allRecipes.length
            : allRecipes.filter(r => r.occasion === occasion).length;

        const btn = document.createElement('button');
        btn.className = `filter-btn occasion-btn ${occasion === 'Alle' ? 'active' : ''}`;
        btn.textContent = `${occasion} (${count})`;
        btn.dataset.occasion = occasion;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.occasion-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.occasion = occasion;
            applyFilters();
        });

        occasionButtonsContainer.appendChild(btn);
    });
}

// Setup cost level filter buttons
function setupCostFilters() {
    const costButtonsContainer = document.getElementById('costButtons');
    if (!costButtonsContainer) return;

    const costLevels = ['Alle', 'Günstig', 'Mittel', 'Gehoben'];

    costButtonsContainer.innerHTML = '';

    costLevels.forEach(level => {
        const count = level === 'Alle'
            ? allRecipes.length
            : allRecipes.filter(r => r.costLevel === level).length;

        const btn = document.createElement('button');
        btn.className = `filter-btn cost-btn ${level === 'Alle' ? 'active' : ''}`;
        btn.textContent = `${level} (${count})`;
        btn.dataset.cost = level;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.cost-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.costLevel = level;
            applyFilters();
        });

        costButtonsContainer.appendChild(btn);
    });
}

// Setup search functionality
function setupSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 300);
    });
}

// Apply all active filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value;
    filteredRecipes = allRecipes;

    // Filter by category
    if (activeFilters.category !== 'Alle') {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.logicalCategory === activeFilters.category);
    }

    // Filter by time range
    if (activeFilters.time !== 'Alle') {
        filteredRecipes = filteredRecipes.filter(recipe => {
            return recipe.totalTime >= activeFilters.timeMin && recipe.totalTime < activeFilters.timeMax;
        });
    }

    // Filter by allergens (exclude recipes containing selected allergens)
    if (activeFilters.allergens.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => {
            return !activeFilters.allergens.some(allergen => recipe.allergens.includes(allergen));
        });
    }

    // Filter by season
    if (activeFilters.season !== 'Alle') {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.season === activeFilters.season);
    }

    // Filter by dietary restrictions (include recipes with ALL selected restrictions)
    if (activeFilters.dietary.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => {
            if (!recipe.dietary || !Array.isArray(recipe.dietary)) return false;
            return activeFilters.dietary.every(d => recipe.dietary.includes(d));
        });
    }

    // Filter by cooking method
    if (activeFilters.cookingMethod !== 'Alle') {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.cookingMethod === activeFilters.cookingMethod);
    }

    // Filter by difficulty
    if (activeFilters.difficulty !== 'Alle') {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === activeFilters.difficulty);
    }

    // Filter by occasion
    if (activeFilters.occasion !== 'Alle') {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.occasion === activeFilters.occasion);
    }

    // Filter by cost level
    if (activeFilters.costLevel !== 'Alle') {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.costLevel === activeFilters.costLevel);
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        filteredRecipes = filteredRecipes.filter(recipe => {
            const searchableText = [
                recipe.name,
                recipe.description || '',
                recipe.aiDescription || '',
                ...(recipe.ingredients || []),
                ...(recipe.keywords || [])
            ].join(' ').toLowerCase();

            return searchableText.includes(term);
        });
    }

    displayRecipes(filteredRecipes);
}

// Display recipes in grid
function displayRecipes(recipes) {
    const grid = document.getElementById('recipeGrid');
    const countElement = document.getElementById('recipeCount');

    countElement.textContent = recipes.length;

    if (recipes.length === 0) {
        grid.innerHTML = '<div class="no-results">Keine Rezepte gefunden</div>';
        return;
    }

    grid.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
}

// Create recipe card HTML
function createRecipeCard(recipe) {
    const imageUrl = getRecipeImage(recipe, 'thumbnail'); // 400x300 for recipe grid cards
    const totalTime = recipe.totalTime || 0;
    const seasonalTag = recipe.seasonalTags && recipe.seasonalTags[0];
    const recipeUrl = recipe.slug ? `recipe.html?recipe=${recipe.slug}` : `recipe.html?id=${recipe.id}`;

    return `
        <a href="${recipeUrl}" class="recipe-card" onclick="handleRecipeClick(event, '${recipe.slug || recipe.id}')">
            ${seasonalTag ? `<span class="seasonal-badge">${seasonalTag.name}</span>` : ''}
            ${imageUrl ? `<img src="${imageUrl}" alt="${recipe.name}" class="recipe-card-image" loading="lazy">` : ''}
            <div class="recipe-card-content">
                <h3 class="recipe-card-title">${recipe.name}</h3>
                ${recipe.aiDescription ? `<p class="recipe-card-description">${recipe.aiDescription.substring(0, 100)}...</p>` : ''}
                <div class="recipe-card-meta">
                    ${totalTime > 0 ? `<span>${totalTime} Min.</span>` : ''}
                    ${recipe.yield ? `<span>${recipe.yield} ${recipe.yield == 1 ? 'Portion' : 'Portionen'}</span>` : ''}
                </div>
                ${recipe.logicalCategory ? `<div class="recipe-card-category">${recipe.logicalCategory}</div>` : ''}
            </div>
        </a>
    `;
}

// Toggle filter section
function toggleFilter(titleElement) {
    const content = titleElement.nextElementSibling;
    const icon = titleElement.querySelector('.collapse-icon');

    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        icon.textContent = '▲';
    } else {
        content.classList.add('collapsed');
        icon.textContent = '▼';
    }
}

// Toggle all filters (show/hide entire filter section)
function toggleAllFilters() {
    const container = document.getElementById('allFiltersContainer');
    const icon = document.getElementById('filterToggleIcon');

    if (container.classList.contains('collapsed')) {
        container.classList.remove('collapsed');
        icon.textContent = '▲';
    } else {
        container.classList.add('collapsed');
        icon.textContent = '▼';
    }
}

// Scroll to top before navigating to recipe detail
function scrollToTopBeforeNav(event) {
    // Scroll iframe to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Notify parent window (Shopify) to scroll to top
    if (window.self !== window.top) {
        window.parent.postMessage({
            type: 'lafer-recipes-scroll-top'
        }, '*');
    }

    // Let the link navigate normally
    return true;
}

// Handle recipe card click - notify parent window to update URL
function handleRecipeClick(event, recipeSlug) {
    event.preventDefault();

    console.log('🔗 Recipe card clicked:', recipeSlug);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Notify parent window to update its URL (for SEO and analytics)
    if (window.self !== window.top) {
        console.log('📤 Notifying parent window to update URL...');
        window.parent.postMessage({
            type: 'lafer-recipe-navigate',
            recipeSlug: recipeSlug
        }, '*');

        // Also send scroll-to-top message
        window.parent.postMessage({
            type: 'lafer-recipes-scroll-top'
        }, '*');
    }

    // Navigate iframe to recipe detail page
    const recipeUrl = `recipe.html?recipe=${recipeSlug}`;
    console.log('🔄 Navigating to:', recipeUrl);
    window.location.href = recipeUrl;

    return false;
}

// Make functions globally available
window.toggleFilter = toggleFilter;
window.scrollToTopBeforeNav = scrollToTopBeforeNav;
window.handleRecipeClick = handleRecipeClick;

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadRecipes);
