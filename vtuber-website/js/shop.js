// ================================================
// VTuber Studio - Shop Page (Rebuilt)
// ================================================

'use strict';

const currencyRates = {
    THB: 1,
    USD: 0.028,
    JPY: 4.2
};

const currencyLocales = {
    THB: 'th-TH',
    USD: 'en-US',
    JPY: 'ja-JP'
};

const currencyFractions = {
    THB: 2,
    USD: 2,
    JPY: 0
};

let allProducts = [];
let filteredProducts = [];
let currentCurrency = localStorage.getItem('vtuber_currency') || 'THB';
let showFavoritesOnly = false;

const dom = {};

document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    loadProducts();
    initFilters();
    initProductsGridEvents();
    initCart();
    initQuickViewModal();
    initCheckout();
    updateCurrencySelector();
});

function cacheDom() {
    dom.productsGrid = document.getElementById('products-grid');
    dom.emptyState = document.getElementById('empty-state');
    dom.searchInput = document.getElementById('product-search');
    dom.categoryFilter = document.getElementById('category-filter');
    dom.sortFilter = document.getElementById('sort-filter');
    dom.currencyFilter = document.getElementById('currency-filter');
    dom.wishlistToggle = document.getElementById('toggle-wishlist');
    dom.cartSidebar = document.getElementById('cart-sidebar');
    dom.cartOverlay = document.getElementById('cart-overlay');
    dom.cartItems = document.getElementById('cart-items');
    dom.cartEmpty = document.getElementById('cart-empty');
    dom.cartTotalAmount = document.getElementById('cart-total-amount');
    dom.checkoutButton = document.getElementById('checkout-btn');
    dom.checkoutModal = document.getElementById('checkout-modal');
    dom.checkoutForm = document.getElementById('checkout-form');
    dom.orderSummary = document.getElementById('order-summary');
    dom.quickViewModal = document.getElementById('quick-view-modal');
    dom.quickViewContent = document.getElementById('quick-view-content');
}

// ================================================
// Data Loading
// ================================================

function loadProducts() {
    allProducts = DB.getProducts() || [];

    if (allProducts.length === 0) {
        seedSampleProducts();
        allProducts = DB.getProducts() || [];
    }

    filteredProducts = [...allProducts];
    sortFilteredProducts();
    renderProducts();
}

function seedSampleProducts() {
    const samples = [
        {
            name: 'Acrylic Stand',
            nameTh: 'อะคริลิกสแตนด์',
            price: 500,
            category: 'Merchandise',
            description: 'Official acrylic stand featuring character art.',
            descriptionTh: 'อะคริลิกสแตนด์ลายตัวละครแบบลิขสิทธิ์แท้',
            image: 'assets/images/products/acrylic-stand.jpg',
            stock: 50,
            tags: ['new', 'popular']
        },
        {
            name: 'Voice Pack Vol.1',
            nameTh: 'ชุดเสียง Vol.1',
            price: 300,
            category: 'Voice Pack',
            description: 'Over 100 exclusive voice lines recorded in studio quality.',
            descriptionTh: 'บันทึกเสียงพิเศษกว่า 100 บรรทัดด้วยคุณภาพระดับสตูดิโอ',
            image: 'assets/images/products/voice-pack.jpg',
            stock: 999,
            tags: ['digital'],
            preorder: false
        },
        {
            name: 'Official T-Shirt',
            nameTh: 'เสื้อยืดลิขสิทธิ์แท้',
            price: 750,
            category: 'Clothing',
            description: 'Premium cotton shirt with limited edition artwork.',
            descriptionTh: 'เสื้อยืดผ้าคอตตอนพรีเมียมลายอาร์ตเวิร์กลิมิตเต็ด',
            image: 'assets/images/products/tshirt.jpg',
            stock: 30,
            tags: ['limited']
        }
    ];

    samples.forEach(sample => DB.addProduct(sample));
}

// ================================================
// Rendering
// ================================================

function renderProducts() {
    if (!dom.productsGrid) return;

    if (filteredProducts.length === 0) {
        dom.productsGrid.innerHTML = '';
        if (dom.emptyState) dom.emptyState.style.display = 'block';
        return;
    }

    if (dom.emptyState) dom.emptyState.style.display = 'none';

    const html = filteredProducts.map(product => createProductCard(product)).join('');
    dom.productsGrid.innerHTML = html;
}

