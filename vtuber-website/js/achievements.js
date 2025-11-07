// ================================================
// VTuber Studio - Achievements System
// ================================================

'use strict';

const ACHIEVEMENTS = [
    {
        id: 'first_visit',
        name: 'First Steps',
        nameTh: 'ก้าวแรก',
        description: 'Visit the website for the first time',
        descriptionTh: 'เยี่ยมชมเว็บไซต์ครั้งแรก',
        icon: '🎉',
        points: 10,
        category: 'general'
    },
    {
        id: 'character_collector',
        name: 'Character Collector',
        nameTh: 'นักสะสมตัวละคร',
        description: 'View all characters',
        descriptionTh: 'ดูตัวละครทั้งหมด',
        icon: '👥',
        points: 50,
        category: 'characters'
    },
    {
        id: 'music_lover',
        name: 'Music Lover',
        nameTh: 'คนรักเพลง',
        description: 'Listen to 10 songs',
        descriptionTh: 'ฟังเพลง 10 เพลง',
        icon: '🎵',
        points: 30,
        category: 'music'
    },
    {
        id: 'big_spender',
        name: 'Big Spender',
        nameTh: 'นักช้อปใหญ่',
        description: 'Make a purchase over ฿1000',
        descriptionTh: 'ซื้อสินค้ามูลค่าเกิน ฿1000',
        icon: '💰',
        points: 100,
        category: 'shop'
    },
    {
        id: 'chat_master',
        name: 'Chat Master',
        nameTh: 'ผู้เชี่ยวชาญแชท',
        description: 'Send 100 chat messages',
        descriptionTh: 'ส่งข้อความแชท 100 ครั้ง',
        icon: '💬',
        points: 50,
        category: 'social'
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        nameTh: 'นกตื่นเช้า',
        description: 'Visit before 6 AM',
        descriptionTh: 'เข้าชมก่อน 6 โมงเช้า',
        icon: '🌅',
        points: 20,
        category: 'general'
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        nameTh: 'นกฮูกกลางคืน',
        description: 'Visit after midnight',
        descriptionTh: 'เข้าชมหลังเที่ยงคืน',
        icon: '🦉',
        points: 20,
        category: 'general'
    },
    {
        id: 'loyal_fan',
        name: 'Loyal Fan',
        nameTh: 'แฟนคลับผู้ภักดี',
        description: 'Visit 7 days in a row',
        descriptionTh: 'เข้าชม 7 วันติดต่อกัน',
        icon: '⭐',
        points: 100,
        category: 'general'
    },
    {
        id: 'gallery_explorer',
        name: 'Gallery Explorer',
        nameTh: 'นักสำรวจแกลเลอรี',
        description: 'View all gallery images',
        descriptionTh: 'ดูรูปในแกลเลอรีทั้งหมด',
        icon: '🖼️',
        points: 40,
        category: 'gallery'
    },
    {
        id: 'schedule_keeper',
        name: 'Schedule Keeper',
        nameTh: 'ผู้รักษาตาราง',
        description: 'Check schedule 10 times',
        descriptionTh: 'ตรวจสอบตารางไลฟ์ 10 ครั้ง',
        icon: '📅',
        points: 30,
        category: 'schedule'
    }
];

let userAchievements = [];
let achievementStats = {
    totalPoints: 0,
    unlockedCount: 0
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAchievements();
    checkAchievements();
    renderAchievements();
});

// ================================================
// Load & Save
// ================================================

function loadAchievements() {
    userAchievements = DB.get('achievements') || [];
    calculateStats();
}

function saveAchievements() {
    DB.set('achievements', userAchievements);
    calculateStats();
}

function calculateStats() {
    achievementStats.unlockedCount = userAchievements.length;
    achievementStats.totalPoints = userAchievements.reduce((sum, id) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        return sum + (achievement?.points || 0);
    }, 0);
}

// ================================================
// Check & Unlock
// ================================================

function checkAchievements() {
    // First visit
    checkAchievement('first_visit', () => true);
    
    // Time-based
    const hour = new Date().getHours();
    if (hour < 6) {
        checkAchievement('early_bird', () => true);
    }
    if (hour >= 0 && hour < 1) {
        checkAchievement('night_owl', () => true);
    }
    
    // Visit streak
    checkVisitStreak();
    
    // Character collector
    const charactersViewed = DB.get('characters_viewed') || [];
    const totalCharacters = DB.getCharacters().length;
    if (charactersViewed.length >= totalCharacters && totalCharacters > 0) {
        checkAchievement('character_collector', () => true);
    }
    
    // Music lover
    const songsPlayed = DB.get('songs_played') || [];
    checkAchievement('music_lover', () => songsPlayed.length >= 10);
    
    // Chat master
    const chatCount = DB.getChatMessages().length;
    checkAchievement('chat_master', () => chatCount >= 100);
    
    // Gallery explorer
    const galleryViewed = DB.get('gallery_viewed') || [];
    const totalGallery = DB.getGalleryImages().length;
    if (galleryViewed.length >= totalGallery && totalGallery > 0) {
        checkAchievement('gallery_explorer', () => true);
    }
}

