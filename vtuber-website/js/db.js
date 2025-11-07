// ================================================
// VTuber Studio - Database Management (LocalStorage)
// ================================================

'use strict';

const DB = {
    version: '1.0.0',
    namespace: 'vtuber_studio_',
    
    // Initialize database with default data
    init() {
        if (!this.get('initialized')) {
            this.setupDefaultData();
            this.set('initialized', true);
            console.log('Database initialized with default data');
        }
    },
    
    // Generic get/set methods
    get(key) {
        try {
            const data = localStorage.getItem(this.namespace + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting data:', error);
            return null;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(this.namespace + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting data:', error);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(this.namespace + key);
            return true;
        } catch (error) {
            console.error('Error removing data:', error);
            return false;
        }
    },
    
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.namespace)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    },
    
    // ================================================
    // Characters/VTubers
    // ================================================
    
    getCharacters() {
        return this.get('characters') || [];
    },
    
    getCharacter(id) {
        const characters = this.getCharacters();
        return characters.find(char => char.id === id);
    },
    
    addCharacter(character) {
        const characters = this.getCharacters();
        character.id = this.generateId();
        character.createdAt = new Date().toISOString();
        characters.push(character);
        return this.set('characters', characters);
    },
    
    updateCharacter(id, updates) {
        const characters = this.getCharacters();
        const index = characters.findIndex(char => char.id === id);
        if (index !== -1) {
            characters[index] = { ...characters[index], ...updates, updatedAt: new Date().toISOString() };
            return this.set('characters', characters);
        }
        return false;
    },
    
    deleteCharacter(id) {
        const characters = this.getCharacters();
        const filtered = characters.filter(char => char.id !== id);
        return this.set('characters', filtered);
    },
    
    // ================================================
    // Products/Shop Items
    // ================================================
    
    getProducts() {
        return this.get('products') || [];
    },
    
    getProduct(id) {
        const products = this.getProducts();
        return products.find(prod => prod.id === id);
    },
    
    getProductsByCategory(category) {
        const products = this.getProducts();
        return products.filter(prod => prod.category === category);
    },
    
    addProduct(product) {
        const products = this.getProducts();
        product.id = this.generateId();
        product.createdAt = new Date().toISOString();
        products.push(product);
        return this.set('products', products);
    },
    
    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(prod => prod.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
            return this.set('products', products);
        }
        return false;
    },
    
    deleteProduct(id) {
        const products = this.getProducts();
        const filtered = products.filter(prod => prod.id !== id);
        return this.set('products', filtered);
    },
    
    updateProductStock(id, quantity) {
        const product = this.getProduct(id);
        if (product) {
            product.stock = (product.stock || 0) + quantity;
            return this.updateProduct(id, { stock: product.stock });
        }
        return false;
    },
    
    // ================================================
    // Music/Songs
    // ================================================
    
    getSongs() {
        return this.get('songs') || [];
    },
    
    getSong(id) {
        const songs = this.getSongs();
        return songs.find(song => song.id === id);
    },
    
    addSong(song) {
        const songs = this.getSongs();
        song.id = this.generateId();
        song.createdAt = new Date().toISOString();
        song.playCount = 0;
        songs.push(song);
        return this.set('songs', songs);
    },
    
    updateSong(id, updates) {
        const songs = this.getSongs();
        const index = songs.findIndex(song => song.id === id);
        if (index !== -1) {
            songs[index] = { ...songs[index], ...updates, updatedAt: new Date().toISOString() };
            return this.set('songs', songs);
        }
        return false;
    },
    
    deleteSong(id) {
        const songs = this.getSongs();
        const filtered = songs.filter(song => song.id !== id);
        return this.set('songs', filtered);
    },
    
    incrementPlayCount(id) {
        const song = this.getSong(id);
        if (song) {
            song.playCount = (song.playCount || 0) + 1;
            return this.updateSong(id, { playCount: song.playCount });
        }
        return false;
    },
    
    // ================================================
    // Gallery
    // ================================================
    
    getGalleryItems() {
        return this.get('gallery') || [];
    },
    
    addGalleryItem(item) {
        const items = this.getGalleryItems();
        item.id = this.generateId();
        item.createdAt = new Date().toISOString();
        items.push(item);
        return this.set('gallery', items);
    },
    
    deleteGalleryItem(id) {
        const items = this.getGalleryItems();
        const filtered = items.filter(item => item.id !== id);
        return this.set('gallery', filtered);
    },
    
    // ================================================
    // Schedule
    // ================================================
    
    getScheduleItems() {
        return this.get('schedule') || [];
    },
    
    getUpcomingSchedule() {
        const items = this.getScheduleItems();
        const now = new Date();
        return items.filter(item => new Date(item.datetime) > now)
            .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    },
    
    addScheduleItem(item) {
        const items = this.getScheduleItems();
        item.id = this.generateId();
        item.createdAt = new Date().toISOString();
        items.push(item);
        return this.set('schedule', items);
    },
    
    updateScheduleItem(id, updates) {
        const items = this.getScheduleItems();
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
            return this.set('schedule', items);
        }
        return false;
    },
    
    deleteScheduleItem(id) {
        const items = this.getScheduleItems();
        const filtered = items.filter(item => item.id !== id);
        return this.set('schedule', filtered);
    },
    
    // ================================================
    // Orders
    // ================================================
    
    getOrders() {
        return this.get('orders') || [];
    },
    
    getOrder(id) {
        const orders = this.getOrders();
        return orders.find(order => order.id === id);
    },
    
    addOrder(order) {
        const orders = this.getOrders();
        order.id = this.generateId();
        order.orderNumber = this.generateOrderNumber();
        order.createdAt = new Date().toISOString();
        order.status = 'pending';
        orders.push(order);
        return this.set('orders', orders);
    },
    
    updateOrderStatus(id, status) {
        const orders = this.getOrders();
        const index = orders.findIndex(order => order.id === id);
        if (index !== -1) {
            orders[index].status = status;
            orders[index].updatedAt = new Date().toISOString();
            return this.set('orders', orders);
        }
        return false;
    },
    
    // ================================================
    // Chat Messages
    // ================================================
    
    getChatMessages() {
        return this.get('chat_messages') || [];
    },
    
    addChatMessage(message) {
        const messages = this.getChatMessages();
        message.id = this.generateId();
        message.timestamp = new Date().toISOString();
        messages.push(message);
        
        // Keep only last 1000 messages
        if (messages.length > 1000) {
            messages.shift();
        }
        
        return this.set('chat_messages', messages);
    },
    
    deleteChatMessage(id) {
        const messages = this.getChatMessages();
        const filtered = messages.filter(msg => msg.id !== id);
        return this.set('chat_messages', filtered);
    },
    
    clearChatMessages() {
        return this.set('chat_messages', []);
    },
    
    // ================================================
    // Banned Users (for chat)
    // ================================================
    
    getBannedUsers() {
        return this.get('banned_users') || [];
    },
    
    banUser(username) {
        const banned = this.getBannedUsers();
        if (!banned.includes(username)) {
            banned.push(username);
            return this.set('banned_users', banned);
        }
        return false;
    },
    
    unbanUser(username) {
        const banned = this.getBannedUsers();
        const filtered = banned.filter(user => user !== username);
        return this.set('banned_users', filtered);
    },
    
    isUserBanned(username) {
        const banned = this.getBannedUsers();
        return banned.includes(username);
    },
    
    // ================================================
    // Activity Log
    // ================================================
    
    getActivityLog() {
        return this.get('activity_log') || [];
    },
    
    addActivity(activity) {
        const log = this.getActivityLog();
        activity.id = this.generateId();
        activity.timestamp = new Date().toISOString();
        log.push(activity);
        
        // Keep only last 500 activities
        if (log.length > 500) {
            log.shift();
        }
        
        return this.set('activity_log', log);
    },
    
    // ================================================
    // Analytics
    // ================================================
    
    incrementPageView(page) {
        const analytics = this.get('analytics') || {};
        analytics.pageViews = analytics.pageViews || {};
        analytics.pageViews[page] = (analytics.pageViews[page] || 0) + 1;
        return this.set('analytics', analytics);
    },
    
    getAnalytics() {
        return this.get('analytics') || {
            pageViews: {},
            totalVisits: 0,
            uniqueVisitors: 0
        };
    },
    
    // ================================================
    // Backup & Restore
    // ================================================
    
    exportData() {
        const data = {
            version: this.version,
            exportDate: new Date().toISOString(),
            characters: this.getCharacters(),
            products: this.getProducts(),
            songs: this.getSongs(),
            gallery: this.getGalleryItems(),
            schedule: this.getScheduleItems(),
            orders: this.getOrders(),
            settings: this.get('settings')
        };
        
        return JSON.stringify(data, null, 2);
    },
    
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.characters) this.set('characters', data.characters);
            if (data.products) this.set('products', data.products);
            if (data.songs) this.set('songs', data.songs);
            if (data.gallery) this.set('gallery', data.gallery);
            if (data.schedule) this.set('schedule', data.schedule);
            if (data.orders) this.set('orders', data.orders);
            if (data.settings) this.set('settings', data.settings);
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },
    
    // ================================================
    // Utilities
    // ================================================
    
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `ORD${year}${month}${day}${random}`;
    },
    
    // ================================================
    // Setup Default Data
    // ================================================
    
    setupDefaultData() {
        // Default categories
        this.set('product_categories', [
            'Merchandise',
            'Voice Pack',
            'Digital Goods',
            'Clothing',
            'Accessories'
        ]);
        
        // Default settings
        this.set('settings', {
            siteName: 'VTuber Studio',
            currency: 'THB',
            maintenanceMode: false,
            chatEnabled: true,
            particlesEnabled: true
        });
        
        console.log('Default data setup complete');
    }
};

// Initialize database on load
DB.init();

// Make DB available globally
window.DB = DB;