function createProductCard(product) {
    const lang = (typeof App !== 'undefined' && App.currentLang) ? App.currentLang : 'th';
    const name = lang === 'th' && product.nameTh ? product.nameTh : product.name;
    const description = lang === 'th' && product.descriptionTh ? product.descriptionTh : product.description;
    const price = formatPrice(convertPrice(product.price, currentCurrency), currentCurrency);
    const isFavorite = window.VTuberApp ? VTuberApp.isFavorite(product.id, 'product') : false;

    return `
        <article class="product-card" data-product-id="${product.id}">
            ${renderProductBadges(product)}
            <div class="product-image">
                <img src="${product.image || 'assets/images/placeholder-product.jpg'}" alt="${escapeHtml(product.name)}">
                <button class="product-action favorite-btn ${isFavorite ? 'active' : ''}" data-action="favorite" aria-pressed="${isFavorite}">
                    <span class="sr-only">Favorite</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
                <button class="product-action quick-view-btn" data-action="quick-view">
                    <span class="sr-only">Quick view</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
            </div>
            <div class="product-content">
                <div class="product-meta">
                    <span class="product-category">${product.category || 'General'}</span>
                    <span class="product-stock ${product.stock === 0 ? 'out' : ''}">${formatStock(product.stock, lang)}</span>
                </div>
                <h3 class="product-title">${escapeHtml(name)}</h3>
                <p class="product-description">${escapeHtml(description || '')}</p>
                <div class="product-footer">
                    <span class="product-price">${price}</span>
                    <button class="btn btn-primary btn-small" data-action="add-to-cart">${lang === 'th' ? 'เพิ่มลงตะกร้า' : 'Add to cart'}</button>
                </div>
            </div>
        </article>
    `;
}

function renderProductBadges(product) {
    const badges = [];

    if (product.preorder) {
        badges.push('<span class="badge badge-preorder">Pre-order</span>');
    }
    if (Array.isArray(product.tags)) {
        if (product.tags.includes('new')) {
            badges.push('<span class="badge badge-new">New</span>');
        }
        if (product.tags.includes('limited')) {
            badges.push('<span class="badge badge-limited">Limited</span>');
        }
    }

    if (badges.length === 0) return '';
    return `<div class="product-badges">${badges.join('')}</div>`;
}

// ================================================
// Filtering & Sorting
// ================================================

function initFilters() {
    if (dom.searchInput) {
        const handler = () => applyFilters();
        if (typeof debounce === 'function') {
            dom.searchInput.addEventListener('input', debounce(handler, 200));
        } else {
            dom.searchInput.addEventListener('input', handler);
        }
    }

    dom.categoryFilter?.addEventListener('change', applyFilters);
    dom.sortFilter?.addEventListener('change', () => {
        sortFilteredProducts();
        renderProducts();
    });
    dom.currencyFilter?.addEventListener('change', handleCurrencyChange);
    dom.wishlistToggle?.addEventListener('click', toggleFavoritesFilter);
}

function applyFilters() {
    const searchTerm = (dom.searchInput?.value || '').trim().toLowerCase();
    const category = dom.categoryFilter?.value || 'all';

    filteredProducts = allProducts.filter(product => {
        const matchesCategory = category === 'all' || product.category === category;
        const matchesSearch = !searchTerm || matchesProductSearch(product, searchTerm);
        const matchesFavorite = !showFavoritesOnly || (window.VTuberApp && VTuberApp.isFavorite(product.id, 'product'));
        return matchesCategory && matchesSearch && matchesFavorite;
    });

    sortFilteredProducts();
    renderProducts();
}

function matchesProductSearch(product, searchTerm) {
    const lang = (typeof App !== 'undefined' && App.currentLang) ? App.currentLang : 'th';
    const name = lang === 'th' && product.nameTh ? product.nameTh : product.name;
    const description = lang === 'th' && product.descriptionTh ? product.descriptionTh : product.description;
    return [product.name, product.nameTh, name, description, product.category]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(searchTerm));
}

function sortFilteredProducts() {
    const sortValue = dom.sortFilter?.value || 'newest';
    filteredProducts.sort((a, b) => {
        switch (sortValue) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            case 'newest':
            default:
                return (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0));
        }
    });
}

function toggleFavoritesFilter() {
    showFavoritesOnly = !showFavoritesOnly;
    if (dom.wishlistToggle) {
        dom.wishlistToggle.classList.toggle('active', showFavoritesOnly);
        dom.wishlistToggle.setAttribute('aria-pressed', showFavoritesOnly);
    }
    applyFilters();
}