function checkAchievement(id, condition) {
    if (userAchievements.includes(id)) return;
    
    if (condition()) {
        unlockAchievement(id);
    }
}

function unlockAchievement(id) {
    if (userAchievements.includes(id)) return;
    
    userAchievements.push(id);
    saveAchievements();
    
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (achievement) {
        showAchievementNotification(achievement);
    }
}

function checkVisitStreak() {
    const visits = DB.get('visit_dates') || [];
    const today = new Date().toDateString();
    
    if (!visits.includes(today)) {
        visits.push(today);
        DB.set('visit_dates', visits);
    }
    
    // Check for 7-day streak
    if (visits.length >= 7) {
        const last7Days = visits.slice(-7);
        const isStreak = last7Days.every((date, index) => {
            if (index === 0) return true;
            const prevDate = new Date(last7Days[index - 1]);
            const currDate = new Date(date);
            const diff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
            return diff === 1;
        });
        
        if (isStreak) {
            checkAchievement('loyal_fan', () => true);
        }
    }
}

// ================================================
// Render Achievements
// ================================================

function renderAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    const lang = App.currentLang || 'th';
    
    const categories = ['general', 'characters', 'music', 'shop', 'social', 'gallery', 'schedule'];
    
    container.innerHTML = categories.map(category => {
        const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category);
        
        if (categoryAchievements.length === 0) return '';
        
        return `
            <div class="achievement-category">
                <h3 class="category-title">${getCategoryName(category, lang)}</h3>
                <div class="achievements-grid">
                    ${categoryAchievements.map(achievement => renderAchievementCard(achievement, lang)).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    // Update stats
    updateAchievementStats();
}

function renderAchievementCard(achievement, lang) {
    const isUnlocked = userAchievements.includes(achievement.id);
    const name = lang === 'th' ? achievement.nameTh : achievement.name;
    const description = lang === 'th' ? achievement.descriptionTh : achievement.description;
    
    return `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <h4 class="achievement-name">${name}</h4>
                <p class="achievement-description">${description}</p>
                <div class="achievement-points">
                    <span class="points-icon">⭐</span>
                    <span>${achievement.points} points</span>
                </div>
            </div>
            ${isUnlocked ? '<div class="achievement-badge">✓</div>' : ''}
        </div>
    `;
}

function updateAchievementStats() {
    document.getElementById('total-achievements').textContent = `${achievementStats.unlockedCount}/${ACHIEVEMENTS.length}`;
    document.getElementById('total-points').textContent = achievementStats.totalPoints;
    
    const progress = (achievementStats.unlockedCount / ACHIEVEMENTS.length) * 100;
    document.getElementById('achievement-progress').style.width = `${progress}%`;
}

// ================================================
// Notification
// ================================================

function showAchievementNotification(achievement) {
    const lang = App.currentLang || 'th';
    const name = lang === 'th' ? achievement.nameTh : achievement.name;
    
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <div class="achievement-notification-icon">${achievement.icon}</div>
            <div class="achievement-notification-text">
                <div class="achievement-notification-title">${lang === 'th' ? 'ปลดล็อกความสำเร็จ!' : 'Achievement Unlocked!'}</div>
                <div class="achievement-notification-name">${name}</div>
                <div class="achievement-notification-points">+${achievement.points} points</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ================================================
// Utilities
// ================================================

function getCategoryName(category, lang) {
    const names = {
        general: { en: 'General', th: 'ทั่วไป' },
        characters: { en: 'Characters', th: 'ตัวละคร' },
        music: { en: 'Music', th: 'เพลง' },
        shop: { en: 'Shopping', th: 'ช้อปปิ้ง' },
        social: { en: 'Social', th: 'โซเชียล' },
        gallery: { en: 'Gallery', th: 'แกลเลอรี' },
        schedule: { en: 'Schedule', th: 'ตารางไลฟ์' }
    };
    
    return names[category]?.[lang] || category;
}

// Track actions
window.trackAchievement = {
    characterViewed: (id) => {
        const viewed = DB.get('characters_viewed') || [];
        if (!viewed.includes(id)) {
            viewed.push(id);
            DB.set('characters_viewed', viewed);
            checkAchievements();
        }
    },
    
    songPlayed: (id) => {
        const played = DB.get('songs_played') || [];
        if (!played.includes(id)) {
            played.push(id);
            DB.set('songs_played', played);
            checkAchievements();
        }
    },
    
    galleryViewed: (id) => {
        const viewed = DB.get('gallery_viewed') || [];
        if (!viewed.includes(id)) {
            viewed.push(id);
            DB.set('gallery_viewed', viewed);
            checkAchievements();
        }
    },
    
    purchase: (amount) => {
        if (amount >= 1000) {
            checkAchievement('big_spender', () => true);
        }
    },
    
    scheduleViewed: () => {
        const count = DB.get('schedule_viewed_count') || 0;
        DB.set('schedule_viewed_count', count + 1);
        checkAchievement('schedule_keeper', () => count + 1 >= 10);
    }
};

console.log('🏆 Achievements system loaded');
