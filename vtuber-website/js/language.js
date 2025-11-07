// ================================================
// VTuber Studio - Multi-Language System
// ================================================

'use strict';

const Language = {
    // Current language
    current: 'th',
    
    // Supported languages
    supported: ['th', 'en', 'ja', 'zh'],
    
    // Language names
    names: {
        th: 'ไทย',
        en: 'English',
        ja: '日本語',
        zh: '中文'
    },
    
    // Translations
    translations: {
        // Navigation
        'nav.home': {
            en: 'Home',
            th: 'หน้าแรก',
            ja: 'ホーム',
            zh: '首页'
        },
        'nav.characters': {
            en: 'Characters',
            th: 'ตัวละคร',
            ja: 'キャラクター',
            zh: '角色'
        },
        'nav.music': {
            en: 'Music',
            th: 'เพลง',
            ja: '音楽',
            zh: '音乐'
        },
        'nav.shop': {
            en: 'Shop',
            th: 'ร้านค้า',
            ja: 'ショップ',
            zh: '商店'
        },
        'nav.gallery': {
            en: 'Gallery',
            th: 'แกลเลอรี',
            ja: 'ギャラリー',
            zh: '画廊'
        },
        'nav.schedule': {
            en: 'Schedule',
            th: 'ตารางไลฟ์',
            ja: 'スケジュール',
            zh: '日程'
        },
        'nav.about': {
            en: 'About',
            th: 'เกี่ยวกับ',
            ja: '私たちについて',
            zh: '关于'
        },
        
        // Common
        'common.loading': {
            en: 'Loading...',
            th: 'กำลังโหลด...',
            ja: '読み込み中...',
            zh: '加载中...'
        },
        'common.search': {
            en: 'Search',
            th: 'ค้นหา',
            ja: '検索',
            zh: '搜索'
        },
        'common.save': {
            en: 'Save',
            th: 'บันทึก',
            ja: '保存',
            zh: '保存'
        },
        'common.cancel': {
            en: 'Cancel',
            th: 'ยกเลิก',
            ja: 'キャンセル',
            zh: '取消'
        },
        'common.delete': {
            en: 'Delete',
            th: 'ลบ',
            ja: '削除',
            zh: '删除'
        },
        'common.edit': {
            en: 'Edit',
            th: 'แก้ไข',
            ja: '編集',
            zh: '编辑'
        },
        'common.add': {
            en: 'Add',
            th: 'เพิ่ม',
            ja: '追加',
            zh: '添加'
        },
        'common.view': {
            en: 'View',
            th: 'ดู',
            ja: '見る',
            zh: '查看'
        },
        'common.more': {
            en: 'More',
            th: 'เพิ่มเติม',
            ja: 'もっと',
            zh: '更多'
        },
        
        // Buttons
        'btn.viewMore': {
            en: 'View More',
            th: 'ดูเพิ่มเติม',
            ja: 'もっと見る',
            zh: '查看更多'
        },
        'btn.buyNow': {
            en: 'Buy Now',
            th: 'ซื้อเลย',
            ja: '今すぐ購入',
            zh: '立即购买'
        },
        'btn.addToCart': {
            en: 'Add to Cart',
            th: 'เพิ่มลงตะกร้า',
            ja: 'カートに追加',
            zh: '加入购物车'
        },
        'btn.checkout': {
            en: 'Checkout',
            th: 'ชำระเงิน',
            ja: 'チェックアウト',
            zh: '结账'
        },
        'btn.login': {
            en: 'Login',
            th: 'เข้าสู่ระบบ',
            ja: 'ログイン',
            zh: '登录'
        },
        'btn.logout': {
            en: 'Logout',
            th: 'ออกจากระบบ',
            ja: 'ログアウト',
            zh: '登出'
        },
        'btn.register': {
            en: 'Register',
            th: 'สมัครสมาชิก',
            ja: '登録',
            zh: '注册'
        },
        
        // Messages
        'msg.success': {
            en: 'Success!',
            th: 'สำเร็จ!',
            ja: '成功！',
            zh: '成功！'
        },
        'msg.error': {
            en: 'Error',
            th: 'ข้อผิดพลาด',
            ja: 'エラー',
            zh: '错误'
        },
        'msg.confirm': {
            en: 'Are you sure?',
            th: 'คุณแน่ใจหรือไม่?',
            ja: '本当によろしいですか？',
            zh: '你确定吗？'
        },
        'msg.noData': {
            en: 'No data available',
            th: 'ไม่มีข้อมูล',
            ja: 'データがありません',
            zh: '无数据'
        },
        
        // Forms
        'form.name': {
            en: 'Name',
            th: 'ชื่อ',
            ja: '名前',
            zh: '姓名'
        },
        'form.email': {
            en: 'Email',
            th: 'อีเมล',
            ja: 'メール',
            zh: '邮箱'
        },
        'form.password': {
            en: 'Password',
            th: 'รหัสผ่าน',
            ja: 'パスワード',
            zh: '密码'
        },
        'form.message': {
            en: 'Message',
            th: 'ข้อความ',
            ja: 'メッセージ',
            zh: '消息'
        },
        'form.required': {
            en: 'Required',
            th: 'จำเป็น',
            ja: '必須',
            zh: '必填'
        },
        
        // Shop
        'shop.cart': {
            en: 'Shopping Cart',
            th: 'ตะกร้าสินค้า',
            ja: 'ショッピングカート',
            zh: '购物车'
        },
        'shop.total': {
            en: 'Total',
            th: 'ยอดรวม',
            ja: '合計',
            zh: '总计'
        },
        'shop.inStock': {
            en: 'In Stock',
            th: 'มีสินค้า',
            ja: '在庫あり',
            zh: '有货'
        },
        'shop.outOfStock': {
            en: 'Out of Stock',
            th: 'สินค้าหมด',
            ja: '在庫切れ',
            zh: '缺货'
        },
        
        // Music
        'music.nowPlaying': {
            en: 'Now Playing',
            th: 'กำลังเล่น',
            ja: '再生中',
            zh: '正在播放'
        },
        'music.playlist': {
            en: 'Playlist',
            th: 'เพลย์ลิสต์',
            ja: 'プレイリスト',
            zh: '播放列表'
        },
        
        // Time
        'time.second': {
            en: 'second',
            th: 'วินาที',
            ja: '秒',
            zh: '秒'
        },
        'time.minute': {
            en: 'minute',
            th: 'นาที',
            ja: '分',
            zh: '分钟'
        },
        'time.hour': {
            en: 'hour',
            th: 'ชั่วโมง',
            ja: '時間',
            zh: '小时'
        },
        'time.day': {
            en: 'day',
            th: 'วัน',
            ja: '日',
            zh: '天'
        },
        'time.ago': {
            en: 'ago',
            th: 'ที่แล้ว',
            ja: '前',
            zh: '前'
        }
    },
    
    // Initialize
    init() {
        // Load saved language
        const saved = localStorage.getItem('vtuber_lang');
        if (saved && this.supported.includes(saved)) {
            this.current = saved;
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (this.supported.includes(browserLang)) {
                this.current = browserLang;
            }
        }
        
        // Setup toggle button
        this.setupToggle();
        
        // Update all elements
        this.update();
        
        console.log('🌐 Language system initialized:', this.current);
    },
    
    // Setup toggle button
    setupToggle() {
        const toggleButtons = document.querySelectorAll('.lang-toggle, #lang-toggle');
        
        toggleButtons.forEach(btn => {
            // Set initial text
            btn.textContent = this.current.toUpperCase();
            
            // Add click handler
            btn.addEventListener('click', () => {
                this.toggle();
            });
        });
    },
    
    // Toggle language
    toggle() {
        const currentIndex = this.supported.indexOf(this.current);
        const nextIndex = (currentIndex + 1) % this.supported.length;
        this.current = this.supported[nextIndex];
        
        this.save();
        this.update();
        
        // Update toggle buttons
        document.querySelectorAll('.lang-toggle, #lang-toggle').forEach(btn => {
            btn.textContent = this.current.toUpperCase();
        });
        
        console.log('🌐 Language changed to:', this.current);
        
        // Show toast
        if (window.VTuberApp) {
            VTuberApp.showToast(`Language: ${this.names[this.current]}`, 'info');
        }
    },
    
    // Set language
    set(lang) {
        if (!this.supported.includes(lang)) {
            console.warn('Unsupported language:', lang);
            return false;
        }
        
        this.current = lang;
        this.save();
        this.update();
        
        return true;
    },
    
    // Save to localStorage
    save() {
        localStorage.setItem('vtuber_lang', this.current);
    },
    
    // Update all text elements
    update() {
        // Update elements with data-lang attributes
        document.querySelectorAll('[data-lang-en]').forEach(el => {
            const key = `data-lang-${this.current}`;
            const text = el.getAttribute(key);
            
            if (text) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = text;
                } else {
                    el.textContent = text;
                }
            }
        });
        
        // Update elements with data-translate
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            const translation = this.get(key);
            
            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });
        
        // Update document language
        document.documentElement.lang = this.current;
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.current }
        }));
    },
    
    // Get translation
    get(key, lang = null) {
        const targetLang = lang || this.current;
        const translation = this.translations[key];
        
        if (!translation) {
            console.warn('Translation not found:', key);
            return key;
        }
        
        return translation[targetLang] || translation.en || key;
    },
    
    // Add translation
    add(key, translations) {
        this.translations[key] = translations;
    },
    
    // Format number based on language
    formatNumber(number) {
        return new Intl.NumberFormat(this.getLocale()).format(number);
    },
    
    // Format currency
    formatCurrency(amount, currency = 'THB') {
        return new Intl.NumberFormat(this.getLocale(), {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    // Format date
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        return new Intl.DateTimeFormat(this.getLocale(), {
            ...defaultOptions,
            ...options
        }).format(date);
    },
    
    // Format time
    formatTime(date, options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Intl.DateTimeFormat(this.getLocale(), {
            ...defaultOptions,
            ...options
        }).format(date);
    },
    
    // Format relative time (e.g., "2 hours ago")
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days} ${this.get('time.day')}${days > 1 ? 's' : ''} ${this.get('time.ago')}`;
        } else if (hours > 0) {
            return `${hours} ${this.get('time.hour')}${hours > 1 ? 's' : ''} ${this.get('time.ago')}`;
        } else if (minutes > 0) {
            return `${minutes} ${this.get('time.minute')}${minutes > 1 ? 's' : ''} ${this.get('time.ago')}`;
        } else {
            return `${seconds} ${this.get('time.second')}${seconds > 1 ? 's' : ''} ${this.get('time.ago')}`;
        }
    },
    
    // Get locale string
    getLocale() {
        const localeMap = {
            th: 'th-TH',
            en: 'en-US',
            ja: 'ja-JP',
            zh: 'zh-CN'
        };
        
        return localeMap[this.current] || 'en-US';
    },
    
    // Get text direction (for RTL languages)
    getDirection() {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(this.current) ? 'rtl' : 'ltr';
    }
};

// Auto-initialize
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        Language.init();
    });
}

// Export
window.Language = Language;

console.log('✅ Language module loaded (Full Version)');