function handleCurrencyChange(e) {
    currentCurrency = e.target.value;
    localStorage.setItem('vtuber_currency', currentCurrency);
    renderProducts();
    renderCart();
    if (dom.orderSummary && dom.checkoutModal?.classList.contains('active')) {
        renderOrderSummary();
    }
    if (window.VTuberApp) {
        VTuberApp.showToast(`Currency changed to ${currentCurrency}`, 'info');
    }
}

function updateCurrencySelector() {
    if (dom.currencyFilter) {
        dom.currencyFilter.value = currentCurrency;
    }
}

// ================================================
// Product Grid Events
// ================================================

function initProductsGridEvents() {
    if (!dom.productsGrid) return;

    dom.productsGrid.addEventListener('click', (event) => {
        const card = event.target.closest('[data-product-id]');
        if (!card) return;

        const productId = card.getAttribute('data-product-id');
        const product = allProducts.find(item => item.id === productId);
        if (!product) return;

        if (event.target.closest('[data-action="add-to-cart"]')) {
            handleAddToCart(product);
            return;
        }

        if (event.target.closest('[data-action="quick-view"]')) {
            openQuickView(product);
            return;
        }

        if (event.target.closest('[data-action="favorite"]')) {
            toggleFavorite(product, card);
            return;
        }
    });
}

function handleAddToCart(product) {
    if (product.stock === 0) {
        window.VTuberApp?.showToast('Product is out of stock', 'error');
        return;
    }

    window.VTuberApp?.addToCart(product);
    renderCart();
}

function toggleFavorite(product, card) {
    if (!window.VTuberApp) return;
    const added = VTuberApp.toggleFavorite(product.id, 'product');
    const button = card.querySelector('[data-action="favorite"]');
    button?.classList.toggle('active', added);
    button?.setAttribute('aria-pressed', added);

    if (showFavoritesOnly && !added) {
        applyFilters();
    }
}

// ================================================
// Cart Logic
// ================================================

function initCart() {
    document.getElementById('open-cart')?.addEventListener('click', openCart);
    document.getElementById('close-cart')?.addEventListener('click', closeCart);
    dom.cartOverlay?.addEventListener('click', closeCart);

    dom.cartItems?.addEventListener('click', (event) => {
        const itemEl = event.target.closest('[data-cart-item]');
        if (!itemEl) return;

        const productId = itemEl.getAttribute('data-cart-item');

        if (event.target.closest('[data-action="remove"]')) {
            window.VTuberApp?.removeFromCart(productId);
            renderCart();
            return;
        }

        if (event.target.closest('[data-action="increase"]')) {
            changeCartQuantity(productId, 1);
            return;
        }

        if (event.target.closest('[data-action="decrease"]')) {
            changeCartQuantity(productId, -1);
            return;
        }
    });

    renderCart();
}

function openCart() {
    dom.cartSidebar?.classList.add('active');
    dom.cartOverlay?.classList.add('active');
    renderCart();
}

function closeCart() {
    dom.cartSidebar?.classList.remove('active');
    dom.cartOverlay?.classList.remove('active');
}

function changeCartQuantity(productId, delta) {
    if (typeof App === 'undefined') return;
    const item = App.cartItems.find(entry => entry.id === productId);
    if (!item) return;

    item.quantity = Math.max(0, (item.quantity || 1) + delta);
    if (item.quantity === 0) {
        window.VTuberApp?.removeFromCart(productId);
    } else {
        persistCart();
    }
    renderCart();
}

function persistCart() {
    if (typeof App === 'undefined') return;
    try {
        localStorage.setItem('vtuber_cart', JSON.stringify(App.cartItems));
    } catch (error) {
        console.error('Failed to persist cart', error);
    }
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
}

function renderCart() {
    if (!dom.cartItems || typeof App === 'undefined') return;

    const items = App.cartItems || [];

    if (items.length === 0) {
        dom.cartItems.innerHTML = '';
        if (dom.cartEmpty) dom.cartEmpty.style.display = 'flex';
        if (dom.cartTotalAmount) dom.cartTotalAmount.textContent = formatPrice(0, currentCurrency);
        return;
    }

    if (dom.cartEmpty) dom.cartEmpty.style.display = 'none';

    dom.cartItems.innerHTML = items.map(item => renderCartItem(item)).join('');

    const totals = calculateCartTotals();
    if (dom.cartTotalAmount) {
        dom.cartTotalAmount.textContent = formatPrice(convertPrice(totals.total, currentCurrency), currentCurrency);
    }
}

