// ================================================
// VTuber Studio - Backup & Restore System
// ================================================

'use strict';

const Backup = {
    // Create backup
    create() {
        const backup = {
            version: '2.0.0',
            timestamp: Date.now(),
            data: {
                characters: DB.getCharacters(),
                products: DB.getProducts(),
                songs: DB.getSongs(),
                orders: DB.getOrders(),
                chatMessages: DB.getChatMessages(),
                galleryImages: DB.getGalleryImages(),
                scheduleEvents: DB.getScheduleEvents(),
                settings: DB.get('settings'),
                favorites: DB.get('favorites'),
                achievements: DB.get('achievements'),
                reviews: DB.get('reviews')
            }
        };
        
        console.log('💾 Backup created');
        return backup;
    },
    
    // Export backup to file
    export() {
        const backup = this.create();
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const date = new Date().toISOString().split('T')[0];
        const filename = `vtuber-backup-${date}.json`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('📥 Backup exported:', filename);
        
        if (window.VTuberApp) {
            VTuberApp.showToast('Backup exported successfully', 'success');
        }
    },
    
    // Import backup from file
    import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    if (!this.validate(backup)) {
                        reject(new Error('Invalid backup file'));
                        return;
                    }
                    
                    this.restore(backup);
                    resolve(backup);
                    
                    console.log('📤 Backup imported');
                    
                    if (window.VTuberApp) {
                        VTuberApp.showToast('Backup imported successfully', 'success');
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },
    
    // Restore from backup
    restore(backup) {
        const data = backup.data;
        
        // Restore each data type
        if (data.characters) {
            data.characters.forEach(char => DB.addCharacter(char));
        }
        
        if (data.products) {
            data.products.forEach(prod => DB.addProduct(prod));
        }
        
        if (data.songs) {
            data.songs.forEach(song => DB.addSong(song));
        }
        
        if (data.orders) {
            DB.set('orders', data.orders);
        }
        
        if (data.chatMessages) {
            DB.set('chat_messages', data.chatMessages);
        }
        
        if (data.galleryImages) {
            DB.set('gallery_images', data.galleryImages);
        }
        
        if (data.scheduleEvents) {
            DB.set('schedule_events', data.scheduleEvents);
        }
        
        if (data.settings) {
            DB.set('settings', data.settings);
        }
        
        if (data.favorites) {
            DB.set('favorites', data.favorites);
        }
        
        if (data.achievements) {
            DB.set('achievements', data.achievements);
        }
        
        if (data.reviews) {
            DB.set('reviews', data.reviews);
        }
        
        console.log('✅ Data restored from backup');
    },
    
    // Validate backup
    validate(backup) {
        if (!backup.version || !backup.timestamp || !backup.data) {
            return false;
        }
        
        return true;
    },
    
    // Auto backup (save to localStorage)
    autoBackup() {
        const backup = this.create();
        localStorage.setItem('vtuber_auto_backup', JSON.stringify(backup));
        console.log('💾 Auto backup saved');
    },
    
    // Restore from auto backup
    restoreAutoBackup() {
        const backupStr = localStorage.getItem('vtuber_auto_backup');
        
        if (!backupStr) {
            console.log('No auto backup found');
            return false;
        }
        
        try {
            const backup = JSON.parse(backupStr);
            this.restore(backup);
            console.log('✅ Restored from auto backup');
            return true;
        } catch (error) {
            console.error('Failed to restore auto backup:', error);
            return false;
        }
    },
    
    // Clear all data
    clearAll() {
        if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
            return false;
        }
        
        if (!confirm('Really sure? All characters, products, orders, etc. will be deleted!')) {
            return false;
        }
        
        localStorage.clear();
        console.log('🗑️ All data cleared');
        
        if (window.VTuberApp) {
            VTuberApp.showToast('All data cleared', 'info');
        }
        
        return true;
    }
};

// Setup auto backup (every 30 minutes)
if (typeof document !== 'undefined') {
    setInterval(() => {
        Backup.autoBackup();
    }, 30 * 60 * 1000);
}

window.Backup = Backup;

console.log('✅ Backup module loaded');
