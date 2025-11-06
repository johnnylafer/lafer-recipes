/**
 * ADD ANALYTICS TRACKING TO RECIPE IFRAME
 *
 * Add these functions to recipe.js and app.js to enable analytics tracking
 * Copy the relevant sections into your existing files
 */

// ============================================
// ANALYTICS HELPER FUNCTION (Add to both files)
// ============================================

/**
 * Send analytics event to parent window (Shopify page)
 * Parent window will forward to Google Analytics
 */
function trackEvent(eventType, data = {}) {
    // Only track if we're in an iframe
    if (window.self === window.top) return;

    try {
        window.parent.postMessage({
            type: eventType,
            ...data,
            timestamp: new Date().toISOString()
        }, '*');

        console.log('📊 Analytics tracked:', eventType, data);
    } catch (error) {
        console.error('Failed to track event:', error);
    }
}

// ============================================
// FOR recipe.js - ADD TO SHARE FUNCTION
// ============================================

// Find the shareRecipe() function and update it:

function shareRecipe() {
    if (!currentRecipe) return;

    const recipeSlug = currentRecipe.slug || currentRecipe.id;
    const laferUrl = `https://lafer.de/pages/rezepte?recipe=${recipeSlug}`;

    const shareData = {
        title: currentRecipe.name,
        text: `Probiere dieses Rezept von Johann Lafer: ${currentRecipe.name}`,
        url: laferUrl
    };

    // Track share intent
    trackEvent('recipe_share', {
        recipeName: currentRecipe.name,
        recipeId: currentRecipe.id,
        method: navigator.share ? 'native_share' : 'copy_link'
    });

    // Try native share API
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => {
                console.log('Recipe shared successfully');
                trackEvent('recipe_share_success', {
                    recipeName: currentRecipe.name,
                    recipeId: currentRecipe.id,
                    method: 'native_share'
                });
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    console.log('Error sharing:', err);
                    copyToClipboard(laferUrl);
                }
            });
    } else {
        copyToClipboard(laferUrl);
    }
}

// ============================================
// FOR recipe.js - ADD TO PRINT BUTTON
// ============================================

// Find the print button in the HTML and update it:
// Replace: onclick="window.print()"
// With: onclick="trackPrintRecipe()"

function trackPrintRecipe() {
    if (!currentRecipe) return;

    trackEvent('recipe_print', {
        recipeName: currentRecipe.name,
        recipeId: currentRecipe.id,
        recipeSlug: currentRecipe.slug
    });

    // Then actually print
    window.print();
}

// ============================================
// FOR recipe.js - ADD TO SERVINGS ADJUSTMENT
// ============================================

// Find the adjustServings() function and add tracking:

function adjustServings(delta) {
    if (!currentRecipe) return;

    const oldServings = currentServings;
    const newServings = Math.max(1, currentServings + delta);

    if (newServings === currentServings) return; // No change

    currentServings = newServings;

    // Track servings adjustment
    trackEvent('adjust_servings', {
        recipeName: currentRecipe.name,
        recipeId: currentRecipe.id,
        oldServings: oldServings,
        newServings: newServings
    });

    // Rest of existing adjustServings code...
    displayRecipe();
}

// ============================================
// FOR app.js - ADD TO RECIPE CARD CLICKS
// ============================================

// Find the createRecipeCard() function and update the link:

function createRecipeCard(recipe) {
    const imageUrl = getRecipeImage(recipe, 'mobile');
    const recipeUrl = recipe.slug ? `recipe.html?recipe=${recipe.slug}` : `recipe.html?id=${recipe.id}`;

    return `
        <a href="${recipeUrl}"
           class="recipe-card"
           onclick="trackRecipeCardClick(event, '${recipe.name}', '${recipe.id}', '${recipe.logicalCategory}')"
           data-recipe-id="${recipe.id}">
            <!-- Rest of card HTML -->
        </a>
    `;
}

// Add the tracking function:
function trackRecipeCardClick(event, recipeName, recipeId, recipeCategory) {
    trackEvent('recipe_click', {
        recipeName: recipeName,
        recipeId: recipeId,
        recipeCategory: recipeCategory
    });

    // Let the link navigate normally
    return true;
}

// ============================================
// FOR app.js - ADD TO SEARCH FUNCTION
// ============================================

// Find where search is triggered and add:

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value;

    if (searchTerm.trim()) {
        trackEvent('recipe_search', {
            searchTerm: searchTerm.trim()
        });
    }

    // Rest of existing search code...
    applyFilters();
}

// ============================================
// FOR app.js - ADD TO FILTER CHANGES
// ============================================

// Find the filter change handlers and add:

function applyFilters() {
    // Track which filters are being used
    const activeFilters = {
        category: currentFilters.category !== 'Alle',
        difficulty: currentFilters.difficulty !== 'Alle',
        season: currentFilters.season !== 'Alle',
        occasion: currentFilters.occasion !== 'Alle'
    };

    // Only track if filters are actually set
    if (Object.values(activeFilters).some(v => v)) {
        trackEvent('recipe_filter', {
            filterType: 'multiple',
            filters: currentFilters
        });
    }

    // Rest of existing filter code...
    updateRecipeDisplay();
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
After implementing the above changes, these events will be tracked:

1. Recipe Views (automatic - from Shopify page)
2. Recipe Card Clicks (from overview page)
3. Search Queries
4. Filter Usage
5. Servings Adjustments
6. Print Recipe Clicks
7. Share Recipe Clicks

All events are sent to the parent window (Shopify page with GA4),
which then forwards them to Google Analytics with proper context.
*/