function renderCartItem(item) {
    const product = allProducts.find(prod => prod.id === item.id) || item;
    const lang = (typeof App !== 'undefined' && App.currentLang) ? App.currentLang : 'th';
    const name = lang === 'th' && product.nameTh ? product.nameTh : product.name;
    const price = formatPrice(convertPrice(product.price, currentCurrency), currentCurrency);

    return `
        <div class="cart-item" data-cart-item="${item.id}">
            <div class="cart-item-thumb">
                <img src="${product.image || 'assets/images/placeholder-product.jpg'}" alt="${escapeHtml(product.name)}">
            </div>
            <div class="cart-item-info">
                <h4>${escapeHtml(name)}</h4>
                <p>${price}</p>
                <div class="cart-item-actions">
                    <div class="cart-quantity">
                        <button type="button" class="quantity-btn" data-action="decrease">-</button>
                        <span>${item.quantity || 1}</span>
                        <button type="button" class="quantity-btn" data-action="increase">+</button>
                    </div>
                    <button type="button" class="btn-link" data-action="remove">${lang === 'th' ? 'ลบ' : 'Remove'}</button>
                </div>
            </div>
        </div>
    `;
}

function calculateCartTotals() {
    if (typeof App === 'undefined') {
        return { subtotal: 0, tax: 0, total: 0 };
    }

    const subtotal = App.cartItems.reduce((sum, item) => {
        const quantity = item.quantity || 1;
        const price = Number(item.price) || 0;
        return sum + price * quantity;
    }, 0);

    const tax = subtotal * 0.07;
    const total = subtotal + tax;
    return { subtotal, tax, total };
}

// ================================================
// Quick View Modal
// ================================================

function initQuickViewModal() {
    document.getElementById('close-quick-view')?.addEventListener('click', closeQuickView);
}

function openQuickView(product) {
    if (!dom.quickViewModal || !dom.quickViewContent) return;

    const lang = (typeof App !== 'undefined' && App.currentLang) ? App.currentLang : 'th';
    const name = lang === 'th' && product.nameTh ? product.nameTh : product.name;
    const description = lang === 'th' && product.descriptionTh ? product.descriptionTh : product.description;
    const price = formatPrice(convertPrice(product.price, currentCurrency), currentCurrency);

    dom.quickViewContent.innerHTML = `
        <div class="quick-view-grid">
            <div class="quick-view-image">
                <img src="${product.image || 'assets/images/placeholder-product.jpg'}" alt="${escapeHtml(product.name)}">
            </div>
            <div class="quick-view-details">
                <h2>${escapeHtml(name)}</h2>
                <p class="quick-view-price">${price}</p>
                <p class="quick-view-description">${escapeHtml(description || '')}</p>
                <ul class="quick-view-meta">
                    <li><strong>${lang === 'th' ? 'หมวดหมู่' : 'Category'}:</strong> ${product.category || '-'}</li>
                    <li><strong>${lang === 'th' ? 'สต็อก' : 'Stock'}:</strong> ${formatStock(product.stock, lang)}</li>
                </ul>
                <div class="quick-view-actions">
                    <button class="btn btn-primary" id="quick-view-add">${lang === 'th' ? 'เพิ่มลงตะกร้า' : 'Add to cart'}</button>
                </div>
            </div>
        </div>
    `;

    dom.quickViewContent.querySelector('#quick-view-add')?.addEventListener('click', () => {
        handleAddToCart(product);
        closeQuickView();
    });

    dom.quickViewModal.classList.add('active');
}

function closeQuickView() {
    dom.quickViewModal?.classList.remove('active');
}

// ================================================
// Checkout
// ================================================

function initCheckout() {
    dom.checkoutButton?.addEventListener('click', handleOpenCheckout);
    document.getElementById('close-checkout')?.addEventListener('click', closeCheckout);
    dom.checkoutForm?.addEventListener('submit', handleCheckoutSubmit);
}

function handleOpenCheckout() {
    if (typeof App === 'undefined' || App.cartItems.length === 0) {
        window.VTuberApp?.showToast('Your cart is empty', 'info');
        return;
    }
    renderOrderSummary();
    dom.checkoutModal?.classList.add('active');
}

function closeCheckout() {
    dom.checkoutModal?.classList.remove('active');
}

