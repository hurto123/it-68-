// ================================================
// VTuber Studio - Favorites System
// ================================================

'use strict';

let favorites = {
    characters: [],
    products: [],
    songs: []
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
    setupFavoriteButtons();
    updateFavoriteCounts();
});

// ================================================
// Load & Save
// ================================================

function loadFavorites() {
    favorites = DB.get('favorites') || {
        characters: [],
        products: [],
        songs: []
    };
}

function saveFavorites() {
    DB.set('favorites', favorites);
    updateFavoriteCounts();
}

// ================================================
// Add/Remove Favorites
// ================================================

function toggleFavorite(type, id) {
    if (!favorites[type]) {
        favorites[type] = [];
    }
    
    const index = favorites[type].indexOf(id);
    
    if (index > -1) {
        // Remove from favorites
        favorites[type].splice(index, 1);
        VTuberApp.showToast('Removed from favorites', 'info');
    } else {
        // Add to favorites
        favorites[type].push(id);
        VTuberApp.showToast('Added to favorites', 'success');
    }
    
    saveFavorites();
    updateFavoriteButton(type, id);
    
    return !isFavorite(type, id);
}

function isFavorite(type, id) {
    return favorites[type]?.includes(id) || false;
}

// ================================================
// Setup Buttons
// ================================================

function setupFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const type = btn.dataset.type;
        const id = btn.dataset.id;
        
        // Set initial state
        updateFavoriteButton(type, id);
        
        // Add click handler
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(type, id);
        });
    });
}

function updateFavoriteButton(type, id) {
    const buttons = document.querySelectorAll(`[data-type="${type}"][data-id="${id}"]`);
    
    buttons.forEach(btn => {
        if (isFavorite(type, id)) {
            btn.classList.add('active');
            btn.setAttribute('aria-label', 'Remove from favorites');
            
            const icon = btn.querySelector('.heart-icon');
            if (icon) {
                icon.innerHTML = '❤️';
            }
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-label', 'Add to favorites');
            
            const icon = btn.querySelector('.heart-icon');
            if (icon) {
                icon.innerHTML = '🤍';
            }
        }
    });
}

// ================================================
// Get Favorites
// ================================================

function getFavoriteCharacters() {
    const allCharacters = DB.getCharacters();
    return allCharacters.filter(char => favorites.characters.includes(char.id));
}

function getFavoriteProducts() {
    const allProducts = DB.getProducts();
    return allProducts.filter(prod => favorites.products.includes(prod.id));
}

function getFavoriteSongs() {
    const allSongs = DB.getSongs();
    return allSongs.filter(song => favorites.songs.includes(song.id));
}

// ================================================
// Render Favorites
// ================================================

function renderFavorites() {
    renderFavoriteCharacters();
    renderFavoriteProducts();
    renderFavoriteSongs();
}

function renderFavoriteCharacters() {
    const container = document.getElementById('favorite-characters');
    if (!container) return;
    
    const favoriteChars = getFavoriteCharacters();
    
    if (favoriteChars.length === 0) {
        container.innerHTML = '<p class="empty-message">No favorite characters yet</p>';
        return;
    }
    
    container.innerHTML = favoriteChars.map(char => `
        <div class="character-card">
            <img src="${char.image}" alt="${char.name}">
            <h3>${char.name}</h3>
            <button class="favorite-btn active" data-type="characters" data-id="${char.id}">
                <span class="heart-icon">❤️</span>
            </button>
        </div>
    `).join('');
    
    setupFavoriteButtons();
}

function renderFavoriteProducts() {
    const container = document.getElementById('favorite-products');
    if (!container) return;
    
    const favoriteProds = getFavoriteProducts();
    
    if (favoriteProds.length === 0) {
        container.innerHTML = '<p class="empty-message">No favorite products yet</p>';
        return;
    }
    
    container.innerHTML = favoriteProds.map(prod => `
        <div class="product-card">
            <img src="${prod.image}" alt="${prod.name}">
            <h3>${prod.name}</h3>
            <p class="price">${Currency.format(prod.price)}</p>
            <button class="favorite-btn active" data-type="products" data-id="${prod.id}">
                <span class="heart-icon">❤️</span>
            </button>
        </div>
    `).join('');
    
    setupFavoriteButtons();
}

function renderFavoriteSongs() {
    const container = document.getElementById('favorite-songs');
    if (!container) return;
    
    const favoriteSongs = getFavoriteSongs();
    
    if (favoriteSongs.length === 0) {
        container.innerHTML = '<p class="empty-message">No favorite songs yet</p>';
        return;
    }
    
    container.innerHTML = favoriteSongs.map(song => `
        <div class="song-card">
            <img src="${song.cover}" alt="${song.title}">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
            <button class="favorite-btn active" data-type="songs" data-id="${song.id}">
                <span class="heart-icon">❤️</span>
            </button>
        </div>
    `).join('');
    
    setupFavoriteButtons();
}

// ================================================
// Update Counts
// ================================================

function updateFavoriteCounts() {
    // Update badge counts
    document.getElementById('favorite-characters-count')?.textContent = favorites.characters.length;
    document.getElementById('favorite-products-count')?.textContent = favorites.products.length;
    document.getElementById('favorite-songs-count')?.textContent = favorites.songs.length;
    
    const total = favorites.characters.length + favorites.products.length + favorites.songs.length;
    document.getElementById('total-favorites')?.textContent = total;
}

// ================================================
// Clear Favorites
// ================================================

function clearFavorites(type) {
    if (!confirm(`Clear all favorite ${type}?`)) return;
    
    if (type === 'all') {
        favorites = {
            characters: [],
            products: [],
            songs: []
        };
    } else if (favorites[type]) {
        favorites[type] = [];
    }
    
    saveFavorites();
    renderFavorites();
    
    VTuberApp.showToast('Favorites cleared', 'info');
}

// ================================================
// Export Favorites
// ================================================

function exportFavorites() {
    const data = JSON.stringify(favorites, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `favorites-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    VTuberApp.showToast('Favorites exported', 'success');
}

// ================================================
// Export
// ================================================

window.Favorites = {
    toggle: toggleFavorite,
    isFavorite: isFavorite,
    getCharacters: getFavoriteCharacters,
    getProducts: getFavoriteProducts,
    getSongs: getFavoriteSongs,
    render: renderFavorites,
    clear: clearFavorites,
    export: exportFavorites
};

console.log('❤️ Favorites system loaded');
