// ================================================
// VTuber Studio - Shop Page
// ================================================

'use strict';

let allProducts = [];
let filteredProducts = [];
let currentCurrency = 'THB';

const currencyRates = {
    'THB': 1,
    'USD': 0.028,
    'JPY': 4.2
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    initFilters();
    initCart();
    initModals();
    
    // Load saved currency
    const savedCurrency = localStorage.getItem('vtuber_currency') || 'THB';
    currentCurrency = savedCurrency;
    document.getElementById('currency-filter').value = savedCurrency;
});

// ================================================
// Load Products
// ================================================

function loadProducts() {
    allProducts = DB.getProducts();
    
    if (allProducts.length === 0) {
        addSampleProducts();
        allProducts = DB.getProducts();
    }
    
    filteredProducts = [...allProducts];
    renderProducts();
}

function addSampleProducts() {
    const samples = [
        {
            name: 'Acrylic Stand',
            nameTh: 'อะคริลิกสแตนด์',
            price: 500,
            category: 'Merchandise',
            description: 'Official acrylic stand featuring character art',
            descriptionTh: 'อะคริลิกสแตนด์อย่างเป็นทางการ',
            image: 'assets/images/products/acrylic-stand.jpg',
            stock: 50,
            tags: ['new', 'popular'],
            preorder: false
        },
        {
            name: 'Voice Pack Vol.1',
            nameTh: 'ชุดเสียง Vol.1',
            price: 300,
            category: 'Voice Pack',
            description: '100+ voice lines for various situations',
            descriptionTh: 'เสียงพูดมากกว่า 100 บรรทัด',
            image: 'assets/images/products/voice-pack.jpg',
            stock: 999,
            tags: ['digital'],
            preorder: false
        },
        {
            name: 'T-Shirt',
            nameTh: 'เสื้อยืด',
            price: 750,
            category: 'Clothing',
            description: 'Premium quality t-shirt with character design',
            descriptionTh: 'เสื้อยืดคุณภาพพรีเมียม',
            image: 'assets/images/products/tshirt.jpg',
            stock: 30,
            tags: ['limited'],
            preorder: false
        }
    ];
    
    samples.forEach(prod => DB.addProduct(prod));
}

// ================================================
// Render Products
// ================================================

function renderProducts() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    const lang = App.currentLang || 'th';
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    grid.innerHTML = filteredProducts.map(product => {
        const price = convertPrice(product.price, currentCurrency);
        const isFavorite = VTuberApp.isFavorite(product.id, 'product');
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                ${renderProductBadges(product)}
                
                <div class="product-image">
                    <img src="${product.image || 'assets/images/placeholder