function renderOrderSummary() {
    if (!dom.orderSummary || typeof App === 'undefined') return;

    const totals = calculateCartTotals();
    const lang = (typeof App !== 'undefined' && App.currentLang) ? App.currentLang : 'th';
    const subtotalDisplay = formatPrice(convertPrice(totals.subtotal, currentCurrency), currentCurrency);
    const taxDisplay = formatPrice(convertPrice(totals.tax, currentCurrency), currentCurrency);
    const totalDisplay = formatPrice(convertPrice(totals.total, currentCurrency), currentCurrency);
    const subtotalLabel = lang === 'th' ? 'ยอดรวม' : 'Subtotal';
    const taxLabel = lang === 'th' ? 'ภาษี (7%)' : 'Tax (7%)';
    const totalLabel = lang === 'th' ? 'รวมทั้งสิ้น' : 'Total';

    const itemsHtml = App.cartItems.map(item => {
        const product = allProducts.find(prod => prod.id === item.id) || item;
        const name = lang === 'th' && product.nameTh ? product.nameTh : product.name;
        const price = formatPrice(convertPrice(product.price, currentCurrency), currentCurrency);
        return `<div class="summary-item"><span>${escapeHtml(name)} × ${item.quantity || 1}</span><span>${price}</span></div>`;
    }).join('');

    const emptyMessage = lang === 'th' ? 'ยังไม่มีสินค้าในตะกร้า' : 'No items in cart';

    dom.orderSummary.innerHTML = `
        <div class="summary-items">${itemsHtml || `<p class="summary-empty">${emptyMessage}</p>`}</div>
        <div class="summary-row"><span>${subtotalLabel}</span><span>${subtotalDisplay}</span></div>
        <div class="summary-row"><span>${taxLabel}</span><span>${taxDisplay}</span></div>
        <div class="summary-row total"><span>${totalLabel}</span><span>${totalDisplay}</span></div>
    `;
}

async function handleCheckoutSubmit(event) {
    event.preventDefault();
    if (typeof App === 'undefined') return;

    const formData = new FormData(dom.checkoutForm);
    const customer = {
        name: formData.get('customer-name') || document.getElementById('customer-name')?.value?.trim(),
        email: formData.get('customer-email') || document.getElementById('customer-email')?.value?.trim(),
        phone: formData.get('customer-phone') || document.getElementById('customer-phone')?.value?.trim(),
        address: formData.get('customer-address') || document.getElementById('customer-address')?.value?.trim(),
        city: formData.get('customer-city') || document.getElementById('customer-city')?.value?.trim(),
        postalCode: formData.get('customer-postal') || document.getElementById('customer-postal')?.value?.trim()
    };

    if (!customer.name || !customer.email || !customer.phone || !customer.address) {
        window.VTuberApp?.showToast('Please fill in all required fields', 'warning');
        return;
    }

    if (window.VTuberApp && !VTuberApp.validateEmail(customer.email)) {
        VTuberApp.showToast('Invalid email address', 'error');
        return;
    }

    if (!document.getElementById('accept-terms')?.checked) {
        window.VTuberApp?.showToast('Please accept the terms and conditions', 'warning');
        return;
    }

    const totals = calculateCartTotals();
    const order = {
        customer,
        items: App.cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        currency: currentCurrency
    };

    DB.addOrder(order);

    window.VTuberApp?.showToast('Order placed successfully!', 'success');
    window.VTuberApp?.clearCart();
    renderCart();
    dom.checkoutForm?.reset();
    closeCheckout();
    closeCart();
}

// ================================================
// Helpers
// ================================================

function convertPrice(amountTHB, currency) {
    const rate = currencyRates[currency] || 1;
    const amount = typeof amountTHB === 'number' ? amountTHB : Number(amountTHB) || 0;
    return amount * rate;
}

function formatPrice(amount, currency) {
    const locale = currencyLocales[currency] || 'en-US';
    const fractionDigits = currencyFractions[currency] ?? 2;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(amount);
}

function formatStock(stock, lang = 'th') {
    if (stock === 0) {
        return lang === 'th' ? 'สินค้าหมด' : 'Out of stock';
    }
    if (stock <= 5) {
        return lang === 'th' ? `เหลือ ${stock} ชิ้น` : `Only ${stock} left`;
    }
    return lang === 'th' ? `${stock} ชิ้น` : `${stock} in stock`;
}

function escapeHtml(str = '') {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
