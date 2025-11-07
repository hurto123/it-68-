// ================================================
// VTuber Studio - Multi-Currency System
// ================================================

'use strict';

const CURRENCIES = {
    THB: { symbol: '฿', name: 'Thai Baht', rate: 1 },
    USD: { symbol: '$', name: 'US Dollar', rate: 0.028 },
    JPY: { symbol: '¥', name: 'Japanese Yen', rate: 4.2 },
    EUR: { symbol: '€', name: 'Euro', rate: 0.026 },
    GBP: { symbol: '£', name: 'British Pound', rate: 0.022 }
};

let currentCurrency = 'THB';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCurrency();
    setupCurrencySelector();
    updateAllPrices();
});

// ================================================
// Load & Save
// ================================================

function loadCurrency() {
    currentCurrency = localStorage.getItem('vtuber_currency') || 'THB';
    updateCurrencyDisplay();
}

function saveCurrency() {
    localStorage.setItem('vtuber_currency', currentCurrency);
}

// ================================================
// Currency Conversion
// ================================================

function convertPrice(priceInTHB, toCurrency = currentCurrency) {
    if (!CURRENCIES[toCurrency]) return priceInTHB;
    
    const convertedPrice = priceInTHB * CURRENCIES[toCurrency].rate;
    return Math.round(convertedPrice * 100) / 100; // Round to 2 decimals
}

function formatPrice(price, currency = currentCurrency) {
    const currencyInfo = CURRENCIES[currency];
    if (!currencyInfo) return `${price}`;
    
    const convertedPrice = convertPrice(price, currency);
    
    // Format with commas
    const formatted = convertedPrice.toLocaleString(undefined, {
        minimumFractionDigits: currency === 'JPY' ? 0 : 2,
        maximumFractionDigits: currency === 'JPY' ? 0 : 2
    });
    
    return `${currencyInfo.symbol}${formatted}`;
}

// ================================================
// Currency Selector
// ================================================

function setupCurrencySelector() {
    const selector = document.getElementById('currency-selector');
    
    if (!selector) return;
    
    // Populate options
    selector.innerHTML = Object.keys(CURRENCIES).map(code => `
        <option value="${code}" ${code === currentCurrency ? 'selected' : ''}>
            ${code} (${CURRENCIES[code].symbol})
        </option>
    `).join('');
    
    // Change event
    selector.addEventListener('change', (e) => {
        changeCurrency(e.target.value);
    });
}

function changeCurrency(newCurrency) {
    if (!CURRENCIES[newCurrency]) return;
    
    currentCurrency = newCurrency;
    saveCurrency();
    updateCurrencyDisplay();
    updateAllPrices();
    
    // Show toast
    VTuberApp.showToast(`Currency changed to ${CURRENCIES[newCurrency].name}`, 'info');
}

// ================================================
// Update UI
// ================================================

function updateCurrencyDisplay() {
    // Update currency buttons
    document.querySelectorAll('[data-currency]').forEach(btn => {
        if (btn.dataset.currency === currentCurrency) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update selectors
    document.querySelectorAll('#currency-selector').forEach(selector => {
        selector.value = currentCurrency;
    });
}

function updateAllPrices() {
    // Update all price elements
    document.querySelectorAll('[data-price-thb]').forEach(el => {
        const priceInTHB = parseFloat(el.dataset.priceTh);
        if (!isNaN(priceInTHB)) {
            el.textContent = formatPrice(priceInTHB);
        }
    });
    
    // Update product prices
    updateProductPrices();
    
    // Update cart total
    updateCartTotal();
}

function updateProductPrices() {
    const products = document.querySelectorAll('.product-price');
    
    products.forEach(priceEl => {
        const priceInTHB = parseFloat(priceEl.dataset.price);
        if (!isNaN(priceInTHB)) {
            priceEl.textContent = formatPrice(priceInTHB);
        }
    });
}

function updateCartTotal() {
    const totalEl = document.getElementById('cart-total-amount');
    
    if (!totalEl) return;
    
    const cart = DB.getCart() || [];
    const totalInTHB = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    totalEl.textContent = formatPrice(totalInTHB);
}

// ================================================
// API Functions
// ================================================

async function fetchExchangeRates() {
    try {
        // In production, use real API
        // const response = await fetch('https://api.exchangerate-api.com/v4/latest/THB');
        // const data = await response.json();
        // return data.rates;
        
        // Mock data for now
        return {
            USD: 0.028,
            JPY: 4.2,
            EUR: 0.026,
            GBP: 0.022
        };
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        return null;
    }
}

async function updateExchangeRates() {
    const rates = await fetchExchangeRates();
    
    if (rates) {
        Object.keys(rates).forEach(currency => {
            if (CURRENCIES[currency]) {
                CURRENCIES[currency].rate = rates[currency];
            }
        });
        
        updateAllPrices();
    }
}

// Update rates every hour
setInterval(updateExchangeRates, 3600000);

// ================================================
// Export
// ================================================

window.Currency = {
    current: () => currentCurrency,
    change: changeCurrency,
    convert: convertPrice,
    format: formatPrice,
    updateAll: updateAllPrices,
    getCurrencies: () => CURRENCIES
};

console.log('💱 Currency system loaded');
